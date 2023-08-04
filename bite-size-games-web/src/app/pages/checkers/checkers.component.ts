import { Component, OnInit } from '@angular/core';

interface IPiece {
  player: PLAYER;
  isPromoted: boolean;
  position: IPosition;
}

enum PLAYER {
  BLACK = 'black',
  WHITE = 'white',
}

interface IPosition {
  x: number;
  y: number;
}

interface IAttackGrid {
  landingGrid: IPosition;
  enemyPiece: IPiece;
}

@Component({
  selector: 'app-checker',
  templateUrl: './checkers.component.html',
  styleUrls: ['./checkers.component.scss'],
})
export class CheckersComponent implements OnInit {
  logMessages: string[] = [];

  pieces: IPiece[] = [];
  selectingPiece: IPiece | null = null;
  possibleMoves: IPosition[] = [];
  possibleAttacks: IAttackGrid[] = [];
  piecesWithAttackMoves: IPiece[] = [];
  currentTurn: PLAYER = PLAYER.BLACK;
  isChainAttacking = false;

  constructor() {}

  ngOnInit(): void {
    this.instantiatePieces();
    this.logMessages.push(`Game start!`);
    this.logMessages.push(`${this.currentTurn.valueOf()}'s turn`);
  }

  instantiatePieces(): void {
    for (let i = 0; i < 8; i++) {
      this.pieces.push({
        player: PLAYER.BLACK,
        isPromoted: false,
        position: {
          x: i,
          y: 6 + (i % 2),
        },
      });
    }
    for (let i = 0; i < 8; i++) {
      this.pieces.push({
        player: PLAYER.WHITE,
        isPromoted: false,
        position: { x: i, y: i % 2 },
      });
    }
  }

  getBoardLength(direction: 1 | -1): number[] {
    if (direction === 1) return [0, 1, 2, 3, 4, 5, 6, 7];
    else return [7, 6, 5, 4, 3, 2, 1, 0];
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

  isValidLandingGrid(x: number, y: number) {
    return this.isInBoard(x, y) && this.getPieceAt(x, y) === null;
  }

  isInBoard(x: number, y: number): boolean {
    return x >= 0 && x <= 7 && y >= 0 && y <= 7;
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

  onTapGrid(x: number, y: number): void {
    this.logMessages.push(`tap ${x}, ${y}`);
    const piece = this.getPieceAt(x, y);
    if (piece && this.isMovablePiece(piece)) {
      this.selectPiece(piece);
    } else if (
      this.selectingPiece !== null &&
      this.isPossibleMoveGrid(x, y) &&
      !this.isChainAttacking
    ) {
      this.movePieceAndProgressToNextTurn(x, y);
    } else if (
      this.selectingPiece !== null &&
      this.isPossibleAttackGrid(x, y)
    ) {
      this.attackAndProgress(x, y);
    } else if (this.selectingPiece !== null && !this.isChainAttacking) {
      this.deselectPiece();
    }
  }

  isMovablePiece(piece: IPiece): boolean {
    return (
      piece.player === this.currentTurn &&
      !this.isChainAttacking &&
      (!this.piecesWithAttackMoves.length ||
        this.piecesWithAttackMoves.includes(piece))
    );
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

  movePieceAndProgressToNextTurn(x: number, y: number): void {
    if (!this.selectingPiece) return;
    this.selectingPiece.position.x = x;
    this.selectingPiece.position.y = y;
    this.endTurn();
  }

  checkPromoted(piece: IPiece | null): void {
    if (!piece || piece.isPromoted) return;
    const direction = this.getDirection(piece);
    if (
      (direction === -1 && piece.position.y === 0) ||
      (direction === 1 && piece.position.y === 7)
    ) {
      piece.isPromoted = true;
      this.logMessages.push(`Promoted a piece of player: ${this.currentTurn}`);
    }
  }

  attackAndProgress(x: number, y: number): void {
    const attackGrid = this.possibleAttacks.find(
      (grid) => grid.landingGrid.x === x && grid.landingGrid.y === y
    );
    if (!attackGrid || !this.selectingPiece) return;
    this.selectingPiece.position.x = x;
    this.selectingPiece.position.y = y;
    const enemyPieceIndex = this.pieces.findIndex(
      (piece) => piece === attackGrid.enemyPiece
    );
    if (enemyPieceIndex === -1) return;
    this.pieces.splice(enemyPieceIndex, 1);
    if (this.selectingPiece.isPromoted) {
      this.isChainAttacking = true;
      this.chainAttack(this.selectingPiece);
    } else {
      this.endTurn();
    }
  }

  chainAttack(selectingPiece: IPiece): void {
    this.calculatePossibleMoves(selectingPiece);
    this.possibleMoves = [];
    if (!this.possibleAttacks.length) {
      this.isChainAttacking = false;
      this.endTurn();
    }
  }

  endTurn(): void {
    this.checkPromoted(this.selectingPiece);
    this.deselectPiece();
    this.currentTurn =
      this.currentTurn === PLAYER.BLACK ? PLAYER.WHITE : PLAYER.BLACK;
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

  // TODO: Display promoted pieces
}
