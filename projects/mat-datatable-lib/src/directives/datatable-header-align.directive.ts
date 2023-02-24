import { AfterViewInit, Directive, ElementRef, Input, Renderer2 } from '@angular/core';

import { ColumnAlignmentType } from '../interfaces/datatable-column-definition.interface';

@Directive({
  selector: '[matHeaderAlignment]'
})
export class MatDatatableHeaderAlignDirective implements AfterViewInit {
  @Input() matHeaderAlignment: ColumnAlignmentType | undefined;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    const hostElem = this.el.nativeElement;
    const children: HTMLCollection = hostElem.children;

    if (this.matHeaderAlignment === undefined) {
      return;
    }

    // find child node with header content (text + sorting indicator);
    // usually there is only 1 child node wrapping thtext and the indicator.
    let indexOfHeaderContainerChild = -1;
    let classesOfChild: string[] = [];
    for (let i = 0; i < children.length; i++) {
      const element = children[i];
      classesOfChild = Object.values(element.classList);
      if (classesOfChild.includes('mat-sort-header-container')) {
        indexOfHeaderContainerChild = i;
      }
    }

    if (indexOfHeaderContainerChild >= 0) {
      switch (this.matHeaderAlignment) {
        case 'left':
          this.renderer.setStyle(children[indexOfHeaderContainerChild], 'justify-content', 'left');
          break;
        case 'center':
          this.renderer.setStyle(children[indexOfHeaderContainerChild], 'justify-content', 'center');
          this.renderer.setStyle(children[indexOfHeaderContainerChild], 'margin-right', '-18px');
          break;
        case 'right':
          this.renderer.setStyle(children[indexOfHeaderContainerChild], 'justify-content', 'right');
          break;
      }
    }
  }
}
