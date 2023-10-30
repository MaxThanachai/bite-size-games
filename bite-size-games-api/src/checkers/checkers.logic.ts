import { Injectable } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';
import { ReplaySubject } from 'rxjs';

import {
  IAttackGrid,
  IMove,
  IPiece,
  IPosition,
  IRoom,
} from './checkers.interface';
import { MOVE_TYPE, PLAYER } from './checkers.enum';

@Injectable()
export class CheckersLogic {
  getRooms(playerId: string, rooms: IRoom[]) {
    return rooms
      .filter(
        (room) =>
          room.players.length < 2 ||
          room.players.filter((player) => player.playerId === playerId).length >
            0,
      )
      .map((room) => {
        return {
          id: room.id,
          name: room.name,
        };
      });
  }

  isPlayerInRoom(playerId: string, room: IRoom): boolean {
    return (
      room.players.find((player) => player.playerId === playerId) !== undefined
    );
  }

  createNewRoom(name: string): IRoom {
    const id = uuidv4();
    const newRoom = {
      id,
      name: name,
      players: [],
      currentTurn: null,
      moves: new ReplaySubject<IMove>(),
    } as IRoom;
    newRoom.pieces = [];
    for (let i = 0; i < 8; i++) {
      newRoom.pieces.push({
        player: PLAYER.BLACK,
        isPromoted: false,
        position: {
          x: i,
          y: 6 + (i % 2),
        },
      });
    }
    for (let i = 0; i < 8; i++) {
      newRoom.pieces.push({
        player: PLAYER.WHITE,
        isPromoted: false,
        position: { x: i, y: i % 2 },
      });
    }
    return newRoom;
  }

  calculatePossibleMoves(
    selectedPiece: IPiece,
    room: IRoom,
  ): { possibleMoves: IPosition[]; possibleAttacks: IAttackGrid[] } {
    const possibleMoves: IPosition[] = [];
    const possibleAttacks: IAttackGrid[] = [];
    const yMultiplier = this.getDirection(selectedPiece);
    const range = selectedPiece.isPromoted ? 7 : 1;
    let directions: IPosition[] = [
      { x: -1, y: 1 * yMultiplier },
      { x: 1, y: 1 * yMultiplier },
    ];
    if (selectedPiece.isPromoted)
      directions = directions.concat([
        { x: -1, y: -1 * yMultiplier },
        { x: 1, y: -1 * yMultiplier },
      ]);
    for (const direction of directions) {
      let enemyPiece: IPiece | null = null;
      for (let i = 1; i <= range; i++) {
        const piece = this.getPieceAt(
          {
            x: selectedPiece.position.x + direction.x * i,
            y: selectedPiece.position.y + direction.y * i,
          },
          room,
        );
        if (!piece) {
          possibleMoves.push({
            x: selectedPiece.position.x + direction.x * i,
            y: selectedPiece.position.y + direction.y * i,
          });
        } else if (piece.player !== selectedPiece.player) {
          enemyPiece = piece;
          break;
        } else {
          break;
        }
      }
      if (enemyPiece) {
        const landingGrid: IPosition = {
          x: enemyPiece.position.x + direction.x,
          y: enemyPiece.position.y + direction.y,
        };
        if (this.isValidLandingGrid(landingGrid, room)) {
          possibleAttacks.push({ landingGrid, enemyPiece });
        }
      }
    }
    return {
      possibleAttacks,
      possibleMoves: possibleAttacks.length ? [] : possibleMoves,
    };
  }

