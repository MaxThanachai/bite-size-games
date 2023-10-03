import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-game-menus',
  templateUrl: './game-menus.component.html',
  styleUrls: ['./game-menus.component.scss'],
})
export class GameMenusComponent implements OnInit {
  menuItems = [
    {
      name: 'Checkers',
      path: 'checkers',
    },
  ];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {}

  onClickedMenu(menu: { path: string }) {
    this.router.navigate([menu.path], { relativeTo: this.route });
  }
}
