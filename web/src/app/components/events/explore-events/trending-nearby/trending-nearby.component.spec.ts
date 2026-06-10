import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendingNearbyComponent } from './trending-nearby.component';

describe('TrendingNearbyComponent', () => {
  let component: TrendingNearbyComponent;
  let fixture: ComponentFixture<TrendingNearbyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendingNearbyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrendingNearbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
