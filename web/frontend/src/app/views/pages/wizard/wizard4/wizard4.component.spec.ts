import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Wizard4Component } from './wizard4.component';

describe('Wizard4Component', () => {
  let component: Wizard4Component;
  let fixture: ComponentFixture<Wizard4Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Wizard4Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Wizard4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
