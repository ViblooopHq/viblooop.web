import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProfile2Component } from './edit-profile2.component';

describe('EditProfile2Component', () => {
  let component: EditProfile2Component;
  let fixture: ComponentFixture<EditProfile2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProfile2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProfile2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
