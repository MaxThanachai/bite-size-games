import { Body, Controller, Get, Param, Post, Query, Sse } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ICreateRoom } from './dto/checkers.dto';
import { IMove, IRoom } from './checkers.interface';
import { PLAYER, MOVE_TYPE } from './checkers.enum';
import { CheckersLogic } from './checkers.logic';

@Controller('checkers')
export class CheckersController {
  private rooms: IRoom[] = [];

  constructor(private readonly checkersLogic: CheckersLogic) {}

  @Post('create-room')
  createRoom(@Body() body: ICreateRoom): IRoom {
    const newRoom = this.checkersLogic.createNewRoom(body.name);
    this.rooms.push(newRoom);
    console.log(newRoom);
    return newRoom;
  }

  @Get('rooms')
  getAllRooms(@Query('player') playerId: string) {
    return this.checkersLogic.getRooms(playerId, this.rooms);
  }

  @Sse('join-room')
  joinRoom(
    @Query('room') roomId: string,
    @Query('player') playerId: string,
  ): Observable<string> {
    const thisRoom = this.rooms.find((room) => room.id === roomId);
    if (!thisRoom) throw new Error(`Room id ${roomId} not found`);
    if (
      thisRoom.players.length > 1 &&
      !this.checkersLogic.isPlayerInRoom(playerId, thisRoom)
    ) {
      throw new Error(`Room id ${roomId} is full!`);
    }
    if (thisRoom.players.length === 0) {
      const player = {
        playerId,
        playerColor: PLAYER.BLACK,
      };
      thisRoom.players.push(player);
    } else if (thisRoom.players.length === 1) {
      const player = {
        playerId,
        playerColor: PLAYER.WHITE,
      };
      thisRoom.players.push(player);
      thisRoom.moves.next({
        moveType: MOVE_TYPE.GAME_START,
        currentTurn: thisRoom.players[0],
        pieces: thisRoom.pieces,
      } as IMove);
      thisRoom.moves.subscribe((move) => {
        if (!move.currentTurn) return;
        thisRoom.currentTurn = move.currentTurn;
      });
    }
    return thisRoom.moves.pipe(map((move) => JSON.stringify(move)));
  }

  @Post('move/:id')
  move(@Param('id') roomId: string, @Body() body: IMove): boolean {
    const thisRoom = this.rooms.find((room) => room.id === roomId);
    if (!thisRoom) throw new Error(`Room id ${roomId} not found`);
    if (
      body.moveType === MOVE_TYPE.MOVE ||
      body.moveType === MOVE_TYPE.ATTACK
    ) {
      this.checkersLogic.isValidMove(body, thisRoom);
      this.checkersLogic.onMove(body, thisRoom);
    }
    if (body.moveType === MOVE_TYPE.SURRENDER) {
      this.checkersLogic.onSurrender(body, thisRoom);
    }
    return true;
  }
}
