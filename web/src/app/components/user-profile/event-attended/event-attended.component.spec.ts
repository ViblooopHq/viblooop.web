import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventAttendedComponent } from './event-attended.component';

describe('EventAttendedComponent', () => {
  let component: EventAttendedComponent;
  let fixture: ComponentFixture<EventAttendedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventAttendedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventAttendedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
