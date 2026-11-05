import { ElementRef } from '@angular/core';
import { OutsideClickDirective } from './outside-click.directive';

describe('OutsideClickDirective', () => {
  it('should create an instance', () => {
    const mockEl = new ElementRef(document.createElement('div'));
    const directive = new OutsideClickDirective(mockEl);
    expect(directive).toBeTruthy();
  });
});
