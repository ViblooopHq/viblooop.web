import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionHeadersComponent } from './section-headers.component';

describe('SectionHeadersComponent', () => {
  let component: SectionHeadersComponent;
  let fixture: ComponentFixture<SectionHeadersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHeadersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionHeadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
