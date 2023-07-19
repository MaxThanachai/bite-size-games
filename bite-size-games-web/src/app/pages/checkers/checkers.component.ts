import { Component, OnInit } from '@angular/core';

interface IPiece {
  player: 'black' | 'white';
  x: number;
  y: number;
  isPromoted: boolean;
}

@Component({
  selector: 'app-checker',
  templateUrl: './checkers.component.html',
  styleUrls: ['./checkers.component.scss']
})
export class CheckersComponent implements OnInit {
  pieces: IPiece[] = [];

  constructor() { }

  ngOnInit(): void {
    this.instantiatePieces();
  }
  
  instantiatePieces() {
    for (let i=0; i<8; i++) {
      this.pieces.push({player: 'black', isPromoted: false, x: i, y: 6 + (i % 2)});
    }
    for (let i=0; i<8; i++) {
      this.pieces.push({player: 'white', isPromoted: false, x: i, y: i % 2});
    }
  }

  getPieceAt(x: number, y: number): IPiece | null{
    const index = this.pieces.findIndex(piece => piece.x === x && piece.y === y);
    if (index === -1) return null;
    return this.pieces[index];
  }
}
