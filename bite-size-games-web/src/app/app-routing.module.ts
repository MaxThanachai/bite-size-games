import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { GameMenusComponent } from './pages/game-menus/game-menus.component';
import { CheckersComponent } from './pages/checkers/checkers.component';
import { RoomSelectionComponent } from './pages/checkers/room-selection/room-selection.component';
import { RoomCreateComponent } from './pages/checkers/room-create/room-create.component';
import { RoomJoiningComponent } from './pages/checkers/room-joining/room-joining.component';

const routes: Routes = [
  {
    path: '',
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
            path: 'joining',
            component: RoomJoiningComponent,
          },
          {
            path: 'game',
            component: CheckersComponent,
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
