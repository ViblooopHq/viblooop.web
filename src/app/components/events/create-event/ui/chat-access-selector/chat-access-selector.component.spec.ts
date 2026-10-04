import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatAccessSelectorComponent } from './chat-access-selector.component';

describe('ChatAccessSelectorComponent', () => {
  let component: ChatAccessSelectorComponent;
  let fixture: ComponentFixture<ChatAccessSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatAccessSelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatAccessSelectorComponent);
    fixture.componentRef.setInput('hostOnlyChat', false);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
