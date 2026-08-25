describe('test environment', () => {
  it('provides ResizeObserver for layout components', () => {
    const observer = new ResizeObserver(() => undefined);

    expect(observer).toBeInstanceOf(ResizeObserver);
    expect(() => observer.observe(document.body)).not.toThrow();
    expect(() => observer.disconnect()).not.toThrow();
  });
});
