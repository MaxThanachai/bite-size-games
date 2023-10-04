import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CheckersService } from './checkers.service';
import { v4 as uuidv4 } from 'uuid';
import { MOVE_TYPE, PLAYER } from './interfaces/checkers.enum';
import {
  IPosition,
  IAttackGrid,
  IPiece,
  IMoveResponse,
} from './interfaces/checkers.interface';

@Component({
  selector: 'app-checker',
  templateUrl: './checkers.component.html',
  styleUrls: ['./checkers.component.scss'],
})
export class CheckersComponent implements OnInit {
  PLAYER = PLAYER;

  roomId: string = '';
  playerId!: string;
  playerColor: PLAYER = PLAYER.WHITE;

  logMessages: string[] = [];

  pieces: IPiece[] = [];
  selectingPiece: IPiece | null = null;
  chainAttackingPiece: IPiece | null = null;

  possibleMoves: IPosition[] = [];
  possibleAttacks: IAttackGrid[] = [];
  piecesWithAttackMoves: IPiece[] = [];

  currentTurn: PLAYER = PLAYER.BLACK;

  constructor(
    private checkersService: CheckersService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.playerId = this.checkersService.getPlayerId();
    this.joinRoom();
  }

  async joinRoom(): Promise<void> {
    this.logMessages.push(`Joined room`);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      this.roomId = urlParams.get('room') ?? '';
      if (!this.roomId) {
        throw new Error('Missing room id');
      }
      const eventSource = await this.checkersService.joinRoom(this.roomId);
      eventSource.onmessage = ({ data }) => {
        const parsedData = JSON.parse(data) as IMoveResponse;
        this.interpretMessagesFromStream(parsedData);
      };
    } catch (e) {
      console.error(e);
    }
  }

  getBoardLength(): number[] {
    if (this.playerColor === PLAYER.BLACK) return [0, 1, 2, 3, 4, 5, 6, 7];
    else return [7, 6, 5, 4, 3, 2, 1, 0];
  }

  getRemainingPieces(player: PLAYER): number {
    return this.pieces.filter((piece) => piece.player === player).length;
  }

  isPossibleMoveGrid(x: number, y: number): boolean {
    if (!this.selectingPiece) return false;
    return Boolean(
      this.possibleMoves.find((grid) => grid.x === x && grid.y === y)
    );
  }

  isPossibleAttackGrid(x: number, y: number): boolean {
    if (!this.selectingPiece) return false;
    return Boolean(
      this.possibleAttacks.find(
        (grid) => grid.landingGrid.x === x && grid.landingGrid.y === y
      )
    );
  }

  isPieceWithAttackMove(x: number, y: number): boolean {
    return Boolean(
      this.piecesWithAttackMoves.find(
        (piece) => piece.position.x === x && piece.position.y === y
      )
    );
  }

  isChainAttackingPiece(x: number, y: number): boolean {
    return Boolean(
      this.chainAttackingPiece &&
        this.isEqualPosition({ x, y }, this.chainAttackingPiece.position)
    );
  }

  isValidLandingGrid(x: number, y: number) {
    return this.isInBoard(x, y) && this.getPieceAt(x, y) === null;
  }

  isInBoard(x: number, y: number): boolean {
    return x >= 0 && x <= 7 && y >= 0 && y <= 7;
  }

  isIncludedPieces(pieces: IPiece[], targetPiece: IPiece): boolean {
    return (
      pieces.filter(
        (piece) =>
          piece.player === targetPiece.player &&
          this.isEqualPosition(piece.position, targetPiece.position)
      ).length > 0
    );
  }

  isEqualPosition(position1: IPosition, position2: IPosition) {
    return position1.x === position2.x && position1.y === position2.y;
  }

  getDirection(piece: IPiece): number {
    return piece.player === 'black' ? -1 : 1;
  }

  getPieceAt(x: number, y: number): IPiece | null {
    const index = this.pieces.findIndex(
      (piece) => piece.position.x === x && piece.position.y === y
    );
    if (index === -1) return null;
    return this.pieces[index];
  }

  isMovablePiece(piece: IPiece): boolean {
    return (
      piece.player === this.currentTurn &&
      (!this.chainAttackingPiece ||
        this.isEqualPosition(
          this.chainAttackingPiece.position,
          piece.position
        )) &&
      (!this.piecesWithAttackMoves.length ||
        this.isIncludedPieces(this.piecesWithAttackMoves, piece))
    );
  }

  calculatePossibleMoves(selectedPiece: IPiece): void {
    this.possibleMoves = [];
    this.possibleAttacks = [];
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
          selectedPiece.position.x + direction.x * i,
          selectedPiece.position.y + direction.y * i
        );
        if (!piece) {
          this.possibleMoves.push({
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
        if (this.isValidLandingGrid(landingGrid.x, landingGrid.y)) {
          this.possibleAttacks.push({ landingGrid, enemyPiece });
        }
      }
    }
    if (this.possibleAttacks.length) {
      this.possibleMoves = [];
    }
  }

  onTapGrid(x: number, y: number): void {
    this.logMessages.push(`tap ${x}, ${y}`);
    if (this.currentTurn !== this.playerColor) {
      this.logMessages.push(
        'Please wait for another player to finish the turn'
      );
      return;
    }
    const piece = this.getPieceAt(x, y);
    if (piece && this.isMovablePiece(piece)) {
      this.selectPiece(piece);
    } else if (
      this.selectingPiece !== null &&
      this.isPossibleMoveGrid(x, y) &&
      !this.chainAttackingPiece
    ) {
      this.callMove(x, y);
    } else if (
      this.selectingPiece !== null &&
      this.isPossibleAttackGrid(x, y)
    ) {
      this.callAttack(x, y);
    } else if (this.selectingPiece !== null && !this.chainAttackingPiece) {
      this.deselectPiece();
    }
  }

  selectPiece(piece: IPiece): void {
    this.selectingPiece = piece;
    this.calculatePossibleMoves(piece);
    this.logMessages.push(
      `selecting ${piece.position.x}, ${piece.position.y} ${piece.player} ${
        piece.isPromoted ? '*' : ''
      }`
    );
  }

  deselectPiece(): void {
    this.selectingPiece = null;
    this.possibleMoves = [];
    this.possibleAttacks = [];
    this.logMessages.push(`Deselected`);
  }

  endTurn(): void {
    this.chainAttackingPiece = null;
    this.logMessages.push(`${this.currentTurn.valueOf()}'s turn`);
    this.checkForceAttacks();
  }

  checkForceAttacks(): void {
    const piecesOfCurrentPlayer = this.pieces.filter(
      (piece) => piece.player === this.currentTurn
    );
    this.piecesWithAttackMoves = [];
    piecesOfCurrentPlayer.forEach((piece) => {
      this.calculatePossibleMoves(piece);
      if (this.possibleAttacks.length) {
        this.piecesWithAttackMoves.push(piece);
        this.logMessages.push(
          `Piece with possible attack move(s): ${piece.position.x}, ${piece.position.y}
          `
        );
      }
    });
  }

  // TODO: Move to BE
  // checkGameEnded(): void {
  //   const blackPieces = this.pieces.filter(
  //     (piece) => piece.player === PLAYER.BLACK
  //   );
  //   const whitePieces = this.pieces.filter(
  //     (piece) => piece.player === PLAYER.WHITE
  //   );
  //   if (!blackPieces.length) {
  //     this.logMessages.push(`Player white win`);
  //   } else if (!whitePieces.length) {
  //     this.logMessages.push(`Player black win`);
  //   } else {
  //     return;
  //   }
  //   this.resetGame();
  //   this.logMessages.push(`-------------------------------`);
  // }

  onPressedSurrender(): void {
    if (window.confirm('Do you really want to surrender?')) {
      // TODO: Move to BE
      // this.deselectPiece();
      // this.logMessages.push(`Player ${this.currentTurn} surrendered`);
      // this.resetGame();
      // this.logMessages.push(`-------------------------------`);
    }
  }

  // TODO: Move to BE
  // resetGame(): void {
  //   this.instantiatePieces();
  // }

  interpretMessagesFromStream(move: IMoveResponse): void {
    console.log(move);
    this.currentTurn = move.currentTurn.playerColor;
    this.pieces = move.pieces || [];
    this.possibleMoves = [];
    this.possibleAttacks = [];
    this.piecesWithAttackMoves = [];
    this.deselectPiece();
    if (move.moveType === MOVE_TYPE.GAME_START) {
      this.logMessages.push(`Game start`);
      this.logMessages.push(`${this.currentTurn.valueOf()}'s turn`);
      this.playerColor =
        this.playerId === move.currentTurn.playerId
          ? PLAYER.BLACK
          : PLAYER.WHITE;
    }
    if (move.moveType === MOVE_TYPE.END_TURN) {
      this.endTurn();
    }
    if (
      move.moveType === MOVE_TYPE.ATTACK &&
      move.chainAttackingPiecePosition
    ) {
      this.setChainAttack(move);
    }
    this.changeDetectorRef.detectChanges();
  }

  setChainAttack(move: IMoveResponse): void {
    this.chainAttackingPiece = this.getPieceAt(
      move.chainAttackingPiecePosition!.x,
      move.chainAttackingPiecePosition!.y
    );
    if (!this.chainAttackingPiece) {
      const msg = 'Invalid force selecting message from the server';
      this.logMessages.push(msg);
      console.error(msg);
    } else this.selectPiece(this.chainAttackingPiece);
  }

  callMove(x: number, y: number): void {
    if (!this.selectingPiece) return;
    this.checkersService.move(this.roomId, {
      player: { playerId: this.playerId, playerColor: this.playerColor },
      moveType: MOVE_TYPE.MOVE,
      pieceInitialPosition: this.selectingPiece?.position,
      landingGrid: { x, y },
    });
  }

  callAttack(x: number, y: number): void {
    const attackGrid = this.possibleAttacks.find(
      (grid) => grid.landingGrid.x === x && grid.landingGrid.y === y
    );
    if (!attackGrid || !this.selectingPiece) return;
    this.checkersService.move(this.roomId, {
      player: { playerId: this.playerId, playerColor: this.playerColor },
      moveType: MOVE_TYPE.ATTACK,
      pieceInitialPosition: this.selectingPiece.position,
      landingGrid: attackGrid.landingGrid,
      enemyPiecePosition: attackGrid.enemyPiece.position,
    });
  }
}
