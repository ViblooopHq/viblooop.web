import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JustForYouComponent } from './just-for-you.component';

describe('JustForYouComponent', () => {
  let component: JustForYouComponent;
  let fixture: ComponentFixture<JustForYouComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JustForYouComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JustForYouComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
