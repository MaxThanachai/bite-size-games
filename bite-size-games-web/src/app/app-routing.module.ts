import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { GameMenusComponent } from './pages/game-menus/game-menus.component';
import { CheckersComponent } from './pages/checkers/checkers.component';
import { RoomSelectionComponent } from './pages/checkers/room-selection/room-selection.component';
import { RoomCreateComponent } from './pages/checkers/room-create/room-create.component';

const routes: Routes = [
  // NOTE: Currently, this project only contains a game.
  {
    path: '',
    //   component: LandingPageComponent,
    // },
    // {
    // path: 'bite-size-game',
    // children: [
    component: GameMenusComponent,
  },
  {
    path: 'checkers',
    children: [
      {
        path: '',
        component: RoomSelectionComponent,
      },
      {
        path: 'create',
        component: RoomCreateComponent,
      },
      {
        path: 'game',
        component: CheckersComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
