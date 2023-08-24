import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { GameMenusComponent } from './pages/game-menus/game-menus.component';
import { CheckersComponent } from './pages/checkers/checkers.component';
import { RoomSelectionComponent } from './pages/checkers/room-selection/room-selection.component';
import { RoomCreateComponent } from './pages/checkers/room-create/room-create.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    GameMenusComponent,
    CheckersComponent,
    RoomSelectionComponent,
    RoomCreateComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
