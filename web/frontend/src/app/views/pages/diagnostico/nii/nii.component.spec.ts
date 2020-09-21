import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NiiComponent } from './nii.component';

describe('NiiComponent', () => {
  let component: NiiComponent;
  let fixture: ComponentFixture<NiiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NiiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NiiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});