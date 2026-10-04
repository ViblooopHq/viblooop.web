import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VibeCategoryCardComponent } from './vibe-category-card.component';

describe('VibeCategoryCardComponent', () => {
  let component: VibeCategoryCardComponent;
  let fixture: ComponentFixture<VibeCategoryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VibeCategoryCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VibeCategoryCardComponent);
    fixture.componentRef.setInput('category', { _id: '1', title: 'Party' });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
