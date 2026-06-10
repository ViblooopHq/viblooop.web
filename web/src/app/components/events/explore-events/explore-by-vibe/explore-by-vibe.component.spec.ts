import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreByVibeComponent } from './explore-by-vibe.component';

describe('ExploreByVibeComponent', () => {
  let component: ExploreByVibeComponent;
  let fixture: ComponentFixture<ExploreByVibeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreByVibeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExploreByVibeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
