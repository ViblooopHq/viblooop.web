import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'vl-stepper',
  imports: [CommonModule],
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent {
  @Input() totalSteps: string[] = []; // Array of step names
  @Input() currentStep: number = 0;   // Index of the current step
  @Output() stepChange = new EventEmitter<number>();

  goToStep(index: number) {
    if (index >= 0 && index < this.totalSteps.length) {
      this.stepChange.emit(index);
    }
  }
}
