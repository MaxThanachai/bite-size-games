import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CheckersService {
  constructor(private http: HttpClient) {}

  async joinRoom() {
    const request = this.http.post(
      `http://localhost:3000/api/checkers/join-room`,
      { observe: 'body' }
    );
    const response = await lastValueFrom(request);
    return response;
  }
}
