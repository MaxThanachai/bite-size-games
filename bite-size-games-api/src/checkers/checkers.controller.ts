import { Controller, Get, Param, Post, Sse } from '@nestjs/common';
import { Observable, Subject, map } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

interface IRoom {
  id: string;
  name: string;
  players: IPlayer[];
  currentTurn: IPlayer | null;
  moves: Subject<IMove>;
}

interface IMove {
  player: IPlayer;
  moveType: MOVE_TYPE;
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

export enum MOVE_TYPE {
  MOVE = 'MOVE',
  ATTACK = 'ATTACK',
  END_TURN = 'END TURN',
}

@Controller('checkers')
export class CheckersController {
  private rooms: IRoom[] = [];

  constructor() {}

  @Post('create-room/:name')
  createRoom(@Param('name') name: string): string {
    const id = uuidv4();
    this.rooms.push({
      id,
      name,
      players: [],
      currentTurn: null,
      moves: new Subject<IMove>(),
    });
    return id;
  }

  @Get('rooms')
  getAllRooms() {
    return this.rooms;
  }

  @Sse('join-room/:id')
  joinRoom(@Param('id') roomId: string): Observable<string> {
    const thisRoom = this.rooms.find((room) => room.id === roomId);
    if (!thisRoom) throw new Error(`Room id ${roomId} not found`);
    return thisRoom.moves.pipe(map((move) => JSON.stringify(move)));
  }

  @Post('register-player')
  registerPlayerInRoom() {}
}
