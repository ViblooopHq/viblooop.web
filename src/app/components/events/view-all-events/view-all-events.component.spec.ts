import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllEventsComponent } from './view-all-events.component';

describe('ViewAllEventsComponent', () => {
  let component: ViewAllEventsComponent;
  let fixture: ComponentFixture<ViewAllEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAllEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAllEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
