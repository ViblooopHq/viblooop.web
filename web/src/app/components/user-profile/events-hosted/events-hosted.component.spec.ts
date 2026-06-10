import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsHostedComponent } from './events-hosted.component';

describe('EventsHostedComponent', () => {
  let component: EventsHostedComponent;
  let fixture: ComponentFixture<EventsHostedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsHostedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventsHostedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
