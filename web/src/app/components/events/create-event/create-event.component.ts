import { Component, ElementRef, HostListener, Inject, Input, NgZone, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EventsService } from '../../../shared/services/events/events.service';
import { EventCategoryPresentationService } from '../../../shared/services/events/event-category-presentation.service';
import { RouteService } from '../../../shared/services/route/route.service';
import { SharedService } from '../../../shared/services/shared.service';
import { TimePipe } from '../../../shared/pipes/time.pipe';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EventCreatedOverlayComponent } from '../../../shared/components/event-created-overlay/event-created-overlay.component';
import { FormDrawerComponent } from '../../../shared/components/form-drawer/form-drawer.component';
import {
  CREATE_EVENT_CAPACITY_CONFIG,
  CREATE_EVENT_EXPECTATIONS,
  CREATE_EVENT_HOST_NOTES_MAX_LENGTH,
  CREATE_EVENT_STEPS,
  CREATE_EVENT_TIME_PICKER_CONFIG,
  CREATE_EVENT_TYPE_CONFIGS,
  CreationKind,
  CreationTypeConfig,
  HostNoteQuickAdd,
} from './create-event.config';

@Component({
  selector: 'vl-create-event',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    CommonModule, 
    DatePipe, 
    TimePipe,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    EventCreatedOverlayComponent,
    FormDrawerComponent
  ],
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {
  @Input() drawerMode: 'create' | 'edit' | null = null;
  @Input() drawerEventId: string | null = null;

  // ── Stepper ──────────────────────────────────────────
  readonly totalSteps = CREATE_EVENT_STEPS;
  currentStep = 0;

  // ── Form ─────────────────────────────────────────────
  eventForm: FormGroup;
  categories: any[] = [];

  // ── Images ───────────────────────────────────────────
  mainImageFile: File | null = null;
  mainImagePreview: string | ArrayBuffer | null = null;
  galleryFiles: File[] = [];
  galleryPreviews: string[] = [];
  isImageLoading = false;
  private existingCoverPreview: string | null = null;
  private shouldReplaceCoverWithDefault = false;

  // ── Date helpers ─────────────────────────────────────
  today = new Date();
  minDate = new Date(); // Material uses Date objects
  minTime = '';

  private updateMinTime(): void {
    const selectedDate = this.eventForm.get('eventDate')?.value;
    if (!selectedDate) return;

    const now = new Date();
    const selDate = new Date(selectedDate);
    
    // Check if selected date is today (ignoring time)
    const isToday = selDate.toDateString() === now.toDateString();

    if (isToday) {
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      this.minTime = `${hours}:${minutes}`;
    } else {
      this.minTime = '';
    }
  }

  // ── What to Expect options ────────────────────────────
  readonly availableExpectations = CREATE_EVENT_EXPECTATIONS;
  readonly hostNotesMaxLength = CREATE_EVENT_HOST_NOTES_MAX_LENGTH;
  isHostQuickAddExpanded = true;
  canScrollHostNotePillsLeft = false;
  canScrollHostNotePillsRight = false;
  isSubmittingEvent = false;
  isEventCreatedOverlayVisible = false;
  private createdEventId: string | null = null;
  isEditMode = false;
  private editEventId: string | null = null;
  private hostNotePillsElement: HTMLElement | null = null;

  getCategoryDisplayTitle(cat: any): string {
    return this.categoryPresentation.getDisplayTitle(cat);
  }

  getCategoryDisplayDescription(cat: any): string {
    return this.categoryPresentation.getDisplayDescription(cat);
  }

  getCategoryDisplayIcon(cat: any): string {
    return this.categoryPresentation.getDisplayIcon(cat);
  }

  getCategoryAccent(cat: any): string {
    return this.categoryPresentation.getAccent(cat);
  }

  isCategorySoon(cat: any): boolean {
    return this.categoryPresentation.isSoon(cat);
  }

  // ── Capacity helpers ─────────────────────────────────
  isCapacityLimited = true;
  readonly quickCapacityOptions = CREATE_EVENT_CAPACITY_CONFIG.quickOptions;
  isCustomCapacity = false;
  readonly capacityMin = CREATE_EVENT_CAPACITY_CONFIG.min;
  readonly capacityMax = CREATE_EVENT_CAPACITY_CONFIG.max;
  readonly openCapacityLimit = CREATE_EVENT_CAPACITY_CONFIG.openLimit;

  setAttendeeLimit(val: number): void {
    this.isCustomCapacity = false;
    this.eventForm.patchValue({ attendeeLimit: val });
  }

  toggleCustomCapacity(): void {
    this.isCustomCapacity = !this.isCustomCapacity;
  }

  setCapacityType(limited: boolean): void {
    this.isCapacityLimited = limited;
    const attendeeLimitControl = this.eventForm.get('attendeeLimit');

    if (limited) {
      const current = Number(this.eventForm.get('attendeeLimit')?.value) || CREATE_EVENT_CAPACITY_CONFIG.defaultLimitedValue;
      const safeValue = current >= this.capacityMin && current <= this.capacityMax
        ? current
        : CREATE_EVENT_CAPACITY_CONFIG.defaultLimitedValue;
      this.setCapacityValidators(true);
      attendeeLimitControl?.setValue(safeValue);
      return;
    }

    this.setCapacityValidators(false);
    attendeeLimitControl?.setValue(this.openCapacityLimit);
  }

  adjustCapacity(delta: number): void {
    const current = Number(this.eventForm.get('attendeeLimit')?.value) || CREATE_EVENT_CAPACITY_CONFIG.defaultLimitedValue;
    const nextValue = this.normalizeCapacityValue(current + delta);
    this.eventForm.patchValue({ attendeeLimit: nextValue });
  }

  setCapacityFromInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const nextValue = this.normalizeCapacityValue(input.value);
    input.value = String(nextValue);
    this.eventForm.patchValue({ attendeeLimit: nextValue });
  }

  clampCapacity(): void {
    const nextValue = this.normalizeCapacityValue(this.eventForm.get('attendeeLimit')?.value);
    this.eventForm.patchValue({ attendeeLimit: nextValue });
  }

  private normalizeCapacityValue(value: unknown): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return this.capacityMin;
    return Math.min(this.capacityMax, Math.max(this.capacityMin, Math.trunc(parsed)));
  }

  private setCapacityValidators(limited: boolean): void {
    const attendeeLimitControl = this.eventForm.get('attendeeLimit');
    if (!attendeeLimitControl) return;

    if (limited) {
      attendeeLimitControl.setValidators([
        Validators.required,
        Validators.min(this.capacityMin),
        Validators.max(this.capacityMax),
      ]);
    } else {
      attendeeLimitControl.clearValidators();
      attendeeLimitControl.setErrors(null);
    }

    attendeeLimitControl.updateValueAndValidity({ emitEvent: false });
  }

  // ── Mix helpers ──────────────────────────────────────
  mixType: 'women' | 'men' | 'open' = 'open';

  setMixType(type: 'women' | 'men' | 'open'): void {
    this.mixType = type;
    if (type === 'women') this.eventForm.patchValue({ audiencePreference: type, attendeeMix: 10 });
    if (type === 'men') this.eventForm.patchValue({ audiencePreference: type, attendeeMix: 90 });
    if (type === 'open') this.eventForm.patchValue({ audiencePreference: type, attendeeMix: 50 });
  }

  getMixLabel(): string {
    const val = this.eventForm.get('attendeeMix')?.value;
    if (this.mixType === 'open') return 'Open for All';
    if (val <= 20) return 'Women Focused';
    if (val >= 80) return 'Men Focused';
    return 'Balanced';
  }

  getMixSub(): string {
    if (this.mixType === 'open') return 'Anyone can join! Everyone\'s welcome.';
    const val = this.eventForm.get('attendeeMix')?.value;
    if (val <= 20) return 'A space that\'s mostly women, comfortable and safe.';
    if (val >= 80) return 'A space that\'s mostly men, chill and exciting.';
    return 'An equal mix of everyone for a great vibe.';
  }

  setCost(cost: 'Free' | 'Paid'): void {
    this.eventForm.patchValue({ cost });

    if (cost === 'Free') {
      this.eventForm.get('price')?.setValue('');
      this.eventForm.get('price')?.setErrors(null);
    }
  }

  setChatAccess(hostOnlyChat: boolean): void {
    this.eventForm.patchValue({ hostOnlyChat });
  }

  addHostNote(note: string): void {
    const control = this.eventForm.get('description');
    const current = (control?.value || '').toString().trim();
    if (current.includes(note)) return;

    const nextValue = current ? `${current}\n${note}` : note;
    control?.setValue(nextValue.slice(0, this.hostNotesMaxLength));
    control?.markAsDirty();
    control?.markAsTouched();
  }

  isHostNoteSelected(note: string): boolean {
    return (this.eventForm.get('description')?.value || '').toString().includes(note);
  }

  toggleHostQuickAdd(): void {
    this.isHostQuickAddExpanded = !this.isHostQuickAddExpanded;
  }

  @ViewChild('hostNotePills')
  set hostNotePills(ref: ElementRef<HTMLElement> | undefined) {
    this.hostNotePillsElement = ref?.nativeElement ?? null;
    this.scheduleHostNoteScrollStateUpdate();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.scheduleHostNoteScrollStateUpdate();
  }

  updateHostNoteScrollState(): void {
    const pills = this.hostNotePillsElement;

    if (!pills) {
      this.canScrollHostNotePillsLeft = false;
      this.canScrollHostNotePillsRight = false;
      return;
    }

    const maxScrollLeft = Math.max(pills.scrollWidth - pills.clientWidth, 0);
    const edgeTolerance = 2;

    this.canScrollHostNotePillsLeft = pills.scrollLeft > edgeTolerance;
    this.canScrollHostNotePillsRight = maxScrollLeft - pills.scrollLeft > edgeTolerance;
  }

  scrollHostNotePills(direction: 'left' | 'right'): void {
    const pills = this.hostNotePillsElement;
    if (!pills) return;

    const scrollDistance = Math.max(pills.clientWidth * 0.75, 180);

    pills.scrollBy({
      left: direction === 'left' ? -scrollDistance : scrollDistance,
      behavior: 'smooth',
    });
  }

  private scheduleHostNoteScrollStateUpdate(): void {
    if (!this.hostNotePillsElement) {
      this.updateHostNoteScrollState();
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      this.updateHostNoteScrollState();
      return;
    }

    requestAnimationFrame(() => this.updateHostNoteScrollState());
  }

  // ── Custom Time Picker State ───────────────────────────
  isTimePickerOpen = false;
  isAgreementExpanded = false;

  toggleAgreement(): void {
    this.isAgreementExpanded = !this.isAgreementExpanded;
  }
  readonly hours = CREATE_EVENT_TIME_PICKER_CONFIG.hours;
  readonly minutes = CREATE_EVENT_TIME_PICKER_CONFIG.minutes;
  readonly periods = CREATE_EVENT_TIME_PICKER_CONFIG.periods;

  selectedHour = '12';
  selectedMinute = '00';
  selectedPeriod = 'AM';

  get formattedDisplayTime(): string {
    const val = this.eventForm.get('eventTime')?.value;
    if (!val) return '';
    let [h, m] = val.split(':');
    let hour = parseInt(h, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${m} ${period}`;
  }

  toggleTimePicker(): void {
    this.isTimePickerOpen = !this.isTimePickerOpen;
    if (this.isTimePickerOpen) {
      const val = this.eventForm.get('eventTime')?.value;
      if (val) {
        let [h, m] = val.split(':');
        let hour = parseInt(h, 10);
        this.selectedPeriod = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        this.selectedHour = String(hour).padStart(2, '0');
        this.selectedMinute = m;
      }
    }
  }

  closeTimePicker(): void {
    this.isTimePickerOpen = false;
  }

  selectHour(h: string): void {
    this.selectedHour = h;
    this.updateEventTimeFromCustom();
  }

  selectMinute(m: string): void {
    this.selectedMinute = m;
    this.updateEventTimeFromCustom();
  }

  selectPeriod(p: string): void {
    this.selectedPeriod = p;
    this.updateEventTimeFromCustom();
  }

  updateEventTimeFromCustom(): void {
    let hour = parseInt(this.selectedHour, 10);
    if (this.selectedPeriod === 'PM' && hour < 12) hour += 12;
    if (this.selectedPeriod === 'AM' && hour === 12) hour = 0;
    
    const formattedHour = String(hour).padStart(2, '0');
    const newTime = `${formattedHour}:${this.selectedMinute}`;
    this.eventForm.patchValue({ eventTime: newTime });
  }

  constructor(
    private fb: FormBuilder,
    private eventService: EventsService,
    private categoryPresentation: EventCategoryPresentationService,
    private router: RouteService,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.eventForm = this.fb.group({
      title:            ['', Validators.required],
      description:      [''],
      shortDescription: [''],
      eventDate:        ['', Validators.required],
      endDate:          [''],
      eventTime:        ['', Validators.required],
      address: this.fb.group({
        street:  ['', Validators.required],
        area:    ['', Validators.required],
        landmark:[''],
        pinCode: ['', Validators.required],
      }),
      attendeeLimit:     [CREATE_EVENT_CAPACITY_CONFIG.defaultLimitedValue, [Validators.required, Validators.min(this.capacityMin), Validators.max(this.capacityMax)]],
      audiencePreference: ['open'],
      attendeeMix:       [50],
      hostOnlyChat:      [false],
      safetyGuidelines:  [false],
      safetyAgreement:   [false, Validators.requiredTrue],
      expectations:      [[]],
      tags:              [''],
      category:          ['', Validators.required],
      cost:              ['Free', Validators.required],
      price:             [''],
    });

    // Listen to date changes to update minTime
    this.eventForm.get('eventDate')?.valueChanges.subscribe(() => {
      this.updateMinTime();
      this.keepEndDateOnOrAfterStartDate();
    });
    this.eventForm.get('category')?.valueChanges.subscribe(() => {
      this.syncCreationKindFromSelectedCategory();
    });
  }

  // ── Typed getters ─────────────────────────────────────
  private getSelectedCategory(): any {
    const catId = this.eventForm.get('category')?.value;
    return this.categories.find(c => c._id === catId || c.id === catId);
  }

  getSelectedCategoryTitle(): string {
    const cat = this.getSelectedCategory();
    return cat ? this.getCategoryDisplayTitle(cat) : '';
  }

  getSelectedCategoryIcon(): string {
    const cat = this.getSelectedCategory();
    return cat ? this.getCategoryDisplayIcon(cat) : 'celebration';
  }

  get creationKind(): CreationKind {
    return this.categoryPresentation.getCreationKind(this.getSelectedCategory());
  }

  private get selectedCreationConfig(): CreationTypeConfig {
    return CREATE_EVENT_TYPE_CONFIGS[this.creationKind];
  }

  get isEscapeCreation(): boolean {
    return this.selectedCreationConfig.usesDateRange;
  }

  get createHeaderTitle(): string {
    return this.isEditMode ? 'Edit Event' : this.selectedCreationConfig.headerTitle;
  }

  get createHeaderSubtitle(): string {
    return this.isEditMode ? 'Update the details for your vibe' : 'Let\'s set up your amazing event';
  }

  get currentStepTitle(): string {
    switch (this.currentStep) {
      case 0:
        return 'What are you planning?';
      case 1:
        return 'Tell us more';
      case 2:
        return 'Set the scene';
      case 3:
        return this.isEditMode ? 'Review Changes' : 'Review Your Event';
      default:
        return this.createHeaderTitle;
    }
  }

  get currentStepSubtitle(): string {
    switch (this.currentStep) {
      case 0:
        return 'Pick a vibe that fits your plan';
      case 1:
        return this.stepTwoDescription;
      case 2:
        return this.stepThreeDescription;
      case 3:
        return this.isEditMode ? 'Confirm your updates before saving.' : 'Final check before your vibe goes live.';
      default:
        return this.createHeaderSubtitle;
    }
  }

  get titleFieldLabel(): string {
    return this.selectedCreationConfig.titleFieldLabel;
  }

  get titleFieldPlaceholder(): string {
    return this.selectedCreationConfig.titleFieldPlaceholder;
  }

  get defaultCoverImage(): string {
    return this.selectedCreationConfig.defaultCoverImage;
  }

  get stepTwoDescription(): string {
    return this.selectedCreationConfig.stepTwoDescription;
  }

  get stepThreeDescription(): string {
    return this.selectedCreationConfig.stepThreeDescription;
  }

  get chatAccessSubtitle(): string {
    return this.selectedCreationConfig.chatAccessSubtitle;
  }

  get everyoneChatMobileDescription(): string {
    return this.selectedCreationConfig.everyoneChatMobileDescription;
  }

  get hostOnlyChatMobileDescription(): string {
    return this.selectedCreationConfig.hostOnlyChatMobileDescription;
  }

  get hostNotesTitle(): string {
    return this.selectedCreationConfig.hostNotesTitle;
  }

  get hostNotesSubtitle(): string {
    return this.selectedCreationConfig.hostNotesSubtitle;
  }

  get hostNotesPlaceholder(): string {
    return this.selectedCreationConfig.hostNotesPlaceholder;
  }

  get hostNoteQuickAdds(): HostNoteQuickAdd[] {
    return this.selectedCreationConfig.hostNoteQuickAdds;
  }

  get minEndDate(): Date {
    return this.eventForm.get('eventDate')?.value || this.minDate;
  }

  get datePickerMinDate(): Date | null {
    return this.isEditMode ? null : this.minDate;
  }

  get eventCreatedAnimationPath(): string {
    return this.selectedCreationConfig.animationPath;
  }

  get addressGroup(): FormGroup {
    return this.eventForm.get('address') as FormGroup;
  }

  clearLocation(): void {
    this.addressGroup.patchValue({
      street: '',
      area: '',
      landmark: '',
      pinCode: '',
    });
  }

  // ── Lifecycle ─────────────────────────────────────────
  ngOnInit(): void {
    if (this.drawerMode) {
      this.applyDrawerMode();
    } else {
      this.activatedRoute.queryParamMap.subscribe(params => {
        this.isEditMode = params.get('mode') === 'edit';
        this.editEventId = this.isEditMode ? params.get('eventId') : null;

        if (this.isEditMode && this.editEventId) {
          this.loadEventForEdit(this.editEventId);
        }
      });
    }

    this.eventService.getCategoriesList().subscribe((res: any) => {
      if (res?.data?.categories) {
        this.categories = res.data.categories;
        this.syncCreationKindFromSelectedCategory();
      }
    });
    this.updateMinTime();
    this.updateDateValidatorsForCreationKind();
  }

  private applyDrawerMode(): void {
    this.isEditMode = this.drawerMode === 'edit';
    this.editEventId = this.isEditMode ? this.drawerEventId : null;

    if (this.isEditMode && this.editEventId) {
      this.loadEventForEdit(this.editEventId);
    }
  }

  private loadEventForEdit(eventId: string): void {
    this.eventService.getEventDetails(eventId).subscribe({
      next: (res: any) => {
        if (!res?.success || res.statusCode !== 200 || !res.data) {
          console.warn('Unexpected response format or status code:', res);
          return;
        }

        const event = res.data;
        const attendeeLimit = Number(event.attendeeLimit || CREATE_EVENT_CAPACITY_CONFIG.defaultLimitedValue);
        const isLimited = attendeeLimit < this.openCapacityLimit;
        const audiencePreference = this.normalizeAudiencePreference(event.audiencePreference, event.attendeeMix);
        const price = Number(event.price || 0);

        this.currentStep = 1;
        this.mainImageFile = null;
        this.existingCoverPreview = event.image ? this.sharedService.getImageUrl(event.image) : null;
        this.mainImagePreview = this.existingCoverPreview;
        this.shouldReplaceCoverWithDefault = false;
        this.galleryFiles = [];
        this.galleryPreviews = [];
        this.mixType = audiencePreference;

        this.eventForm.patchValue({
          title: event.title || '',
          description: event.description || '',
          shortDescription: event.shortDescription || '',
          eventDate: this.toDateControlValue(event.eventDate),
          endDate: this.toDateControlValue(event.endDate || event.eventDate),
          eventTime: this.toTimeControlValue(event.eventTime),
          address: {
            street: event.address?.street || '',
            area: event.address?.area || '',
            landmark: event.address?.landmark || '',
            pinCode: event.address?.pinCode || '',
          },
          attendeeLimit: isLimited ? attendeeLimit : this.openCapacityLimit,
          audiencePreference,
          attendeeMix: Number(event.attendeeMix ?? this.attendeeMixFromPreference(audiencePreference)),
          hostOnlyChat: Boolean(event.hostOnlyChat),
          safetyGuidelines: Boolean(event.safetyGuidelines),
          safetyAgreement: true,
          expectations: Array.isArray(event.expectations) ? event.expectations : [],
          tags: event.tags || '',
          category: this.getCategoryId(event.category),
          cost: event.cost || (price > 0 ? 'Paid' : 'Free'),
          price: price || '',
        });

        this.setCapacityType(isLimited);
        if (isLimited) {
          this.eventForm.patchValue({ attendeeLimit });
        }
        this.syncCustomTimePickerFromForm();
        this.updateMinTime();
        this.updateDateValidatorsForCreationKind();
        this.eventForm.markAsPristine();
        this.eventForm.markAsUntouched();
        this.scrollPageToTop();
      },
      error: err => {
        console.error('Error loading event for edit:', err);
      }
    });
  }

  private getCategoryId(category: any): string {
    if (!category) return '';
    if (typeof category === 'string') return category;
    return category._id || category.id || '';
  }

  private normalizeAudiencePreference(value: unknown, attendeeMix: unknown): 'open' | 'women' | 'men' {
    const preference = String(value || '').toLowerCase();
    if (preference === 'open' || preference === 'women' || preference === 'men') return preference;

    const mix = Number(attendeeMix);
    if (Number.isFinite(mix)) {
      if (mix <= 20) return 'women';
      if (mix >= 80) return 'men';
    }

    return 'open';
  }

  private attendeeMixFromPreference(preference: 'open' | 'women' | 'men'): number {
    if (preference === 'women') return 10;
    if (preference === 'men') return 90;
    return 50;
  }

  private toDateControlValue(value: string | Date | null | undefined): Date | string {
    if (!value) return '';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date;
  }

  private toTimeControlValue(value: string | null | undefined): string {
    const raw = String(value || '').trim();
    const match = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (!match) return '';

    let hours = Number(match[1]);
    const minutes = Number(match[2] || 0);
    const modifier = match[3]?.toUpperCase();

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  private syncCustomTimePickerFromForm(): void {
    const value = this.eventForm.get('eventTime')?.value;
    if (!value) return;

    const [hourValue, minuteValue] = value.split(':');
    let hour = Number(hourValue);
    this.selectedPeriod = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    this.selectedHour = String(hour).padStart(2, '0');
    this.selectedMinute = minuteValue || '00';
  }

  // ── Stepper Navigation ────────────────────────────────
  nextStep(): void {
    if (this.currentStep === 1) { // Step 2: Basics
      if (this.isStep2Invalid()) {
        this.eventForm.markAllAsTouched();
        // Small delay to ensure styles apply before scrolling
        setTimeout(() => {
          const firstInvalid = document.querySelector('.field-input.ng-invalid, .location-input.ng-invalid, .location-meta-input.ng-invalid');
          if (firstInvalid) {
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            (firstInvalid as HTMLElement).focus();
          }
        }, 100);
        return;
      }
    }

    if (!this.validateCurrentStep()) return;
    if (this.currentStep < this.totalSteps.length - 1) {
      this.currentStep++;
      this.scrollPageToTop();
    } else {
      this.submitForm();
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) this.currentStep--;
  }

  isStep2Invalid(): boolean {
    const f = this.eventForm;
    const addr = this.addressGroup;
    return (
      !f.get('title')?.value ||
      !f.get('eventDate')?.value ||
      (this.isEscapeCreation ? !f.get('endDate')?.value : !f.get('eventTime')?.value) ||
      !addr.get('street')?.value ||
      !addr.get('area')?.value ||
      !addr.get('pinCode')?.value
    );
  }

  private validateCurrentStep(): boolean {
    // Step 0: category required
    if (this.currentStep === 0) {
      if (this.eventForm.get('category')?.invalid) {
        this.eventForm.get('category')?.markAsTouched();
        return false;
      }
      return true;
    }

    // Step 1: title, date, timing, address required
    if (this.currentStep === 1) {
      const controls = this.isEscapeCreation
        ? ['title', 'eventDate', 'endDate']
        : ['title', 'eventDate', 'eventTime'];
      if (this.isCapacityLimited) controls.push('attendeeLimit');
      let valid = true;
      controls.forEach(ctrl => {
        if (this.eventForm.get(ctrl)?.invalid) {
          this.eventForm.get(ctrl)?.markAsTouched();
          valid = false;
        }
      });
      const addressControls = ['street', 'area', 'pinCode'];
      addressControls.forEach(ctrl => {
        if (this.addressGroup.get(ctrl)?.invalid) {
          this.addressGroup.get(ctrl)?.markAsTouched();
          valid = false;
        }
      });
      const attendeeLimit = Number(this.eventForm.get('attendeeLimit')?.value);
      if (this.isCapacityLimited && (attendeeLimit < this.capacityMin || attendeeLimit > this.capacityMax)) {
        alert(`Capacity must be between ${this.capacityMin} and ${this.capacityMax} spots.`);
        const element = document.getElementById('capacity-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
      }
      return valid;
    }

    // Step 2: Date/Time and Paid price check
    if (this.currentStep === 2) {
      const selectedDate = this.eventForm.get('eventDate')?.value;
      const selectedTime = this.eventForm.get('eventTime')?.value;

      if (this.isEscapeCreation) {
        const endDate = this.eventForm.get('endDate')?.value;
        if (selectedDate && endDate && new Date(endDate) < new Date(selectedDate)) {
          alert('Trip end date cannot be before the start date.');
          return false;
        }
      } else if (!this.isEditMode && selectedDate && selectedTime) {
        const now = new Date();
        const [hours, minutes] = selectedTime.split(':');
        const eventDateTime = new Date(selectedDate);
        eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        if (eventDateTime < now) {
          alert('Event cannot be in the past! Please select a future date and time.');
          return false;
        }
      }

      if (this.eventForm.get('cost')?.value === 'Paid' &&
          !(this.eventForm.get('price')?.value > 0)) {
        this.eventForm.get('price')?.setErrors({ invalidPrice: true });
        return false;
      }
      return true;
    }

    return true;
  }

  private findFirstInvalidStep(): number {
    if (this.eventForm.get('category')?.invalid) return 0;
    const timingControls = this.isEscapeCreation ? ['eventDate', 'endDate'] : ['eventDate', 'eventTime'];
    if (['title', ...timingControls].some(c => this.eventForm.get(c)?.invalid)) return 1;
    return -1;
  }

  private scrollPageToTop(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.querySelector('.vl-body-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Category Selection (auto advance) ─────────────────
  selectCategory(catId: string): void {
    this.eventForm.patchValue({ category: catId });
    // Short delay then advance
    setTimeout(() => this.nextStep(), 200);
  }

  // ── Attendee Mix ──────────────────────────────────────
  getAttendeeMixLabel(): string {
    const v = this.eventForm.get('attendeeMix')?.value ?? 50;
    if (v < 40) return 'Female heavy';
    if (v > 60) return 'Male heavy';
    return 'Balanced';
  }

  // ── Expectations (multi-select chips) ─────────────────
  toggleExpectation(tag: string): void {
    const current: string[] = this.eventForm.get('expectations')?.value ?? [];
    const updated = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    this.eventForm.patchValue({ expectations: updated });
  }

  isExpectationSelected(tag: string): boolean {
    return ((this.eventForm.get('expectations')?.value ?? []) as string[]).includes(tag);
  }

  // ── Image Handling ────────────────────────────────────
  async onMainImageChange(event: any): Promise<void> {
    const file: File = event.target.files[0];
    if (!file) return;

    this.isImageLoading = true;
    try {
      const finalFile = await this.sharedService.convertHeicToJpg(file);

      this.mainImageFile = finalFile;
      this.shouldReplaceCoverWithDefault = false;
      const reader = new FileReader();
      reader.onload = () => (this.mainImagePreview = reader.result);
      reader.readAsDataURL(finalFile);
      this.eventForm.markAsDirty();
    } catch (err) {
      console.error('Error processing image:', err);
    } finally {
      this.isImageLoading = false;
      event.target.value = '';
    }
  }

  get canRemoveMainImage(): boolean {
    return !!this.mainImagePreview;
  }

  removeMainImage(input?: HTMLInputElement): void {
    if (input) {
      input.value = '';
    }

    this.mainImageFile = null;
    this.mainImagePreview = null;
    this.shouldReplaceCoverWithDefault = this.isEditMode;
    this.eventForm.markAsDirty();
  }

  async onGalleryChange(event: any): Promise<void> {
    const files: File[] = Array.from(event.target.files);
    if (!files.length) return;

    this.isImageLoading = true;
    try {
      for (const file of files) {
        let finalFile: File;
        try {
          finalFile = await this.sharedService.convertHeicToJpg(file);
        } catch (e) {
          console.error('HEIC conversion failed for', file.name, e);
          continue;
        }

        this.galleryFiles.push(finalFile);
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) this.galleryPreviews.push(reader.result.toString());
        };
        reader.readAsDataURL(finalFile);
      }
    } finally {
      this.isImageLoading = false;
    }
  }

  removeGalleryImage(index: number): void {
    this.galleryFiles.splice(index, 1);
    this.galleryPreviews.splice(index, 1);
  }

  private async getCoverImageForPayload(): Promise<File> {
    if (this.mainImageFile) return this.mainImageFile;

    const response = await fetch(this.defaultCoverImage);
    if (!response.ok) {
      throw new Error('Unable to load default cover image');
    }

    const blob = await response.blob();
    return new File([blob], 'viblooop-default-cover.jpg', { type: blob.type || 'image/jpeg' });
  }

  // ── Form Submit ───────────────────────────────────────
  async submitForm(): Promise<void> {
    if (this.isSubmittingEvent || this.isEventCreatedOverlayVisible) return;

    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      const step = this.findFirstInvalidStep();
      if (step !== -1) this.currentStep = step;
      return;
    }

    if (this.isEditMode && !this.editEventId) {
      console.error('Cannot update event without an event id.');
      return;
    }

    this.isSubmittingEvent = true;

    const formData = new FormData();
    Object.keys(this.eventForm.controls).forEach(key => {
      const value = key === 'eventTime' && this.isEscapeCreation
        ? (this.eventForm.get(key)?.value || '00:00')
        : this.eventForm.get(key)?.value;
      if (key === 'address' || key === 'expectations') {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'price') {
        formData.append(key, value ? value.toString() : '0');
      } else {
        formData.append(key, value?.toString() ?? '');
      }
    });

    if (this.isEditMode && this.editEventId) {
      formData.append('eventId', this.editEventId);
      if (this.mainImageFile) {
        formData.append('image', this.mainImageFile);
      } else if (this.shouldReplaceCoverWithDefault) {
        try {
          const coverImage = await this.getCoverImageForPayload();
          formData.append('image', coverImage);
        } catch (err) {
          this.isSubmittingEvent = false;
          console.error('Error preparing cover image:', err);
          return;
        }
      }
    } else {
      try {
        const coverImage = await this.getCoverImageForPayload();
        formData.append('image', coverImage);
      } catch (err) {
        this.isSubmittingEvent = false;
        console.error('Error preparing cover image:', err);
        return;
      }
    }

    this.galleryFiles.forEach(f => formData.append('gallery', f));

    const request$ = this.isEditMode
      ? this.eventService.updateEvent(formData)
      : this.eventService.createEvent(formData);

    request$.subscribe({
      next: res => {
        const eventId = res?.data?.event?._id;

        if (this.isEditMode && res?.success && res.statusCode === 200 && eventId) {
          this.isSubmittingEvent = false;
          this.eventForm.markAsPristine();
          this.router.closeDrawerOrNavigate(`/events/${eventId}`);
          return;
        }

        if (!this.isEditMode && res?.success && res.statusCode === 201 && eventId) {
          this.createdEventId = eventId;
          this.isSubmittingEvent = false;
          this.isEventCreatedOverlayVisible = true;
          this.scrollPageToTop();
          return;
        }

        this.isSubmittingEvent = false;
      },
      error: err => {
        this.isSubmittingEvent = false;
        console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} event:`, err);
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

  private updateDateValidatorsForCreationKind(): void {
    const eventTime = this.eventForm.get('eventTime');
    const endDate = this.eventForm.get('endDate');

    if (this.isEscapeCreation) {
      eventTime?.clearValidators();
      eventTime?.setValue('', { emitEvent: false });
      endDate?.setValidators([Validators.required]);
    } else {
      eventTime?.setValidators([Validators.required]);
      endDate?.clearValidators();
      endDate?.setValue('', { emitEvent: false });
    }

    eventTime?.updateValueAndValidity({ emitEvent: false });
    endDate?.updateValueAndValidity({ emitEvent: false });
  }

  private keepEndDateOnOrAfterStartDate(): void {
    if (!this.isEscapeCreation) return;

    const startDate = this.eventForm.get('eventDate')?.value;
    const endDate = this.eventForm.get('endDate')?.value;

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      this.eventForm.get('endDate')?.setValue('');
    }
  }

  private syncCreationKindFromSelectedCategory(): void {
    this.updateDateValidatorsForCreationKind();
  }
}
