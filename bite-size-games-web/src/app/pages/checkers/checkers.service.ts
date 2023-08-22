import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

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

  async joinRoom(roomId: string, playerName: string) {
    const eventSource = new EventSource(
      `http://localhost:3000/api/checkers/join-room?room=${roomId}&player=${playerName}`
    );
    eventSource.onmessage = ({ data }) => {
      const parsedData = JSON.parse(data);
      console.log(parsedData);
    };
  }
}
