import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyEventLandingPageComponent } from './my-event-landing-page.component';

describe('MyEventLandingPageComponent', () => {
  let component: MyEventLandingPageComponent;
  let fixture: ComponentFixture<MyEventLandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyEventLandingPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyEventLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
