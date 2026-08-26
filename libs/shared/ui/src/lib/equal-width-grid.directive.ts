import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
} from '@angular/core';

const COLUMN_WIDTH_PROPERTY = '--pulso-equal-width-grid-column';

@Directive({
  selector: '[pulsoCrmEqualWidthGrid]',
})
export class EqualWidthGridDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.observeLayout());
  }

  private observeLayout(): void {
    const grid = this.elementRef.nativeElement;
    let animationFrame: number | undefined;
    let destroyed = false;

    const scheduleNormalization = (): void => {
      if (destroyed) {
        return;
      }

      if (animationFrame !== undefined) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(() => {
        animationFrame = undefined;
        this.normalizeColumns(grid);
      });
    };

    const resizeObserver = new ResizeObserver(scheduleNormalization);
    resizeObserver.observe(grid.parentElement ?? grid);

    const mutationObserver = new MutationObserver(scheduleNormalization);
    mutationObserver.observe(grid, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    void document.fonts?.ready.then(scheduleNormalization);
    scheduleNormalization();

    this.destroyRef.onDestroy(() => {
      destroyed = true;
      resizeObserver.disconnect();
      mutationObserver.disconnect();

      if (animationFrame !== undefined) {
        cancelAnimationFrame(animationFrame);
      }
    });
  }

  private normalizeColumns(grid: HTMLElement): void {
    const children = Array.from(grid.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );

    if (children.length === 0) {
      grid.style.removeProperty(COLUMN_WIDTH_PROPERTY);
      return;
    }

    grid.style.setProperty(COLUMN_WIDTH_PROPERTY, 'max-content');

    const widestColumn = Math.max(
      ...children.map((child) => child.getBoundingClientRect().width),
    );

    grid.style.setProperty(
      COLUMN_WIDTH_PROPERTY,
      `${Math.ceil(widestColumn)}px`,
    );
  }
}
