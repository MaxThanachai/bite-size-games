import { Component, OnInit } from '@angular/core';
import { CheckersService } from '../checkers.service';

@Component({
  selector: 'app-room-create',
  templateUrl: './room-create.component.html',
  styleUrls: ['./room-create.component.scss'],
})
export class RoomCreateComponent implements OnInit {
  roomName: string = '';

  constructor(private checkersService: CheckersService) {}

  ngOnInit(): void {}

  onClickedCreateRoom(): void {
    this.checkersService.createRoom(this.roomName);
  }
}
