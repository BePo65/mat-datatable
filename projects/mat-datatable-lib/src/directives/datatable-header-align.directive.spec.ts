import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { MatDatatableHeaderAlignDirective } from './datatable-header-align.directive';

describe('MatDatatableHeaderAlignDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let directiveElements: DebugElement[];  // the elements with the directive

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [
        TestComponent
      ]
    }).createComponent(TestComponent);

    // initial binding
    fixture.detectChanges();

    // all elements with an attached MatDatatableHeaderAlignDirective
    directiveElements = fixture.debugElement.queryAll(By.directive(MatDatatableHeaderAlignDirective));
  });

  it('should create an instance', () => {
    const directive = fixture.componentInstance;

    expect(directive).toBeDefined();
  });

  it('should have three aligned headers', () => {
    expect(directiveElements.length).toBe(3);
  });

  it('should set alignment of 1st element to "left"', () => {
    const element = directiveElements[0].children[0].nativeElement as HTMLElement;
    const alignmentChild = element.style.justifyContent;

    expect(alignmentChild).toBe('left');
  });

  it('should set alignment of 2nd element to "center"', () => {
    const element = directiveElements[1].children[0].nativeElement as HTMLElement;
    const alignmentChild = element.style.justifyContent;

    expect(alignmentChild).toBe('center');
  });

  it('should have centered header for last name', () => {
    const deByClassName = fixture.debugElement.queryAll(By.css('.mat-header-lastName'));
    const element = deByClassName[0].children[0].nativeElement as HTMLElement;
    const alignmentChild = element.style.justifyContent;

    expect(alignmentChild).toBe('center');
  });
});

@Component({
  template: `
<div>
  <table class="mat-mdc-table mat-sort mat-datatable">
    <thead>
      <tr class="mat-mdc-header-row">
        <th class="mat-sort-header mat-mdc-header-cell mat-datatable-header-cell mat-header-id">
          <div class="mat-sort-header-container"></div>
          <span class="resize-holder"></span>
        </th>
        <th matHeaderAlignment="left" class="mat-sort-header mat-mdc-header-cell mat-datatable-header-cell mat-header-firstName">
          <div class="mat-sort-header-container"></div>
          <span class="resize-holder"></span>
        </th>
        <th matHeaderAlignment="center" class="mat-sort-header mat-mdc-header-cell mat-datatable-header-cell mat-header-lastName">
          <div class="mat-sort-header-container"></div>
          <span class="resize-holder"></span>
        </th>
        <th matHeaderAlignment="right" class="mat-sort-header mat-mdc-header-cell mat-datatable-header-cell mat-header-email">
          <div class="mat-sort-header-container"></div>
          <span class="resize-holder"></span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="mat-mdc-row">
        <td class="mat-mdc-cell mat-datatable-cell mat-column-id">
          <span>1</span>
        </td>
        <td class="mat-mdc-cell mat-datatable-cell mat-column-firstName">
          <span>Rashawn</span>
        </td>
        <td class="mat-mdc-cell mat-datatable-cell mat-column-lastName">
          <span>Goyette</span>
        </td>
        <td class="mat-mdc-cell mat-datatable-cell mat-column-email">
          <span>Alexa1&#64;gmail.com</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
  `,
  standalone: true,
  imports: [
    MatDatatableHeaderAlignDirective
  ]
})
class TestComponent { }
