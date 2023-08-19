import { Controller, Get, Post } from '@nestjs/common';

interface IRoom {
  id: string;
  name: string;
  players: IPlayer[];
  currentTurn: IPlayer | null;
}

interface IMove {
  player: IPlayer[];
  moveType: PLAYER;
  pieceInitialPosition: IPosition;
  landingGrid: IPosition;
  enemyPiecePosition: IPosition;
}

interface IPlayer {
  playerId: string;
  playerColor: PLAYER;
}

interface IPosition {
  x: number;
  y: number;
}

export enum PLAYER {
  WHITE = 'white',
  BLACK = 'black',
}

@Controller('checkers')
export class CheckersController {
  // private messageSubject = new Subject<IMessage>();
  private rooms: IRoom[] = [];

  constructor() {
    this.rooms.push({
      id: 'test-room-id',
      name: 'Test Room',
      players: [],
      currentTurn: null,
    });
  }

  @Post('join-room')
  joinRoom(): string {
    return 'Hi!';
  }
}
