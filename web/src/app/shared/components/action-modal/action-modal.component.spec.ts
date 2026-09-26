import { TestBed } from '@angular/core/testing';
import { ActionModalComponent } from './action-modal.component';

describe('ActionModalComponent event confirmations', () => {
  it('requires a cancellation reason and prevents actions while submitting', () => {
    const fixture = TestBed.createComponent(ActionModalComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('presentation', 'sheet');
    fixture.componentRef.setInput('showInput', true);
    fixture.componentRef.setInput('inputRequired', true);
    fixture.detectChanges();
    const confirmed = spyOn(component.confirmed, 'emit');
    const cancelled = spyOn(component.cancelled, 'emit');
    component.onConfirm();
    expect(confirmed).not.toHaveBeenCalled();
    component.onInputChange('  Bad weather  ');
    component.onConfirm();
    expect(confirmed).toHaveBeenCalledOnceWith('Bad weather');
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    component.onConfirm();
    component.onCancel();
    expect(confirmed).toHaveBeenCalledTimes(1);
    expect(cancelled).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.vl-modal__close').disabled).toBeTrue();
  });

  it('renders the delete confirmation as a sheet with a destructive action', () => {
    const fixture = TestBed.createComponent(ActionModalComponent);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('presentation', 'sheet');
    fixture.componentRef.setInput('destructive', true);
    fixture.componentRef.setInput('icon', 'delete');
    fixture.componentRef.setInput('confirmLabel', 'Yes, Delete Event');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.vl-modal-backdrop--sheet')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.vl-modal__btn--destructive').textContent).toContain('Yes, Delete Event');
    expect(fixture.nativeElement.querySelector('.vl-modal__icon-ring').textContent).toContain('delete');
  });
});
