import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'img[ngSrc].blur-up'
})
export class BlurUpDirective {

  constructor(private el: ElementRef<HTMLImageElement>) {}

  @HostListener('load')
  onLoad() {
    this.el.nativeElement.setAttribute('data-loaded', 'true');
  }

}
