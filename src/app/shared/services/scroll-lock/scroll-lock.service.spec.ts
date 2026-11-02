import { TestBed } from '@angular/core/testing';
import { ScrollLockService } from './scroll-lock.service';

describe('ScrollLockService', () => {
  let service: ScrollLockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrollLockService);
    service.reset();
  });

  afterEach(() => {
    service.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set overflow hidden when locked', () => {
    service.lock();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('hidden');
  });

  it('should restore overflow to auto when unlocked', () => {
    service.lock();
    expect(document.body.style.overflow).toBe('hidden');

    service.unlock();
    expect(document.body.style.overflow).toBe('auto');
    expect(document.documentElement.style.overflow).toBe('auto');
  });

  it('should handle reference counting for nested locks', () => {
    service.lock();
    service.lock();
    expect(document.body.style.overflow).toBe('hidden');

    // First unlock should still keep it hidden
    service.unlock();
    expect(document.body.style.overflow).toBe('hidden');

    // Second unlock restores to auto
    service.unlock();
    expect(document.body.style.overflow).toBe('auto');
  });
});

