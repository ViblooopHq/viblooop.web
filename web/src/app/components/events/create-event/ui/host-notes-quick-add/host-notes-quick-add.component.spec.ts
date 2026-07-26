import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { HostNotesQuickAddComponent } from './host-notes-quick-add.component';
import { CreateEventFormService } from '../../state/create-event-form.service';

describe('HostNotesQuickAddComponent', () => {
  let component: HostNotesQuickAddComponent;
  let fixture: ComponentFixture<HostNotesQuickAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostNotesQuickAddComponent],
      providers: [CreateEventFormService, provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(HostNotesQuickAddComponent);
    fixture.componentRef.setInput('title', 'Host Notes');
    fixture.componentRef.setInput('subtitle', 'Share the key details');
    fixture.componentRef.setInput('placeholder', 'e.g. Parking available');
    fixture.componentRef.setInput('quickAdds', []);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
