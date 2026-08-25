class TestResizeObserver implements ResizeObserver {
  disconnect(): void {
    return;
  }

  observe(target: Element, options?: ResizeObserverOptions): void {
    void target;
    void options;
  }

  unobserve(target: Element): void {
    void target;
  }
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  configurable: true,
  value: TestResizeObserver,
  writable: true,
});
