import { Body, Controller, Get, Param, Post, Query, Sse } from '@nestjs/common';
import { Observable, Subject, map } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ICreateRoom } from './dto/checkers.dto';

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
  playerName: string;
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

  @Post('create-room')
  createRoom(@Body() body: ICreateRoom): IRoom {
    const id = uuidv4();
    const newRoom = {
      id,
      name: body.name,
      players: [],
      currentTurn: null,
      moves: new Subject<IMove>(),
    };
    this.rooms.push(newRoom);
    return newRoom;
  }

  @Get('rooms')
  getAllRooms() {
    return this.rooms.map((room) => {
      return {
        id: room.id,
        name: room.name,
      };
    });
  }

  @Sse('join-room')
  joinRoom(
    @Query('room') roomId: string,
    @Query('player') playerName: string,
  ): Observable<string> {
    console.log(roomId);
    console.log(playerName);
    const thisRoom = this.rooms.find((room) => room.id === roomId);
    if (!thisRoom) throw new Error(`Room id ${roomId} not found`);
    if (thisRoom.players.length > 1) {
      throw new Error(`Room id ${roomId} is full!`);
    }
    const playerId = uuidv4();
    if (!thisRoom.players.length) {
      thisRoom.players.push({
        playerId,
        playerName,
        playerColor: PLAYER.BLACK,
      });
    } else {
      thisRoom.players.push({
        playerId,
        playerName,
        playerColor: PLAYER.WHITE,
      });
    }
    return thisRoom.moves.pipe(map((move) => JSON.stringify(move)));
  }

  @Post('move/:id')
  endTurn(@Param('id') roomId: string, @Body() body: IMove): boolean {
    const thisRoom = this.rooms.find((room) => room.id === roomId);
    if (!thisRoom) throw new Error(`Room id ${roomId} not found`);
    thisRoom.moves.next(body);
    return true;
  }
}
