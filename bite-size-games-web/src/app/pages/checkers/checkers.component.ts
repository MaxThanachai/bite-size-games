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
  possibleMoveGrids: IPosition[] = [];
  possibleAttackGrids: IAttackGrid[] = [];
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
        // isPromoted: false,
        isPromoted: true,
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
    if (this.selectingPiece === undefined) return false;
    return Boolean(
      this.possibleMoveGrids.find((grid) => grid.x === x && grid.y === y)
    );
  }

  isPossibleAttackGrid(x: number, y: number): boolean {
    if (this.selectingPiece === undefined) return false;
    return Boolean(
      this.possibleAttackGrids.find(
        (grid) => grid.landingGrid.x === x && grid.landingGrid.y === y
      )
    );
  }

  isInBoard(x: number, y: number): boolean {
    return x >= 0 && x < 7 && y >= 0 && y < 7;
  }

  calculatePossibleMoveGrid(selectedPiece: IPiece): void {
    this.possibleMoveGrids = [];
    this.possibleAttackGrids = [];
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
          this.possibleMoveGrids.push({
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
        if (!this.getPieceAt(landingGrid.x, landingGrid.y)) {
          this.possibleAttackGrids.push({ landingGrid, enemyPiece });
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

  getGridInPath(start: IPosition, end: IPosition): IPosition[] {
    const distance = start.x - end.x;
    if (distance === 0) return [];
    const result: IPosition[] = [start];
    for (let i = 1; i < distance; i++) {
      result.push({
        x: start.x + i * Math.sign(end.x - start.x),
        y: start.y + i * Math.sign(end.y - start.y),
      });
    }
    return result;
  }

  onTapGrid(x: number, y: number): void {
    this.logMessages.push(`tap ${x}, ${y}`);
    const piece = this.getPieceAt(x, y);
    if (piece && piece.player === this.currentTurn) {
      this.selectPiece(piece);
    } else if (this.selectingPiece !== null && this.isPossibleMoveGrid(x, y)) {
      this.movePieceAndProgressToNextTurn(x, y);
    } else if (
      this.selectingPiece !== null &&
      this.isPossibleAttackGrid(x, y)
    ) {
      this.attackAndProgress(x, y);
    } else if (this.selectingPiece !== null) {
      this.deselectPiece();
    }
  }

  selectPiece(piece: IPiece): void {
    this.selectingPiece = piece;
    this.calculatePossibleMoveGrid(piece);
    this.logMessages.push(
      `selecting ${piece.position.x}, ${piece.position.y} ${piece.player} ${
        piece.isPromoted ? '*' : ''
      }`
    );
  }

  deselectPiece(): void {
    this.selectingPiece = null;
    this.possibleMoveGrids = [];
    this.possibleAttackGrids = [];
    this.logMessages.push(`Deselected`);
  }

  movePieceAndProgressToNextTurn(x: number, y: number): void {
    if (!this.selectingPiece) return;
    this.selectingPiece.position.x = x;
    this.selectingPiece.position.y = y;
    this.selectingPiece = null;
    this.currentTurn =
      this.currentTurn === PLAYER.BLACK ? PLAYER.WHITE : PLAYER.BLACK;
    this.possibleMoveGrids = [];
    this.possibleAttackGrids = [];
    this.logMessages.push(`${this.currentTurn.valueOf()}'s turn`);
  }

  attackAndProgress(x: number, y: number): void {
    const attackGrid = this.possibleAttackGrids.find(
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
    this.selectingPiece = null;
    this.currentTurn =
      this.currentTurn === PLAYER.BLACK ? PLAYER.WHITE : PLAYER.BLACK;
    this.possibleMoveGrids = [];
    this.possibleAttackGrids = [];
    this.logMessages.push(`${this.currentTurn.valueOf()}'s turn`);

    // TODO: Chain attack for promoted player
  }
}
