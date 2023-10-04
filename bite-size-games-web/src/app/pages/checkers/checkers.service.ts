import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { IMoveRequest } from './interfaces/checkers.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class CheckersService {
  constructor(private http: HttpClient) {}

  assignPlayerId() {
    const existedId = sessionStorage.getItem('checker_player_id');
    if (existedId) return;
    sessionStorage.setItem('checker_player_id', uuidv4());
  }

  getPlayerId(): string {
    const existedId = sessionStorage.getItem('checker_player_id');
    if (existedId) return existedId;
    const newId = uuidv4();
    sessionStorage.setItem('checker_player_id', newId);
    return newId;
  }

  async getAllRooms() {
    const request = this.http.get(`http://localhost:3000/api/checkers/rooms`, {
      observe: 'body',
      params: { player: this.getPlayerId() },
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

  async joinRoom(roomId: string): Promise<EventSource> {
    const eventSource = new EventSource(
      `http://localhost:3000/api/checkers/join-room?room=${roomId}&player=${this.getPlayerId()}`
    );
    return eventSource;
  }

  async move(roomId: string, move: IMoveRequest) {
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
