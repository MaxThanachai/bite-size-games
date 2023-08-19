import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { GameMenusComponent } from './pages/game-menus/game-menus.component';
import { CheckersComponent } from './pages/checkers/checkers.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    GameMenusComponent,
    CheckersComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
