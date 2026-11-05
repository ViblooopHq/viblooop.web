import { ElementRef } from '@angular/core';
import { BlurUpDirective } from './blur-up.directive';

describe('BlurUpDirective', () => {
  it('should create an instance', () => {
    const mockEl = new ElementRef(document.createElement('img'));
    const directive = new BlurUpDirective(mockEl);
    expect(directive).toBeTruthy();
  });
});
