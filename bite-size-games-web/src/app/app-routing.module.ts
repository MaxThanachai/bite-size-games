import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { GameMenusComponent } from './pages/game-menus/game-menus.component';
import { CheckersComponent } from './pages/checkers/checkers.component';

const routes: Routes = [
  {
    path: 'landing',
    component: LandingPageComponent,
  },
  {
    path: 'bite-size-game',
    children: [
      {
        path: '',
        component: GameMenusComponent,
      },
      {
        path: 'checkers',
        component: CheckersComponent,
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
