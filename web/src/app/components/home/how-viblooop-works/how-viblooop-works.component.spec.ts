import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HowViblooopWorksComponent } from './how-viblooop-works.component';

describe('HowViblooopWorksComponent', () => {
  let component: HowViblooopWorksComponent;
  let fixture: ComponentFixture<HowViblooopWorksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HowViblooopWorksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HowViblooopWorksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
