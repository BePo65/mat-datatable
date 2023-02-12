import { AfterViewInit, Directive, ElementRef, Input, Renderer2 } from '@angular/core';

import { ColumnAlignmentType } from '../interfaces/datatable-column-definition.interface';

@Directive({
  selector: '[matHeaderAlignment]'
})
export class MatDatatableHeaderAlignDirective implements AfterViewInit{
  @Input() matHeaderAlignment:ColumnAlignmentType | undefined;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    const hostElem = this.el.nativeElement;
    const childNodes: HTMLCollection = hostElem.children;

    if (this.matHeaderAlignment === undefined) {
      return;
    }

    // find child node with header content (text + sorting indicator);
    // usually there is only 1 child node wrapping thtext and the indicator.
    let indexOfHeaderContainerChild = -1;
    let classesOfChild: string[] = [];
    for (let i = 0; i < childNodes.length; i++) {
      const element = childNodes[i];
      classesOfChild = Object.values(element.classList);
      if (classesOfChild.includes('mat-sort-header-container')) {
        indexOfHeaderContainerChild = i;
      }
    }

    if (indexOfHeaderContainerChild >= 0) {
      const alignmentClass = this.alignmentToClassname(this.matHeaderAlignment);
      if (!classesOfChild.includes(alignmentClass)) {
        this.renderer.addClass(childNodes[indexOfHeaderContainerChild], alignmentClass);
      }
    }
  }

  private alignmentToClassname(alignment: ColumnAlignmentType | undefined) {
    let alignmentClass = '';
    switch (alignment) {
      case 'left':
        alignmentClass = 'mat-header-align-left';
        break;
      case 'center':
        alignmentClass = 'mat-header-align-center';
        break;
      case 'right':
        alignmentClass = 'mat-header-align-right';
        break;
    }

    return alignmentClass;
  }
}
