import { Component, OnInit } from '@angular/core';

interface IPiece extends IPosition {
  player: 'black' | 'white';
  isPromoted: boolean;
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
  selectingPiece?: IPiece;
  highlightedGrids: IPosition[] = [];

  constructor() {}

  ngOnInit(): void {
    this.instantiatePieces();
  }

  instantiatePieces() {
    for (let i = 0; i < 8; i++) {
      this.pieces.push({
        player: 'black',
        isPromoted: false,
        x: i,
        y: 6 + (i % 2),
      });
    }
    for (let i = 0; i < 8; i++) {
      this.pieces.push({ player: 'white', isPromoted: false, x: i, y: i % 2 });
    }
  }

  isHighlightedGrid(x: number, y: number): boolean {
    return Boolean(
      this.highlightedGrids.find((grid) => grid.x === x && grid.y === y)
    );
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
    if (piece) {
      this.selectingPiece = piece;
      this.logMessages.push(
        `selecting ${x}, ${y} ${piece.player} ${piece.isPromoted ? '*' : ''}`
      );
    } else if (this.selectingPiece !== undefined) {
      this.logMessages.push(`Deselected`);
      this.selectingPiece = undefined;
    }
  }
}
