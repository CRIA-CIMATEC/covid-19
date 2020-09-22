import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPageComponent } from './my-page.component';

describe('MyPageComponent', () => {
  let component: MyPageComponent;
  let fixture: ComponentFixture<MyPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPageComponent);
    component = fixture.componentInstance;
    fixture.markForCheck();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
