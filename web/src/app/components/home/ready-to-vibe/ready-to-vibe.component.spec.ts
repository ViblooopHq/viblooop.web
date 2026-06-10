import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadyToVibeComponent } from './ready-to-vibe.component';

describe('ReadyToVibeComponent', () => {
  let component: ReadyToVibeComponent;
  let fixture: ComponentFixture<ReadyToVibeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadyToVibeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReadyToVibeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
