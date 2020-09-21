import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Wizard3Component } from './wizard3.component';

describe('Wizard3Component', () => {
  let component: Wizard3Component;
  let fixture: ComponentFixture<Wizard3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Wizard3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Wizard3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
