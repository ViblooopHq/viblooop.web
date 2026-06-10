import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViblooopReviewComponent } from './viblooop-review.component';

describe('ViblooopReviewComponent', () => {
  let component: ViblooopReviewComponent;
  let fixture: ComponentFixture<ViblooopReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViblooopReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViblooopReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
