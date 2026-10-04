export function playerFactory(): Promise<typeof import('lottie-web')> {
  const canUseCanvas = (() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;

    try {
      return typeof document.createElement('canvas').getContext === 'function';
    } catch {
      return false;
    }
  })();

  if (!canUseCanvas) {
    const animationItem = {
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      destroy: () => undefined,
      goToAndPlay: () => undefined,
      goToAndStop: () => undefined,
      pause: () => undefined,
      play: () => undefined,
      setDirection: () => undefined,
      setSpeed: () => undefined,
      stop: () => undefined,
    };

    const player = {
      loadAnimation: () => ({
        ...animationItem,
      }),
      ...animationItem,
      registerAnimation: () => undefined,
      setQuality: () => undefined,
    };

    return Promise.resolve({ default: player } as unknown as typeof import('lottie-web'));
  }

  return import('lottie-web');
}
