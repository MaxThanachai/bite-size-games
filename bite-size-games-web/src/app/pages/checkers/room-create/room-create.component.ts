import { Component, OnInit } from '@angular/core';
import { CheckersService } from '../checkers.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room-create',
  templateUrl: './room-create.component.html',
  styleUrls: ['./room-create.component.scss'],
})
export class RoomCreateComponent implements OnInit {
  roomName: string = '';
  playerName: string = '';

  constructor(
    private checkersService: CheckersService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  async onClickedCreateRoom(): Promise<void> {
    try {
      const newRoom = (await this.checkersService.createRoom(
        this.roomName
      )) as any;
      this.router.navigate([`/bite-size-game/checkers/game`], {
        queryParams: { room: newRoom.id, player: this.playerName },
      });
    } catch (e) {
      console.error(e);
    }
  }
}
