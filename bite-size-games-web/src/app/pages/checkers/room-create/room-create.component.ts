import { Component, OnInit } from '@angular/core';
import { CheckersService } from '../checkers.service';
import { ActivatedRoute, Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-room-create',
  templateUrl: './room-create.component.html',
  styleUrls: ['./room-create.component.scss'],
})
export class RoomCreateComponent implements OnInit {
  roomName: string = '';

  constructor(
    private checkersService: CheckersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {}

  async onClickedCreateRoom(): Promise<void> {
    try {
      const newRoom = (await this.checkersService.createRoom(
        this.roomName
      )) as any;
      this.router.navigate(['../', 'game'], {
        relativeTo: this.route,
        queryParams: { room: newRoom.id, player: uuidv4() },
      });
    } catch (e) {
      console.error(e);
    }
  }
}
