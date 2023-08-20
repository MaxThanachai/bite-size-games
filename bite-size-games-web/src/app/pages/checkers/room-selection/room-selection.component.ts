import { Component, OnInit } from '@angular/core';
import { CheckersService } from '../checkers.service';

interface IRoom {
  id: string;
  name: string;
}

@Component({
  selector: 'app-room-selection',
  templateUrl: './room-selection.component.html',
  styleUrls: ['./room-selection.component.scss'],
})
export class RoomSelectionComponent implements OnInit {
  rooms: IRoom[] = [{ id: 'create-new-room', name: 'CREATE NEW ROOM!' }];

  constructor(private checkersService: CheckersService) {}

  ngOnInit(): void {
    this.getAllRooms();
  }

  async getAllRooms(): Promise<void> {
    const result = (await this.checkersService.getAllRooms()) as IRoom[];
    result.map((room) => this.rooms.push(room));
    console.log(result);
    console.log(this.rooms);
  }

  onClickedRoom(room: IRoom) {
    console.log(room);
  }
}
