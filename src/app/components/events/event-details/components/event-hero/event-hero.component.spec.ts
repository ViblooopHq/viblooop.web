import { TestBed } from '@angular/core/testing';
import { EventHeroComponent } from './event-hero.component';
import { SharedService } from '../../../../../shared/services/shared.service';

describe('EventHeroComponent action sheet', () => {
  it('opens a modal sheet and sends edit, cancel, delete and dismiss actions', () => {
    TestBed.configureTestingModule({ providers: [{ provide: SharedService, useValue: { getImageUrl: (value: string) => value } }] });
    const fixture = TestBed.createComponent(EventHeroComponent);
    fixture.componentRef.setInput('isEventCreator', true);
    fixture.componentRef.setInput('isEventMenuOpen', true);
    fixture.detectChanges();
    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    expect(dialog.open).toBeTrue();
    const component = fixture.componentInstance;
    const edit = spyOn(component.editEvent, 'emit');
    const cancel = spyOn(component.cancelEvent, 'emit');
    const remove = spyOn(component.deleteEvent, 'emit');
    const close = spyOn(component.closeMenu, 'emit');
    const actions = dialog.querySelectorAll<HTMLButtonElement>('.event-action');
    actions[0].click();
    actions[1].click();
    actions[2].click();
    expect(edit).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(close).toHaveBeenCalledTimes(1);
    fixture.componentRef.setInput('isEventMenuOpen', false);
    fixture.detectChanges();
    expect(dialog.open).toBeFalse();
  });
});
