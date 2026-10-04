import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { CoverImageUploadComponent } from './cover-image-upload.component';
import { CreateEventImageUploadService } from '../../state/create-event-image-upload.service';

describe('CoverImageUploadComponent', () => {
  let component: CoverImageUploadComponent;
  let fixture: ComponentFixture<CoverImageUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoverImageUploadComponent],
      providers: [CreateEventImageUploadService, provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CoverImageUploadComponent);
    fixture.componentRef.setInput('defaultCoverImage', 'assets/images/landing-page-bg.jpg');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
