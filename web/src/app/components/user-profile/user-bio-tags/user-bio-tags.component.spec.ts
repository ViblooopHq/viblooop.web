import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserBioTagsComponent } from './user-bio-tags.component';

describe('UserBioTagsComponent', () => {
  let component: UserBioTagsComponent;
  let fixture: ComponentFixture<UserBioTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserBioTagsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserBioTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
