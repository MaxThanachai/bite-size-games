import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { IMoveRequest } from './interfaces/checkers.interface';

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

  async joinRoom(roomId: string, playerId: string): Promise<EventSource> {
    const eventSource = new EventSource(
      `http://localhost:3000/api/checkers/join-room?room=${roomId}&player=${playerId}`
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
