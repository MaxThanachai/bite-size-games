import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameMenusComponent } from './game-menus.component';

describe('GameMenusComponent', () => {
  let component: GameMenusComponent;
  let fixture: ComponentFixture<GameMenusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameMenusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameMenusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
