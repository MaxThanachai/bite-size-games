import { Body, Controller, Get, Param, Post, Query, Sse } from '@nestjs/common';
import { Observable, map, ReplaySubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ICreateRoom } from './dto/checkers.dto';

interface IRoom {
  id: string;
  name: string;
  players: IPlayer[];
  currentTurn: IPlayer | null;
  moves: ReplaySubject<IMove>;
}

interface IMove {
  player: IPlayer;
  moveType: MOVE_TYPE;
  pieceInitialPosition: IPosition;
  landingGrid: IPosition;
  enemyPiecePosition: IPosition;
  nextPlayer: IPlayer;
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

  @Post('create-room')
  createRoom(@Body() body: ICreateRoom): IRoom {
    const id = uuidv4();
    const newRoom = {
      id,
      name: body.name,
      players: [],
      currentTurn: null,
      moves: new ReplaySubject<IMove>(),
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
    @Query('player') playerId: string,
  ): Observable<string> {
    const thisRoom = this.rooms.find((room) => room.id === roomId);
    if (!thisRoom) throw new Error(`Room id ${roomId} not found`);
    if (thisRoom.players.length > 1) {
      throw new Error(`Room id ${roomId} is full!`);
    }
    if (!thisRoom.players.length) {
      const player = {
        playerId,
        playerColor: PLAYER.BLACK,
      };
      thisRoom.players.push(player);
      thisRoom.moves.next({
        nextPlayer: player,
      } as IMove);
    } else {
      thisRoom.players.push({
        playerId,
        playerColor: PLAYER.WHITE,
      });
    }
    return thisRoom.moves.pipe(map((move) => JSON.stringify(move)));
  }

  @Post('move/:id')
  endTurn(@Param('id') roomId: string, @Body() body: IMove): boolean {
    const thisRoom = this.rooms.find((room) => room.id === roomId);
    if (!thisRoom) throw new Error(`Room id ${roomId} not found`);
    if (body.moveType === MOVE_TYPE.END_TURN) {
      body.nextPlayer = thisRoom.players.find(
        (player) => player.playerId !== body.player.playerId,
      );
      if (!body.nextPlayer) throw new Error('Failed to assign next player');
    }
    thisRoom.moves.next(body);
    return true;
  }
}
