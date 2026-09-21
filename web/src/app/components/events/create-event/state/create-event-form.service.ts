import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventsService } from '../../../../shared/services/events/events.service';
import { EventCategoryPresentationService } from '../../../../shared/services/events/event-category-presentation.service';
import {
  CREATE_EVENT_CAPACITY_CONFIG,
  CREATE_EVENT_EXPECTATIONS,
  CREATE_EVENT_HOST_NOTES_MAX_LENGTH,
  CREATE_EVENT_TYPE_CONFIGS,
  CreationKind,
  CreationTypeConfig,
} from '../create-event.config';
import { AudienceMixType, EventCostType } from '../create-event.types';

@Injectable()
export class CreateEventFormService {
  private readonly fb = inject(FormBuilder);
  private readonly eventsService = inject(EventsService);
  private readonly categoryPresentation = inject(EventCategoryPresentationService);

  readonly today = new Date();
  readonly minDate = new Date();

  readonly eventForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    shortDescription: [''],
    eventDate: ['', Validators.required],
    endDate: [''],
    eventTime: ['', Validators.required],
    endTime: [''],
    address: this.fb.group({
      street: ['', Validators.required],
      area: ['', Validators.required],
      landmark: [''],
      pinCode: ['', Validators.required],
    }),
    attendeeLimit: [
      CREATE_EVENT_CAPACITY_CONFIG.defaultLimitedValue,
      [Validators.required, Validators.min(CREATE_EVENT_CAPACITY_CONFIG.min), Validators.max(CREATE_EVENT_CAPACITY_CONFIG.max)],
    ],
    audiencePreference: ['open'],
    attendeeMix: [50],
    hostOnlyChat: [false],
    safetyGuidelines: [false],
    safetyAgreement: [false, Validators.requiredTrue],
    expectations: [[] as string[]],
    tags: [''],
    category: ['', Validators.required],
    cost: ['Free', Validators.required],
    price: [''],
  });

  get addressGroup(): FormGroup {
    return this.eventForm.get('address') as FormGroup;
  }

  // ── Cross-field reactive reads (needed so OnPush views update on changes from other steps) ──
  readonly categoryValue = toSignal(this.eventForm.get('category')!.valueChanges, { initialValue: this.eventForm.get('category')!.value });
  private readonly eventDateValue = toSignal(this.eventForm.get('eventDate')!.valueChanges, { initialValue: this.eventForm.get('eventDate')!.value });
  readonly eventTimeValue = toSignal(this.eventForm.get('eventTime')!.valueChanges, { initialValue: this.eventForm.get('eventTime')!.value });
  readonly endTimeValue = toSignal(this.eventForm.get('endTime')!.valueChanges, { initialValue: this.eventForm.get('endTime')!.value });
  private readonly attendeeMixValue = toSignal(this.eventForm.get('attendeeMix')!.valueChanges, { initialValue: this.eventForm.get('attendeeMix')!.value });
  readonly attendeeLimitValue = toSignal(this.eventForm.get('attendeeLimit')!.valueChanges, { initialValue: this.eventForm.get('attendeeLimit')!.value });
  readonly descriptionValue = toSignal(this.eventForm.get('description')!.valueChanges, { initialValue: this.eventForm.get('description')!.value as string });
  readonly expectationsValue = toSignal<string[]>(this.eventForm.get('expectations')!.valueChanges, { initialValue: this.eventForm.get('expectations')!.value ?? [] });
  /** Whole-form snapshot, used by the review step to react to fields owned by other steps under OnPush. */
  readonly formValue = toSignal(this.eventForm.valueChanges, { initialValue: this.eventForm.getRawValue() });

  // ── Category / creation-kind state ──────────────────────────────
  readonly categories = signal<any[]>([]);
  readonly isEditMode = signal(false);
  private readonly editEventId = signal<string | null>(null);

  readonly selectedCategory = computed(() => {
    const catId = this.categoryValue();
    return this.categories().find(c => c._id === catId || c.id === catId);
  });

  readonly creationKind = computed<CreationKind>(() => this.categoryPresentation.getCreationKind(this.selectedCategory()));
  readonly selectedCreationConfig = computed<CreationTypeConfig>(() => CREATE_EVENT_TYPE_CONFIGS[this.creationKind()]);

  readonly isEscapeCreation = computed(() => this.selectedCreationConfig().usesDateRange);
  readonly isHangoutCreation = computed(() => this.selectedCreationConfig().requiresEndTime);
  readonly requiresEndDate = computed(() => this.isEscapeCreation() || this.isHangoutCreation());
  readonly createHeaderTitle = computed(() => (this.isEditMode() ? 'Edit Event' : this.selectedCreationConfig().headerTitle));
  readonly createHeaderSubtitle = computed(() => (this.isEditMode() ? 'Update the details for your vibe' : "Let's set up your amazing event"));
  readonly titleFieldLabel = computed(() => this.selectedCreationConfig().titleFieldLabel);
  readonly titleFieldHint = computed(() => this.selectedCreationConfig().titleFieldHint);
  readonly titleFieldPlaceholder = computed(() => this.selectedCreationConfig().titleFieldPlaceholder);
  readonly timingTitle = computed(() => this.selectedCreationConfig().timingTitle);
  readonly timingHint = computed(() => this.selectedCreationConfig().timingHint);
  readonly locationHint = computed(() => this.selectedCreationConfig().locationHint);
  readonly addressFieldLabel = computed(() => this.selectedCreationConfig().addressFieldLabel);
  readonly addressFieldHint = computed(() => this.selectedCreationConfig().addressFieldHint);
  readonly addressFieldPlaceholder = computed(() => this.selectedCreationConfig().addressFieldPlaceholder);
  readonly areaFieldHint = computed(() => this.selectedCreationConfig().areaFieldHint);
  readonly areaFieldPlaceholder = computed(() => this.selectedCreationConfig().areaFieldPlaceholder);
  readonly defaultCoverImage = computed(() => this.selectedCreationConfig().defaultCoverImage);
  readonly stepTwoDescription = computed(() => this.selectedCreationConfig().stepTwoDescription);
  readonly stepThreeDescription = computed(() => this.selectedCreationConfig().stepThreeDescription);
  readonly chatAccessSubtitle = computed(() => this.selectedCreationConfig().chatAccessSubtitle);
  readonly everyoneChatMobileDescription = computed(() => this.selectedCreationConfig().everyoneChatMobileDescription);
  readonly hostOnlyChatMobileDescription = computed(() => this.selectedCreationConfig().hostOnlyChatMobileDescription);
  readonly hostNotesTitle = computed(() => this.selectedCreationConfig().hostNotesTitle);
  readonly hostNotesSubtitle = computed(() => this.selectedCreationConfig().hostNotesSubtitle);
  readonly hostNotesPlaceholder = computed(() => this.selectedCreationConfig().hostNotesPlaceholder);
  readonly hostNoteQuickAdds = computed(() => this.selectedCreationConfig().hostNoteQuickAdds);
  readonly eventCreatedAnimationPath = computed(() => this.selectedCreationConfig().animationPath);

  readonly minEndDate = computed<Date>(() => this.eventDateValue() || this.minDate);
  readonly datePickerMinDate = computed<Date | null>(() => (this.isEditMode() ? null : this.minDate));

  getSelectedCategoryTitle(): string {
    const cat = this.selectedCategory();
    return cat ? this.categoryPresentation.getDisplayTitle(cat) : '';
  }

  getSelectedCategoryIcon(): string {
    const cat = this.selectedCategory();
    return cat ? this.categoryPresentation.getDisplayIcon(cat) : 'celebration';
  }

  // ── Capacity ─────────────────────────────────────────────────────
  readonly isCapacityLimited = signal(true);
  readonly capacityMin = CREATE_EVENT_CAPACITY_CONFIG.min;
  readonly capacityMax = CREATE_EVENT_CAPACITY_CONFIG.max;
  readonly openCapacityLimit = CREATE_EVENT_CAPACITY_CONFIG.openLimit;
  readonly quickCapacityOptions = CREATE_EVENT_CAPACITY_CONFIG.quickOptions;

  setAttendeeLimit(val: number): void {
    this.eventForm.patchValue({ attendeeLimit: val });
  }

  setCapacityType(limited: boolean): void {
    this.isCapacityLimited.set(limited);
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

  setCapacityFromInput(rawValue: string): number {
    const nextValue = this.normalizeCapacityValue(rawValue);
    this.eventForm.patchValue({ attendeeLimit: nextValue });
    return nextValue;
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

  // ── Audience mix ─────────────────────────────────────────────────
  readonly mixType = signal<AudienceMixType>('open');

  setMixType(type: AudienceMixType): void {
    this.mixType.set(type);
    if (type === 'women') this.eventForm.patchValue({ audiencePreference: type, attendeeMix: 10 });
    if (type === 'men') this.eventForm.patchValue({ audiencePreference: type, attendeeMix: 90 });
    if (type === 'open') this.eventForm.patchValue({ audiencePreference: type, attendeeMix: 50 });
  }

  readonly mixLabel = computed(() => {
    const val = this.attendeeMixValue();
    if (this.mixType() === 'open') return 'Open for All';
    if (val <= 20) return 'Women Focused';
    if (val >= 80) return 'Men Focused';
    return 'Balanced';
  });

  readonly mixSub = computed(() => {
    if (this.mixType() === 'open') return "Anyone can join! Everyone's welcome.";
    const val = this.attendeeMixValue();
    if (val <= 20) return "A space that's mostly women, comfortable and safe.";
    if (val >= 80) return "A space that's mostly men, chill and exciting.";
    return 'An equal mix of everyone for a great vibe.';
  });

  readonly attendeeMixLabel = computed(() => {
    const v = this.attendeeMixValue() ?? 50;
    if (v < 40) return 'Female heavy';
    if (v > 60) return 'Male heavy';
    return 'Balanced';
  });

  // ── Cost / chat access ───────────────────────────────────────────
  setCost(cost: EventCostType): void {
    this.eventForm.patchValue({ cost });

    if (cost === 'Free') {
      this.eventForm.get('price')?.setValue('');
      this.eventForm.get('price')?.setErrors(null);
    }
  }

  setChatAccess(hostOnlyChat: boolean): void {
    this.eventForm.patchValue({ hostOnlyChat });
  }

  // ── Host notes ───────────────────────────────────────────────────
  readonly hostNotesMaxLength = CREATE_EVENT_HOST_NOTES_MAX_LENGTH;

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

  // ── Expectations chips (previously orphaned, now wired to Step 3) ─
  readonly availableExpectations = computed(() =>
    this.categoryPresentation.getExpectationTags(this.selectedCategory()).length
      ? this.categoryPresentation.getExpectationTags(this.selectedCategory())
      : CREATE_EVENT_EXPECTATIONS
  );

  toggleExpectation(tag: string): void {
    const current: string[] = this.eventForm.get('expectations')?.value ?? [];
    const updated = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    this.eventForm.patchValue({ expectations: updated, tags: updated.join(', ') });
  }

  isExpectationSelected(tag: string): boolean {
    return ((this.eventForm.get('expectations')?.value ?? []) as string[]).includes(tag);
  }

  // ── Date helpers ─────────────────────────────────────────────────
  readonly minTime = signal('');

  private updateMinTime(): void {
    const selectedDate = this.eventForm.get('eventDate')?.value;
    if (!selectedDate) return;

    const now = new Date();
    const selDate = new Date(selectedDate);
    const isToday = selDate.toDateString() === now.toDateString();

    if (isToday) {
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      this.minTime.set(`${hours}:${minutes}`);
    } else {
      this.minTime.set('');
    }
  }

  private keepEndDateOnOrAfterStartDate(): void {
    if (!this.requiresEndDate()) return;

    const startDate = this.eventForm.get('eventDate')?.value;
    const endDate = this.eventForm.get('endDate')?.value;

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      this.eventForm.get('endDate')?.setValue('');
    }
  }

  private updateDateValidatorsForCreationKind(): void {
    const eventTime = this.eventForm.get('eventTime');
    const endTime = this.eventForm.get('endTime');
    const endDate = this.eventForm.get('endDate');

    if (this.requiresEndDate()) {
      endDate?.setValidators([Validators.required]);
    } else {
      endDate?.clearValidators();
    }

    if (this.isEscapeCreation()) {
      eventTime?.clearValidators();
    } else {
      eventTime?.setValidators([Validators.required]);
    }

    if (this.isHangoutCreation()) {
      endTime?.setValidators([Validators.required]);
    } else {
      endTime?.clearValidators();
    }

    eventTime?.updateValueAndValidity({ emitEvent: false });
    endTime?.updateValueAndValidity({ emitEvent: false });
    endDate?.updateValueAndValidity({ emitEvent: false });
  }

  clearLocation(): void {
    this.addressGroup.patchValue({ street: '', area: '', landmark: '', pinCode: '' });
  }

  // ── Lifecycle / init ─────────────────────────────────────────────
  constructor() {
    this.eventForm.get('eventDate')?.valueChanges.subscribe(() => {
      this.updateMinTime();
      this.keepEndDateOnOrAfterStartDate();
    });
    this.eventForm.get('category')?.valueChanges.subscribe(() => {
      this.updateDateValidatorsForCreationKind();
      if (!this.isEditMode()) {
        this.eventForm.patchValue({ expectations: [], tags: '' });
      }
    });
  }

  init(): void {
    this.eventsService.getCategoriesList().subscribe((res: any) => {
      if (res?.data?.categories) {
        const enriched = res.data.categories
          .map((category: any) => this.categoryPresentation.withDisplayTags(category));
        if (!enriched.some((category: any) => this.categoryPresentation.getCreationKind(category) === 'play')) {
          enriched.push(this.categoryPresentation.withDisplayTags({
            id: 'play',
            title: 'Sports',
            description: 'Games, sports, fitness & more',
            image: 'assets/images/play-page-bg.png',
            icon: 'sports_soccer',
            tags: ['sports', 'play', 'gaming', 'fitness'],
          }));
        }

        enriched.sort((a: any, b: any) => this.categoryPresentation.getDisplayOrder(a) - this.categoryPresentation.getDisplayOrder(b));
        const seenTitles = new Set<string>();
        const uniqueCategories = enriched.filter((cat: any) => {
          const displayTitle = this.categoryPresentation.getDisplayTitle(cat);
          if (!displayTitle) return true;
          if (seenTitles.has(displayTitle)) return false;
          seenTitles.add(displayTitle);
          return true;
        });

        this.categories.set(uniqueCategories);
        this.updateDateValidatorsForCreationKind();
      }
    });
    this.updateMinTime();
    this.updateDateValidatorsForCreationKind();
  }

  setEditMode(isEdit: boolean, eventId: string | null): void {
    this.isEditMode.set(isEdit);
    this.editEventId.set(isEdit ? eventId : null);
  }

  getEditEventId(): string | null {
    return this.editEventId();
  }

  /** Patches the form from a fetched event; image state is hydrated separately by the caller. */
  hydrateFromEvent(event: any): void {
    const attendeeLimit = Number(event.attendeeLimit || CREATE_EVENT_CAPACITY_CONFIG.defaultLimitedValue);
    const isLimited = attendeeLimit < this.openCapacityLimit;
    const audiencePreference = this.normalizeAudiencePreference(event.audiencePreference, event.attendeeMix);
    const price = Number(event.price || 0);

    this.mixType.set(audiencePreference);

    this.eventForm.patchValue({
      title: event.title || '',
      description: event.description || '',
      shortDescription: event.shortDescription || '',
      eventDate: this.toDateControlValue(event.eventDate),
      endDate: this.toDateControlValue(event.endDate || event.eventDate),
      eventTime: this.toTimeControlValue(event.eventTime),
      endTime: this.toTimeControlValue(event.endTime),
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
    this.updateMinTime();
    this.updateDateValidatorsForCreationKind();
    this.eventForm.markAsPristine();
    this.eventForm.markAsUntouched();
  }

  private getCategoryId(category: any): string {
    if (!category) return '';
    if (typeof category === 'string') return category;
    return category._id || category.id || '';
  }

  private normalizeAudiencePreference(value: unknown, attendeeMix: unknown): AudienceMixType {
    const preference = String(value || '').toLowerCase();
    if (preference === 'open' || preference === 'women' || preference === 'men') return preference;

    const mix = Number(attendeeMix);
    if (Number.isFinite(mix)) {
      if (mix <= 20) return 'women';
      if (mix >= 80) return 'men';
    }

    return 'open';
  }

  private attendeeMixFromPreference(preference: AudienceMixType): number {
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

  // ── Per-step validation ──────────────────────────────────────────
  isStep2Invalid(): boolean {
    const f = this.eventForm;
    const addr = this.addressGroup;
    return (
      !f.get('title')?.value ||
      !f.get('eventDate')?.value ||
      (this.requiresEndDate() && !f.get('endDate')?.value) ||
      (!this.isEscapeCreation() && !f.get('eventTime')?.value) ||
      (this.isHangoutCreation() && !f.get('endTime')?.value) ||
      !addr.get('street')?.value ||
      !addr.get('area')?.value ||
      !addr.get('pinCode')?.value
    );
  }

  validateStep(step: number): boolean {
    if (step === 0) {
      if (this.eventForm.get('category')?.invalid) {
        this.eventForm.get('category')?.markAsTouched();
        return false;
      }
      return true;
    }

    if (step === 1) {
      const controls = this.isEscapeCreation()
        ? ['title', 'eventDate', 'endDate']
        : ['title', 'eventDate', 'eventTime'];
      if (this.isHangoutCreation()) controls.push('endDate', 'endTime');
      if (this.isCapacityLimited()) controls.push('attendeeLimit');

      let valid = true;
      controls.forEach(ctrl => {
        if (this.eventForm.get(ctrl)?.invalid) {
          this.eventForm.get(ctrl)?.markAsTouched();
          valid = false;
        }
      });

      ['street', 'area', 'pinCode'].forEach(ctrl => {
        if (this.addressGroup.get(ctrl)?.invalid) {
          this.addressGroup.get(ctrl)?.markAsTouched();
          valid = false;
        }
      });

      const attendeeLimit = Number(this.eventForm.get('attendeeLimit')?.value);
      if (this.isCapacityLimited() && (attendeeLimit < this.capacityMin || attendeeLimit > this.capacityMax)) {
        alert(`Capacity must be between ${this.capacityMin} and ${this.capacityMax} spots.`);
        return false;
      }

      if (this.isHangoutCreation() && !this.hasValidHangoutDateTimeRange()) {
        alert('Hangout end date and time must be after the start date and time.');
        return false;
      }
      return valid;
    }

    if (step === 2) {
      const selectedDate = this.eventForm.get('eventDate')?.value;
      const selectedTime = this.eventForm.get('eventTime')?.value;

      if (this.isEscapeCreation()) {
        const endDate = this.eventForm.get('endDate')?.value;
        if (selectedDate && endDate && new Date(endDate) < new Date(selectedDate)) {
          alert('Trip end date cannot be before the start date.');
          return false;
        }
      } else if (!this.isEditMode() && selectedDate && selectedTime) {
        const now = new Date();
        const [hours, minutes] = selectedTime.split(':');
        const eventDateTime = new Date(selectedDate);
        eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        if (eventDateTime < now) {
          alert('Event cannot be in the past! Please select a future date and time.');
          return false;
        }
      }

      if (this.eventForm.get('cost')?.value === 'Paid' && !(this.eventForm.get('price')?.value > 0)) {
        this.eventForm.get('price')?.setErrors({ invalidPrice: true });
        return false;
      }
      return true;
    }

    return true;
  }

  findFirstInvalidStep(): number {
    if (this.eventForm.get('category')?.invalid) return 0;
    const timingControls = this.isEscapeCreation()
      ? ['eventDate', 'endDate']
      : ['eventDate', 'eventTime', ...(this.isHangoutCreation() ? ['endDate', 'endTime'] : [])];
    if (['title', ...timingControls].some(c => this.eventForm.get(c)?.invalid)) return 1;
    return -1;
  }

  // ── Submit payload assembly ──────────────────────────────────────
  /** Builds the FormData for non-image fields, matching the exact contract EventsService expects. */
  buildFormData(): FormData {
    const formData = new FormData();

    Object.keys(this.eventForm.controls).forEach(key => {
      let value = this.eventForm.get(key)?.value;
      if (key === 'eventTime' && this.isEscapeCreation()) value = value || '00:00';
      if (key === 'endTime' && !this.isHangoutCreation()) value = '';

      if (key === 'address' || key === 'expectations') {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'price') {
        formData.append(key, value ? value.toString() : '0');
      } else {
        formData.append(key, value?.toString() ?? '');
      }
    });

    return formData;
  }

  private hasValidHangoutDateTimeRange(): boolean {
    const startDate = this.eventForm.get('eventDate')?.value;
    const endDate = this.eventForm.get('endDate')?.value;
    const startTime = this.eventForm.get('eventTime')?.value;
    const endTime = this.eventForm.get('endTime')?.value;
    if (!startDate || !endDate || !startTime || !endTime) return false;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    start.setHours(startHours, startMinutes, 0, 0);
    end.setHours(endHours, endMinutes, 0, 0);

    return end > start;
  }
}
