/* eslint-disable @angular-eslint/component-class-suffix */

import { Component, DebugElement, ViewEncapsulation, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { MatMultiSortBadgeDirective } from './mat-multi-sort-badge.directive';

describe('MatMultiSortBadgeDirective', () => {
  let fixture: ComponentFixture<BadgeTestApp>;
  let testComponent: BadgeTestApp;
  let badgeHostNativeElement: HTMLElement;
  let badgeHostDebugElement: DebugElement;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [
        BadgeTestApp,
        MatMultiSortBadgeDirective
      ]
    }).createComponent(BadgeTestApp);
    testComponent = fixture.debugElement.componentInstance as BadgeTestApp;
    fixture.detectChanges(); // initial binding

    badgeHostDebugElement = fixture.debugElement.query(By.directive(MatMultiSortBadgeDirective))!;
    badgeHostNativeElement = badgeHostDebugElement.nativeElement as HTMLElement;
  });

  it('should update the badge based on attribute', () => {
    const badgeElement = badgeHostNativeElement.querySelector('.mat-multi-sort-badge-content')!;

    expect(badgeElement.textContent).toContain('1');

    testComponent.badgeContent = '22';
    fixture.detectChanges();

    expect(badgeElement.textContent).toContain('22');
  });

  it('should be able to pass in falsy values to the badge content', () => {
    const badgeElement = badgeHostNativeElement.querySelector('.mat-multi-sort-badge-content')!;

    expect(badgeElement.textContent).toContain('1');

    testComponent.badgeContent = 0;
    fixture.detectChanges();

    expect(badgeElement.textContent).toContain('0');
  });

  it('should treat null and undefined as empty strings in the badge content', () => {
    const badgeElement = badgeHostNativeElement.querySelector('.mat-multi-sort-badge-content')!;

    expect(badgeElement.textContent).toContain('1');

    testComponent.badgeContent = null;
    fixture.detectChanges();

    expect(badgeElement.textContent?.trim()).toBe('');

    testComponent.badgeContent = undefined;
    fixture.detectChanges();

    expect(badgeElement.textContent?.trim()).toBe('');
  });

  it('should update the badge position on direction change', () => {
    // Initial state: badgeDirection='asc';
    expect(badgeHostNativeElement.classList.contains('mat-multi-sort-badge-below')).toBe(true);

    testComponent.badgeDirection = 'desc';
    fixture.detectChanges();

    expect(badgeHostNativeElement.classList.contains('mat-multi-sort-badge-above')).toBe(true);
  });

  it('should update the badge position on position change', () => {
    // Initial state: badgePosition='after';
    expect(badgeHostNativeElement.classList.contains('mat-multi-sort-badge-after')).toBe(true);

    testComponent.badgePosition = 'before';
    fixture.detectChanges();

    expect(badgeHostNativeElement.classList.contains('mat-multi-sort-badge-before')).toBe(true);
  });

  it('should change visibility to hidden', () => {
    expect(badgeHostNativeElement.classList.contains('mat-badge-hidden')).toBe(false);

    testComponent.badgeHidden = true;
    fixture.detectChanges();

    expect(badgeHostNativeElement.classList.contains('mat-multi-sort-badge-hidden')).toBe(true);
  });

  it('should toggle `aria-describedby` depending on whether the badge has a description', () => {
    expect(badgeHostNativeElement.hasAttribute('aria-describedby')).toBeFalse();

    testComponent.badgeDescription = 'Describing a badge';
    fixture.detectChanges();

    const describedById = badgeHostNativeElement.getAttribute('aria-describedby') || '';
    const description = document.getElementById(describedById)?.textContent;

    expect(description).toBe('Describing a badge');

    testComponent.badgeDescription = '';
    fixture.detectChanges();

    expect(badgeHostNativeElement.hasAttribute('aria-describedby')).toBeFalse();
  });

  it('should toggle visibility based on whether the badge has content', () => {
    const classList = badgeHostNativeElement.classList;

    expect(classList.contains('mat-multi-sort-badge-hidden')).toBe(false);

    testComponent.badgeContent = '';
    fixture.detectChanges();

    expect(classList.contains('mat-multi-sort-badge-hidden')).toBe(true);

    testComponent.badgeContent = 'hello';
    fixture.detectChanges();

    expect(classList.contains('mat-multi-sort-badge-hidden')).toBe(false);

    testComponent.badgeContent = ' ';
    fixture.detectChanges();

    expect(classList.contains('mat-multi-sort-badge-hidden')).toBe(true);

    testComponent.badgeContent = 0;
    fixture.detectChanges();

    expect(classList.contains('mat-multi-sort-badge-hidden')).toBe(false);
  });

  it('should apply view encapsulation on create badge content', () => {
    const badge = badgeHostNativeElement.querySelector('.mat-multi-sort-badge-content')!;
    let encapsulationAttr: Attr | undefined;

    for (let i = 0; i < badge.attributes.length; i++) {
      if (badge.attributes[i].name.startsWith('_ngcontent-')) {
        encapsulationAttr = badge.attributes[i];
        break;
      }
    }

    expect(encapsulationAttr).toBeTruthy();
  });

  it('should toggle a class depending on the badge disabled state', () => {
    const element: HTMLElement = badgeHostDebugElement.nativeElement as HTMLElement;

    expect(element.classList).not.toContain('mat-multi-sort-badge-disabled');

    testComponent.badgeDisabled = true;
    fixture.detectChanges();

    expect(element.classList).toContain('mat-multi-sort-badge-disabled');
  });

  it('should clear any pre-existing badges', () => {
    const preExistingFixture = TestBed.createComponent(PreExistingBadge);
    preExistingFixture.detectChanges();

    expect((preExistingFixture.nativeElement as HTMLElement).querySelectorAll('.mat-multi-sort-badge-content').length).toBe(1);
  });

  it('should expose the badge element', () => {
    const badgeElement = badgeHostNativeElement.querySelector('.mat-multi-sort-badge-content')!;

    expect(fixture.componentInstance.badgeInstance.getBadgeElement()).toBe(badgeElement as HTMLElement);
  });
});

/** Test component that contains a MatMultiSortBadge. */
@Component({
  // Explicitly set the view encapsulation since we have a test that checks for it.
  encapsulation: ViewEncapsulation.Emulated,
  styles: ['span { color: hotpink; }'],
  template: `
    <span [matMultiSortBadge]="badgeContent"
          [matMultiSortBadgeArrowDirection]="badgeDirection"
          [matMultiSortBadgePosition]="badgePosition"
          [matMultiSortBadgeHidden]="badgeHidden"
          [matMultiSortBadgeDescription]="badgeDescription"
          [matMultiSortBadgeDisabled]="badgeDisabled">
      home
    </span>
  `
})
class BadgeTestApp {
  @ViewChild(MatMultiSortBadgeDirective) badgeInstance!: MatMultiSortBadgeDirective;
  badgeContent: string | number | undefined | null = '1';
  badgeDirection = 'asc';
  badgePosition = 'after';
  badgeHidden = false;
  badgeDescription!: string;
  badgeDisabled = false;
}

@Component({
  template: `
    <span matMultiSortBadge="Hello">
      home
      <div class="mat-multi-sort-badge-content">Pre-existing badge</div>
    </span>
  `
})
class PreExistingBadge {}
