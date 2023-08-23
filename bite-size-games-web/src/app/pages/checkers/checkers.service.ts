import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, lastValueFrom } from 'rxjs';

export interface IRoom {
  id: string;
  name: string;
  players: IPlayer[];
  currentTurn: IPlayer | null;
  moves: Subject<IMove>;
}

export interface IMove {
  player?: IPlayer;
  moveType: MOVE_TYPE;
  pieceInitialPosition?: IPosition;
  landingGrid?: IPosition;
  enemyPiecePosition?: IPosition;
}

export interface IPlayer {
  playerId?: string;
  playerColor?: PLAYER;
  playerName?: string;
}

export interface IPosition {
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

@Injectable({
  providedIn: 'root',
})
export class CheckersService {
  constructor(private http: HttpClient) {}

  async getAllRooms() {
    const request = this.http.get(`http://localhost:3000/api/checkers/rooms`, {
      observe: 'body',
    });
    const response = await lastValueFrom(request);
    return response;
  }

  async createRoom(name: string) {
    const request = this.http.post(
      `http://localhost:3000/api/checkers/create-room`,
      { name },
      {
        observe: 'body',
      }
    );
    const response = await lastValueFrom(request);
    return response;
  }

  async joinRoom(roomId: string, playerName: string): Promise<EventSource> {
    const eventSource = new EventSource(
      `http://localhost:3000/api/checkers/join-room?room=${roomId}&player=${playerName}`
    );
    return eventSource;
  }

  async move(roomId: string, move: IMove) {
    const request = this.http.post(
      `http://localhost:3000/api/checkers/move/${roomId}`,
      move,
      {
        observe: 'body',
      }
    );
    const response = await lastValueFrom(request);
    return response;
  }
}
