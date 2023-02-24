import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { MatDatatableResizableDirective } from './datatable-resizable.directive';

describe('MatResizableDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let directiveElements: DebugElement[];  // the elements with the directive

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [
        MatDatatableResizableDirective,
        TestComponent
      ]
    })
    .createComponent(TestComponent);
    fixture.detectChanges(); // initial binding

    // all elements with an attached MatDatatableHeaderAlignDirective
    directiveElements = fixture.debugElement.queryAll(By.directive(MatDatatableResizableDirective));
  });

  it('should create an instance', () => {
    const directive = fixture.componentInstance;

    expect(directive).toBeDefined();
  });

  it('should have 3 headers with directive', () => {
    expect(directiveElements.length).toBe(3);
  });

  it('should make 1st column with directive to be resizable', () => {
    expect(directiveElements[0].children.length).toBe(2);

    const resizerElement = directiveElements[0].children[1].nativeElement as HTMLElement;
    const alignmentChild = resizerElement.classList;

    expect(alignmentChild.contains('resize-holder')).toBeTruthy();
  });

  it('should make 2nd column with directive to be not resizable', () => {
    expect(directiveElements[1].children.length).toBe(1);
  });

  it('should make 3rd column with directive to be resizable', () => {
    expect(directiveElements[2].children.length).toBe(2);

    const resizerElement = directiveElements[2].children[1].nativeElement as HTMLElement;
    const alignmentChild = resizerElement.classList;

    expect(alignmentChild.contains('resize-holder')).toBeTruthy();
  });
});

@Component({
  template: `
    <tr>
      <th id="resizableDefault" class="mat-sort-header">
        <div class="mat-sort-header-container">default header</div>
      </th>
      <th id="resizableTrue" class="mat-sort-header" [matResizable]="true">
        <div class="mat-sort-header-container">resizable header</div>
      </th>
      <th id="resizableFalse" class="mat-sort-header" [matResizable]="false">
        <div class="mat-sort-header-container">not resizable header</div>
      </th>
      <th id="resizableDefault" class="mat-sort-header" [matResizable]>
        <div class="mat-sort-header-container">not resizable header</div>
      </th>
    </tr>
  `
})
class TestComponent { }
