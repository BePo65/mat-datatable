import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2
} from '@angular/core';

@Directive({
    selector: '[matResizable]',
    standalone: true
})
export class MatDatatableResizableDirective implements OnInit, OnDestroy {
  @Input()
  get matResizable() { return this._matResizable; }
  set matResizable(value: BooleanInput) {
    this._matResizable = coerceBooleanProperty(value);
  }
  private _matResizable = true;

  private startX!: number;
  private startWidth!: number;
  private column: HTMLElement;
  private table!: HTMLElement;
  private resizing= false;

  private unlistenMouseDown?: () => void;
  private unlistenMouseMove?: () => void;
  private unlistenMouseUp?: () => void;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef<HTMLElement>,
    private ngZone: NgZone) {
    this.column = this.el.nativeElement;
  }

  ngOnInit() {
    if (this.matResizable === true) {
      const row = this.renderer.parentNode(this.column) as HTMLElement;
      const thead = this.renderer.parentNode(row) as HTMLElement;
      this.table = this.renderer.parentNode(thead) as HTMLElement;

      const resizer = this.renderer.createElement('span') as HTMLElement;
      this.renderer.addClass(resizer, 'resize-holder');
      this.renderer.appendChild(this.column, resizer);
      this.unlistenMouseDown = this.renderer.listen(resizer, 'mousedown', ($event: MouseEvent) =>  this.onMouseDown($event));
    }
  }

  ngOnDestroy() {
    this.unlistenMouseDown?.();
  }

  onMouseDown($event: MouseEvent) {
    this.resizing = true;
    this.renderer.addClass(this.table, 'resizing');
    this.startX = $event.pageX;
    this.startWidth = this.column.offsetWidth;

    this.ngZone.runOutsideAngular(() => {
      this.unlistenMouseMove = this.renderer.listen('document', 'mousemove', ($event: MouseEvent) => {
        // Resizing with primary mouse button pressed
        if (this.resizing && $event.buttons & 1) {
          const width = this.startWidth + ($event.pageX - this.startX);
          this.renderer.setStyle(this.column, 'width', `${width}px`);
        }
      });
    });

    this.unlistenMouseUp = this.renderer.listen('document', 'mouseup', () => {
      if (this.resizing) {
        this.resizing = false;
        this.renderer.removeClass(this.table, 'resizing');
      }

      this.unlistenMouseMove?.();
      this.unlistenMouseUp?.();
    });
  }
}
