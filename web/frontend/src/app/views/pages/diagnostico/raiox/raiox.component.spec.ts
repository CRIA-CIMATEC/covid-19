import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RaioxComponent } from './raiox.component';

describe('RaioxComponent', () => {
  let component: RaioxComponent;
  let fixture: ComponentFixture<RaioxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RaioxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RaioxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
