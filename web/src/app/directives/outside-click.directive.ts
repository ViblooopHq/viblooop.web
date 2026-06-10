import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[vibOutsideClick]'
})
export class OutsideClickDirective {
  @Output() onOutsideClick = new EventEmitter<void>();
  constructor(private element: ElementRef) { }

  @HostListener('document:click', ['$event'])
   onDocumentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if( !this.element.nativeElement.contains(targetElement) ) {
      this.onOutsideClick.emit();
    }
  }
}
