import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventsService } from '../../../shared/services/events/events.service';
import { HttpClient } from '@angular/common/http';
import { RouteService } from '../../../shared/services/route/route.service';
import { CanComponentDeactivate } from '../../../guards/unsave-changes/unsave-change.guard';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'vl-create-event',
  imports: [ReactiveFormsModule],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.scss'
})
export class AddEventComponent implements OnInit, CanComponentDeactivate {
  categories: any;
  selectedImageFile: File | null = null;
  eventForm: FormGroup;
  mainImageFile: File | null = null;
  galleryFiles: File[] = [];
  mainImagePreview: string | ArrayBuffer | null = null;
  galleryPreviews: string[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient, private eventService: EventsService, private router: RouteService, private sharedService: SharedService) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      eventDate: ['', Validators.required],
      eventTime: ['', Validators.required],
      address: this.fb.group({
        street: ['', Validators.required],
        area: [''],
        landmark: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        pinCode: ['', Validators.required],
        country: ['', Validators.required],
      }),
      attendeeLimit: ['', Validators.required],
      tags: [''],
      category: ['', Validators.required],
    });
  }
  canDeactivate(): boolean {
    if(this.eventForm.dirty) {
      return confirm('You have unsaved changes! Are you sure you want to leave this page?');
    }
    return true;
  }

  ngOnInit() {
    this.eventService.getCategoriesList().subscribe((res: any) => {
      if (res.data) {
        this.categories = res.data.categories;
        console.log(this.categories);
      }
    });
  }

  async onMainImageChange(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    this.mainImageFile = await this.sharedService.convertHeicToJpg(file);
    if (this.mainImageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.mainImagePreview = reader.result;
      };
      reader.readAsDataURL(this.mainImageFile);
    }
  }

  removeEventImage() {
    this.mainImageFile = null;
    this.mainImagePreview = null;
  }

  async onGalleryChange(event: any): Promise<void> {
    const files: File[] = Array.from(event.target.files);
    this.galleryPreviews = [];
    this.galleryFiles = [];

    for (const file of files) {
      const finalFile = await this.sharedService.convertHeicToJpg(file);
      this.galleryFiles.push(finalFile);
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.galleryPreviews.push(reader.result.toString());
        }
      };
      reader.readAsDataURL(finalFile);
    }
  }

  removeGalleryImage(index: number) {
    if (index >= 0 && index < this.galleryFiles.length) {
      this.galleryFiles.splice(index, 1);
      this.galleryPreviews.splice(index, 1);
    }
  }
  onPinCodeBlur() {
    const postalCode = this.eventForm.get('address.pinCode')?.value;
    if (postalCode.length >= 5) {
      this.eventService.getInfoByPostalCode(postalCode).subscribe((response: any) => {
        if (!response) return;
        const data = response.data;
        const addressGroup = this.eventForm.get('address');
        if (addressGroup) {
          addressGroup.patchValue({
            city: data.city,
            state: data.state,
            country: data.country
          });
        }
      });
    }
  }
  onSubmit() {
    if (!this.eventForm.valid) return;

    const formData = new FormData();

    // append normal fields
    Object.keys(this.eventForm.controls).forEach(key => {
      if (key === 'address') {
        formData.append('address', JSON.stringify(this.eventForm.value.address));
      } else {
        formData.append(key, this.eventForm.get(key)?.value);
      }
    });

    // append main image
    if (this.mainImageFile) {
      formData.append('image', this.mainImageFile);
    }

    // append gallery images
    this.galleryFiles.forEach(file => {
      formData.append('gallery', file);
    });

    this.eventService.createEvent(formData).subscribe({
      next: res => {
        if (res?.success && res.statusCode === 201) {
          this.router.navigate('/events', res.data.event._id);
        }
      },
      error: (err: any) => {
        console.error('Error:', err);
      }
    });
  }
}
