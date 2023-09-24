import { ReplaySubject } from 'rxjs';
import { MOVE_TYPE, PLAYER } from './checkers.enum';

export interface IRoom {
  id: string;
  name: string;
  players: IPlayer[];
  currentTurn: IPlayer | null;
  pieces: IPiece[];
  moves: ReplaySubject<IMove>;
}

export interface IMove {
  player?: IPlayer;
  moveType: MOVE_TYPE;
  pieceInitialPosition?: IPosition;
  landingGrid?: IPosition;
  enemyPiecePosition?: IPosition;
  chainAttackingPiecePosition?: IPosition;
  currentTurn: IPlayer;
  pieces: IPiece[];
}

export interface IPlayer {
  playerId: string;
  playerColor: PLAYER;
}

export interface IPosition {
  x: number;
  y: number;
}

export interface IAttackGrid {
  landingGrid: IPosition;
  enemyPiece: IPiece;
}

export interface IPiece {
  player: PLAYER;
  isPromoted: boolean;
  position: IPosition;
}
