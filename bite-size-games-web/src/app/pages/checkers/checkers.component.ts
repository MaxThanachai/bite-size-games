import { Component, OnInit } from '@angular/core';

interface IPiece extends IPosition {
  player: PLAYER;
  isPromoted: boolean;
}

enum PLAYER {
  BLACK = 'black',
  WHITE = 'white',
}

interface IPosition {
  x: number;
  y: number;
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
  possibleMoveGrids: IPosition[] = [];
  currentTurn: PLAYER = PLAYER.BLACK;

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
        x: i,
        y: 6 + (i % 2),
      });
    }
    for (let i = 0; i < 8; i++) {
      this.pieces.push({
        player: PLAYER.WHITE,
        isPromoted: false,
        x: i,
        y: i % 2,
      });
    }
  }

  isPossibleMoveGrid(x: number, y: number): boolean {
    if (this.selectingPiece === undefined) return false;
    return Boolean(
      this.possibleMoveGrids.find((grid) => grid.x === x && grid.y === y)
    );
  }

  drawPossibleMoveGrid(selectedPiece: IPiece): void {
    this.possibleMoveGrids = [];
    const direction = this.getDirection(selectedPiece);
    const range = selectedPiece.isPromoted ? 7 : 1;
    for (let i = 1; i <= range; i++) {
      const xVariance = [selectedPiece.x - i, selectedPiece.x + i];
      const y = selectedPiece.y + 1 * direction;
      const isContainPieceL = Boolean(this.getPieceAt(xVariance[0], y));
      const isContainPieceR = Boolean(this.getPieceAt(xVariance[1], y));
      if (!isContainPieceL) {
        this.possibleMoveGrids.push({ x: xVariance[0], y });
      }
      if (!isContainPieceR) {
        this.possibleMoveGrids.push({ x: xVariance[1], y });
      }
    }
  }

  getDirection(piece: IPiece): number {
    return piece.player === 'black' ? -1 : 1;
  }

  getPieceAt(x: number, y: number): IPiece | null {
    const index = this.pieces.findIndex(
      (piece) => piece.x === x && piece.y === y
    );
    if (index === -1) return null;
    return this.pieces[index];
  }

  onTapGrid(x: number, y: number): void {
    this.logMessages.push(`tap ${x}, ${y}`);
    const piece = this.getPieceAt(x, y);
    if (piece && piece.player === this.currentTurn) {
      this.selectPiece(piece);
    } else if (this.selectingPiece !== null && this.isPossibleMoveGrid(x, y)) {
      this.movePieceAndProgressToNextTurn(x, y);
    } else if (this.selectingPiece !== null) {
      this.deselectPiece();
    }
  }

  selectPiece(piece: IPiece): void {
    this.selectingPiece = piece;
    this.drawPossibleMoveGrid(piece);
    this.logMessages.push(
      `selecting ${piece.x}, ${piece.y} ${piece.player} ${
        piece.isPromoted ? '*' : ''
      }`
    );
  }

  deselectPiece(): void {
    this.selectingPiece = null;
    this.possibleMoveGrids = [];
    this.logMessages.push(`Deselected`);
  }

  movePieceAndProgressToNextTurn(x: number, y: number): void {
    if (!this.selectingPiece) return;
    this.selectingPiece.x = x;
    this.selectingPiece.y = y;
    this.selectingPiece = null;
    this.currentTurn =
      this.currentTurn === PLAYER.BLACK ? PLAYER.WHITE : PLAYER.BLACK;
    this.possibleMoveGrids = [];
    this.logMessages.push(`${this.currentTurn.valueOf()}'s turn`);
  }
}
