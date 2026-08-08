import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  NgZone,
  OnInit,
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
import { SharedService } from '../../../shared/services/shared.service';
import { EventCreatedOverlayComponent } from '../../../shared/components/event-created-overlay/event-created-overlay.component';
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

  protected readonly formService = inject(CreateEventFormService);
  protected readonly imageUpload = inject(CreateEventImageUploadService);
  private readonly eventsService = inject(EventsService);
  private readonly sharedService = inject(SharedService);
  private readonly router = inject(RouteService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly ngZone = inject(NgZone);
  private readonly titleService = inject(Title);

  readonly totalSteps = CREATE_EVENT_STEPS;
  readonly currentStep = signal(0);
  readonly isSubmittingEvent = signal(false);
  readonly isEventCreatedOverlayVisible = signal(false);
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
    if (this.currentStep() > 0) this.currentStep.update(s => s - 1);
  }

  onCategorySelected(): void {
    setTimeout(() => this.nextStep(), 200);
  }

  private scrollPageToTop(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.querySelector('.vl-body-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Form Submit ───────────────────────────────────────
  async submitForm(): Promise<void> {
    if (this.isSubmittingEvent() || this.isEventCreatedOverlayVisible()) return;

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
        const eventId = res?.data?.event?._id;

        if (isEditMode && res?.success && res.statusCode === 200 && eventId) {
          this.isSubmittingEvent.set(false);
          this.formService.eventForm.markAsPristine();
          this.router.closeDrawerOrNavigate(`/events/${eventId}`);
          return;
        }

        if (!isEditMode && res?.success && res.statusCode === 201 && eventId) {
          this.createdEventId = eventId;
          this.isSubmittingEvent.set(false);
          this.isEventCreatedOverlayVisible.set(true);
          this.scrollPageToTop();
          return;
        }

        this.isSubmittingEvent.set(false);
      },
      error: err => {
        this.isSubmittingEvent.set(false);
        console.error(`Error ${isEditMode ? 'updating' : 'creating'} event:`, err);
      }
    });
  }

  viewCreatedEvent(): void {
    if (!this.createdEventId) return;

    this.ngZone.run(() => {
      this.router.closeDrawerAndNavigateByUrl(`/events/${this.createdEventId}`);
    });
  }

  finishEventCreation(): void {
    this.ngZone.run(() => {
      this.router.closeDrawerAndNavigateByUrl('/explore');
    });
  }
}
