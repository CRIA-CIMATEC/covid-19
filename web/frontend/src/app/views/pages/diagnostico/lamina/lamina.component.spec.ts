import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LaminaComponent } from './lamina.component';

describe('LaminaComponent', () => {
  let component: LaminaComponent;
  let fixture: ComponentFixture<LaminaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LaminaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LaminaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
