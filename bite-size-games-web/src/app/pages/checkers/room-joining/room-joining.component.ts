import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room-joining',
  templateUrl: './room-joining.component.html',
  styleUrls: ['./room-joining.component.scss'],
})
export class RoomJoiningComponent implements OnInit {
  playerName: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {}

  onClickedJoinRoom(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room') ?? '';
    if (!roomId || !this.playerName)
      console.error('Missing room id or player name');
    this.router.navigate([`/bite-size-game/checkers/game`], {
      queryParams: { room: roomId, player: this.playerName },
    });
  }
}
