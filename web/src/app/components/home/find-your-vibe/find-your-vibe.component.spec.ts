import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindYourVibeComponent } from './find-your-vibe.component';

describe('FindYourVibeComponent', () => {
  let component: FindYourVibeComponent;
  let fixture: ComponentFixture<FindYourVibeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindYourVibeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindYourVibeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
