import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnInit,
  Output,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { EventsService } from '../../../shared/services/events/events.service';
import { RouteService } from '../../../shared/services/route/route.service';
import { AppDrawerService } from '../../../shared/services/drawer/app-drawer.service';
import { SharedService } from '../../../shared/services/shared.service';
import { EventCreatedOverlayComponent, CreationOverlayState } from '../../../shared/components/event-created-overlay/event-created-overlay.component';
import { FormDrawerComponent } from '../../../shared/components/form-drawer/form-drawer.component';
import { CREATE_EVENT_STEPS } from './create-event.config';
import { CreateEventFormService } from './state/create-event-form.service';
import { CreateEventImageUploadService } from './state/create-event-image-upload.service';
import { CreateEventHeaderComponent } from './ui/create-event-header/create-event-header.component';
import { StepVibeComponent } from './steps/step-vibe/step-vibe.component';
import { StepEssentialsComponent } from './steps/step-essentials/step-essentials.component';
import { StepSceneComponent } from './steps/step-scene/step-scene.component';
import { StepReviewComponent } from './steps/step-review/step-review.component';

@Component({
  selector: 'vl-create-event',
  standalone: true,
  imports: [
    CreateEventHeaderComponent,
    StepVibeComponent,
    StepEssentialsComponent,
    StepSceneComponent,
    StepReviewComponent,
    EventCreatedOverlayComponent,
    FormDrawerComponent,
  ],
  providers: [CreateEventFormService, CreateEventImageUploadService],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEventComponent implements OnInit {
  @Input() drawerMode: 'create' | 'edit' | null = null;
  @Input() drawerEventId: string | null = null;
  @Output() drawerClosed = new EventEmitter<void>();

  protected readonly formService = inject(CreateEventFormService);
  protected readonly imageUpload = inject(CreateEventImageUploadService);
  private readonly eventsService = inject(EventsService);
  private readonly sharedService = inject(SharedService);
  private readonly router = inject(RouteService);
  private readonly appDrawerService = inject(AppDrawerService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly ngZone = inject(NgZone);
  private readonly titleService = inject(Title);
  private readonly hostElement = inject(ElementRef<HTMLElement>);

  readonly totalSteps = CREATE_EVENT_STEPS;
  readonly currentStep = signal(0);
  readonly isSubmittingEvent = signal(false);
  readonly creationState = signal<CreationOverlayState>('idle');
  readonly creationErrorMessage = signal<string>('');
  private createdEventId: string | null = null;

  readonly currentStepTitle = computed(() => {
    switch (this.currentStep()) {
      case 0: return 'What are you planning?';
      case 1: return 'Tell us more';
      case 2: return 'Set the scene';
      case 3: return this.formService.isEditMode() ? 'Review Changes' : 'Review Your Event';
      default: return this.formService.createHeaderTitle();
    }
  });

  readonly currentStepSubtitle = computed(() => {
    switch (this.currentStep()) {
      case 0: return 'Pick a vibe that fits your plan';
      case 1: return this.formService.stepTwoDescription();
      case 2: return this.formService.stepThreeDescription();
      case 3: return this.formService.isEditMode() ? 'Confirm your updates before saving.' : 'Final check before your vibe goes live.';
      default: return this.formService.createHeaderSubtitle();
    }
  });

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    effect(() => {
      this.titleService.setTitle(this.formService.isEditMode() ? 'Edit Event | Viblooop' : 'Create Event | Viblooop');
    });
  }

  ngOnInit(): void {
    if (this.drawerMode) {
      this.applyDrawerMode();
    } else {
      this.activatedRoute.queryParamMap.subscribe(params => {
        const isEditMode = params.get('mode') === 'edit';
        const eventId = isEditMode ? params.get('eventId') : null;
        this.formService.setEditMode(isEditMode, eventId);

        if (isEditMode && eventId) {
          this.loadEventForEdit(eventId);
        }
      });
    }

    this.formService.init();
  }

  private applyDrawerMode(): void {
    const isEditMode = this.drawerMode === 'edit';
    const eventId = isEditMode ? this.drawerEventId : null;
    this.formService.setEditMode(isEditMode, eventId);

    if (isEditMode && eventId) {
      this.loadEventForEdit(eventId);
    }
  }

  private loadEventForEdit(eventId: string): void {
    this.eventsService.getEventDetails(eventId).subscribe({
      next: (res: any) => {
        if (!res?.success || res.statusCode !== 200 || !res.data) {
          console.warn('Unexpected response format or status code:', res);
          return;
        }

        const event = res.data;
        this.formService.hydrateFromEvent(event);
        this.imageUpload.hydrateForEdit(event.image ? this.sharedService.getImageUrl(event.image) : null);
        this.currentStep.set(1);
        this.scrollPageToTop();
      },
      error: err => {
        console.error('Error loading event for edit:', err);
      }
    });
  }

  // ── Stepper Navigation ────────────────────────────────
  nextStep(): void {
    const step = this.currentStep();

    if (step === 1 && this.formService.isStep2Invalid()) {
      this.formService.eventForm.markAllAsTouched();
      setTimeout(() => {
        const firstInvalid = document.querySelector('.field-input.ng-invalid, .location-input.ng-invalid');
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (firstInvalid as HTMLElement).focus();
        }
      }, 100);
      return;
    }

    if (!this.formService.validateStep(step)) return;

    if (step < this.totalSteps.length - 1) {
      this.currentStep.update(s => s + 1);
      this.scrollPageToTop();
    } else {
      this.submitForm();
    }
  }

  prevStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
      this.scrollPageToTop();
    } else {
      this.appDrawerService.close();
      this.drawerClosed.emit();
    }
  }

  onCategorySelected(): void {
    setTimeout(() => this.nextStep(), 200);
  }

  private scrollPageToTop(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      const drawer = this.hostElement.nativeElement.querySelector('.vl-form-drawer') as HTMLElement | null;
      if (drawer) {
        drawer.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        return;
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.querySelector('.vl-body-container')?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }

  // ── Form Submit ───────────────────────────────────────
  async submitForm(): Promise<void> {
    if (this.isSubmittingEvent() || this.creationState() !== 'idle') return;

    if (this.formService.eventForm.invalid) {
      this.formService.eventForm.markAllAsTouched();
      const step = this.formService.findFirstInvalidStep();
      if (step !== -1) this.currentStep.set(step);
      return;
    }

    const isEditMode = this.formService.isEditMode();
    const editEventId = this.formService.getEditEventId();

    if (isEditMode && !editEventId) {
      console.error('Cannot update event without an event id.');
      return;
    }

    this.isSubmittingEvent.set(true);
    this.creationState.set('loading');
    this.creationErrorMessage.set('');

    const formData = this.formService.buildFormData();

    if (isEditMode && editEventId) {
      formData.append('eventId', editEventId);
      const mainImageFile = this.imageUpload.mainImageFile();
      if (mainImageFile) {
        formData.append('image', mainImageFile);
      } else if (this.imageUpload.needsDefaultCoverFallback()) {
        try {
          const coverImage = await this.imageUpload.getCoverImageForPayload(this.formService.defaultCoverImage());
          formData.append('image', coverImage);
        } catch (err) {
          this.isSubmittingEvent.set(false);
          this.creationState.set('error');
          this.creationErrorMessage.set('Failed to prepare event cover image. Please check your image and try again.');
          console.error('Error preparing cover image:', err);
          return;
        }
      }
    } else {
      try {
        const coverImage = await this.imageUpload.getCoverImageForPayload(this.formService.defaultCoverImage());
        formData.append('image', coverImage);
      } catch (err) {
        this.isSubmittingEvent.set(false);
        this.creationState.set('error');
        this.creationErrorMessage.set('Failed to prepare event cover image. Please check your image and try again.');
        console.error('Error preparing cover image:', err);
        return;
      }
    }

    this.imageUpload.galleryFiles().forEach(f => formData.append('gallery', f));

    const request$ = isEditMode
      ? this.eventsService.updateEvent(formData)
      : this.eventsService.createEvent(formData);

    request$.subscribe({
      next: res => {
        this.isSubmittingEvent.set(false);
        const eventId = res?.data?.event?._id;

        if (isEditMode && res?.success && (res.statusCode === 200 || res.statusCode === 201) && eventId) {
          this.formService.eventForm.markAsPristine();
          this.appDrawerService.close();
          this.drawerClosed.emit();
          this.router.navigateByUrl(`/events/${eventId}`);
          return;
        }

        if (!isEditMode && res?.success && res.statusCode === 201 && eventId) {
          this.createdEventId = eventId;
          this.creationState.set('success');
          return;
        }

        if (res?.success && eventId) {
          this.createdEventId = eventId;
          this.creationState.set('success');
          return;
        }

        this.creationErrorMessage.set(res?.message || 'Event creation could not be completed.');
        this.creationState.set('error');
      },
      error: err => {
        this.isSubmittingEvent.set(false);
        const errMsg = err?.error?.message || err?.message || 'Could not launch event. Please check your connection and try again.';
        this.creationErrorMessage.set(errMsg);
        this.creationState.set('error');
        console.error(`Error ${isEditMode ? 'updating' : 'creating'} event:`, err);
      }
    });
  }

  handleRetry(): void {
    this.submitForm();
  }

  handleBackToEdit(): void {
    this.creationState.set('idle');
  }

  viewCreatedEvent(): void {
    if (!this.createdEventId) return;
    const eventId = this.createdEventId;
    this.ngZone.run(() => {
      this.appDrawerService.close();
      this.drawerClosed.emit();
      this.router.navigateByUrl(`/events/${eventId}`);
    });
  }

  finishEventCreation(): void {
    this.ngZone.run(() => {
      this.formService.eventForm.reset();
      this.formService.setEditMode(false, null);
      this.creationState.set('idle');
      this.currentStep.set(0);
      this.appDrawerService.close();
      this.drawerClosed.emit();
    });
  }
}
