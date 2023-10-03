import { Component, OnInit } from '@angular/core';
import { CheckersService } from '../checkers.service';
import { ActivatedRoute, Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

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

  constructor(
    private checkersService: CheckersService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getAllRooms();
  }

  async getAllRooms(): Promise<void> {
    const result = (await this.checkersService.getAllRooms()) as IRoom[];
    result.map((room) => this.rooms.push(room));
  }

  onClickedRoom(room: IRoom) {
    if (room.id === 'create-new-room') {
      this.router.navigate(['create'], { relativeTo: this.route });
      return;
    }
    this.router.navigate([`game`], {
      relativeTo: this.route,
      queryParams: { room: room.id, player: uuidv4() },
    });
  }
}
