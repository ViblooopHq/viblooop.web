import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEventHeaderComponent } from './create-event-header.component';

describe('CreateEventHeaderComponent', () => {
  let component: CreateEventHeaderComponent;
  let fixture: ComponentFixture<CreateEventHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEventHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEventHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