  isValidMove(move: IMove, room: IRoom) {
    const movingPiece = this.getPieceAt(move.pieceInitialPosition, room);

    if (!movingPiece)
      throw new Error('Try to move a piece that does not exist');
    if (movingPiece.player !== room.currentTurn.playerColor)
      throw new Error('Try to move a piece that belong to another player');

    const pieces = room.pieces.filter(
      (piece) => piece.player === room.currentTurn.playerColor,
    );

    const piecesWithAttackMoves = pieces.filter(
      (piece) =>
        this.calculatePossibleMoves(piece, room).possibleAttacks.length,
    );
    if (piecesWithAttackMoves.length && move.moveType !== MOVE_TYPE.ATTACK)
      throw new Error('Try to move a piece while in a force-attack turn');

    const { possibleAttacks, possibleMoves } = this.calculatePossibleMoves(
      movingPiece,
      room,
    );

    const checkPossibleMove = possibleMoves.find((position) =>
      this.isEqualPosition(position, move.landingGrid),
    );
    if (move.moveType === MOVE_TYPE.MOVE && !checkPossibleMove)
      throw new Error('Invalid move');

    const checkPossibleAttack = possibleAttacks.find((attackGrid) =>
      this.isEqualPosition(attackGrid.landingGrid, move.landingGrid),
    );
    if (move.moveType === MOVE_TYPE.ATTACK && !checkPossibleAttack)
      throw new Error('Invalid attack move');

    if (
      move.moveType === MOVE_TYPE.ATTACK &&
      checkPossibleAttack &&
      !this.isEqualPosition(
        move.enemyPiecePosition,
        checkPossibleAttack.enemyPiece.position,
      )
    )
      throw new Error(
        'Try to attack a piece that is not within the moving path',
      );
  }

  onMove(move: IMove, room: IRoom) {
    const movingPiece = this.getPieceAt(move.pieceInitialPosition, room);
    movingPiece.position = move.landingGrid;

    const enemyPiece = move.enemyPiecePosition
      ? this.getPieceAt(move.enemyPiecePosition, room)
      : undefined;
    if (enemyPiece) {
      room.pieces.splice(this.getPieceIndex(enemyPiece.position, room), 1);
    }

    this.checkPromoted(movingPiece);

    const isChainAttack =
      move.moveType === MOVE_TYPE.ATTACK &&
      this.checkChainAttack(movingPiece, room);
    room.moves.next({
      ...move,
      currentTurn: move.player,
      pieces: room.pieces,
      chainAttackingPiecePosition: isChainAttack ? move.landingGrid : undefined,
    });
    if (!isChainAttack) this.endTurn(room);
  }

  endTurn(room: IRoom): void {
    const nextPlayer = room.players.find(
      (player) => player.playerColor !== room.currentTurn.playerColor,
    );
    room.moves.next({
      moveType: MOVE_TYPE.END_TURN,
      currentTurn: nextPlayer,
      pieces: room.pieces,
    });
  }

  checkPromoted(piece: IPiece): void {
    if (!piece || piece.isPromoted) return;
    const direction = this.getDirection(piece);
    if (
      (direction === -1 && piece.position.y === 0) ||
      (direction === 1 && piece.position.y === 7)
    ) {
      piece.isPromoted = true;
    }
  }

  checkChainAttack(movingPiece: IPiece, room: IRoom): boolean {
    const { possibleAttacks } = this.calculatePossibleMoves(movingPiece, room);
    return possibleAttacks.length > 0;
  }

  getDirection(piece: IPiece): number {
    return piece.player === 'black' ? -1 : 1;
  }

  getPieceAt(position: IPosition, room: IRoom): IPiece | null {
    return (
      room.pieces.find(
        (piece) =>
          piece.position.x === position.x && piece.position.y === position.y,
      ) ?? null
    );
  }

  getPieceIndex(position: IPosition, room: IRoom): number {
    return room.pieces.findIndex((piece) =>
      this.isEqualPosition(piece.position, position),
    );
  }

  isValidLandingGrid(position: IPosition, room: IRoom) {
    return this.isInBoard(position) && this.getPieceAt(position, room) === null;
  }

  isInBoard(position: IPosition): boolean {
    return (
      position.x >= 0 && position.x <= 7 && position.y >= 0 && position.y <= 7
    );
  }

  isEqualPosition(position1: IPosition, position2: IPosition) {
    return position1.x === position2.x && position1.y === position2.y;
  }
}
