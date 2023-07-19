import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  menuItems = [
    {
      name: 'BiteSizeGames',
      path: '/bite-size-game'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onClickedMenu(menu: {path: string}) {
    this.router.navigate([menu.path]);
  }

}
