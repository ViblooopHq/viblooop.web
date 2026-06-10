import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyEventTabsComponent } from './my-event-tabs.component';

describe('MyEventTabsComponent', () => {
  let component: MyEventTabsComponent;
  let fixture: ComponentFixture<MyEventTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyEventTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyEventTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
