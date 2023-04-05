/* eslint-disable @angular-eslint/component-class-suffix */

import { CollectionViewer } from '@angular/cdk/collections';
import { CdkTableModule, DataSource } from '@angular/cdk/table';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MAT_SORT_DEFAULT_OPTIONS } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, map } from 'rxjs';

import { MatMultiSortHeader } from './mat-multi-sort-header.component';
import { MatMultiSort } from './mat-multi-sort.directive';
import { MatMultiSortModule } from './mat-multi-sort.module';
import {
  getMultiSortDuplicateSortableIdError,
  getMultiSortHeaderMissingIdError,
  getMultiSortHeaderNotContainedWithinMultiSortError,
  getSortInvalidDirectionError,
  Sort,
  SortDirection
} from './public-api';
import { dispatchMouseEvent } from './testbed/fake-events/dispatch-events';
import { createFakeEvent, createMouseEvent } from './testbed/fake-events/event-objects';
import { wrappedErrorMessage } from './testing/wrapped-error-message';

describe('MatMultiSorDirective', () => {
  describe('without default options', () =>  {
    let fixture: ComponentFixture<SimpleMatMultiSortApp>;
    let component: SimpleMatMultiSortApp;

    beforeEach(waitForAsync(() => {
      void TestBed.configureTestingModule({
        imports: [
          MatMultiSortModule,
          MatTableModule,
          CdkTableModule,
          NoopAnimationsModule
        ],
        declarations: [
          SimpleMatMultiSortApp,
          CdkTableMatMultiSortApp,
          MatTableMatMultiSortApp,
          MatMultiSortHeaderMissingMatMultiSortApp,
          MatMultiSortDuplicateMatSortableIdsApp,
          MatSortableMissingIdApp,
          MatMultiSortableInvalidDirection,
          MatMultiSortWithArrowPosition
        ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleMatMultiSortApp);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should have the sort headers register and deregister themselves', () => {
      const sortables = component.matMultiSort.sortables;

      expect(sortables.size).toBe(4);
      expect(sortables.get('defaultA')).toBe(component.defaultA);
      expect(sortables.get('defaultB')).toBe(component.defaultB);

      fixture.destroy();

      expect(sortables.size).toBe(0);
    });

    it('should mark itself as initialized', fakeAsync(() => {
      let isMarkedInitialized = false;
      component.matMultiSort.initialized.subscribe(() => (isMarkedInitialized = true));

      tick();

      expect(isMarkedInitialized).toBeTruthy();
    }));

    it('should use the column definition if used within a cdk table', () => {
      const cdkTableMatSortAppFixture = TestBed.createComponent(CdkTableMatMultiSortApp);
      const cdkTableMatSortAppComponent = cdkTableMatSortAppFixture.componentInstance;

      cdkTableMatSortAppFixture.detectChanges();

      const sortables = cdkTableMatSortAppComponent.matMultiSort?.sortables;

      expect(sortables?.size).toBe(3);
      expect(sortables?.has('column_a')).toBe(true);
      expect(sortables?.has('column_b')).toBe(true);
      expect(sortables?.has('column_c')).toBe(true);
    });

    it('should use the column definition if used within an mat table', () => {
      const matTableMatMultiSortAppFixture = TestBed.createComponent(MatTableMatMultiSortApp);
      const matTableMatMultiSortAppComponent = matTableMatMultiSortAppFixture.componentInstance;

      matTableMatMultiSortAppFixture.detectChanges();

      const sortables = matTableMatMultiSortAppComponent.matMultiSort?.sortables;

      expect(sortables?.size).toBe(3);
      expect(sortables?.has('column_a')).toBe(true);
      expect(sortables?.has('column_b')).toBe(true);
      expect(sortables?.has('column_c')).toBe(true);
    });

    describe('checking correct arrow direction and view state for its various states', () => {
      let expectedStates: Map<string, {viewState: string; arrowDirection: string}>;

      beforeEach(() => {
        // Starting state for the view and directions - note that overrideStart is reversed to be
        // desc
        expectedStates = new Map<string, {viewState: string; arrowDirection: string}>([
          ['defaultA', {viewState: 'asc', arrowDirection: 'asc'}],
          ['defaultB', {viewState: 'asc', arrowDirection: 'asc'}],
          ['overrideStart', {viewState: 'desc', arrowDirection: 'desc'}],
          ['overrideDisableClear', {viewState: 'asc', arrowDirection: 'asc'}]
        ]);
        component.expectViewAndDirectionStates(expectedStates);
      });

      // eslint-disable-next-line jasmine/missing-expect
      it('should be correct when mousing over headers and leaving on mouseleave', () => {
        // Mousing over the first sort should set the view state to hint (asc)
        component.dispatchMouseEvent('defaultA', 'mouseenter');
        expectedStates.set('defaultA', {viewState: 'asc-to-hint', arrowDirection: 'asc'});
        component.expectViewAndDirectionStates(expectedStates);

        // Mousing away from the first sort should hide the arrow
        component.dispatchMouseEvent('defaultA', 'mouseleave');
        expectedStates.set('defaultA', {viewState: 'hint-to-asc', arrowDirection: 'asc'});
        component.expectViewAndDirectionStates(expectedStates);

        // Mousing over another sort should set the view state to hint (desc)
        component.dispatchMouseEvent('overrideStart', 'mouseenter');
        expectedStates.set('overrideStart', {viewState: 'desc-to-hint', arrowDirection: 'desc'});
        component.expectViewAndDirectionStates(expectedStates);
      });

      // eslint-disable-next-line jasmine/missing-expect
      it('should be correct when mousing over header and then sorting', () => {
        // Mousing over the first sort should set the view state to hint
        component.dispatchMouseEvent('defaultA', 'mouseenter');
        expectedStates.set('defaultA', {viewState: 'asc-to-hint', arrowDirection: 'asc'});
        component.expectViewAndDirectionStates(expectedStates);

        // Clicking sort on the header should set it to be active immediately
        // (since it was already hinted)
        component.dispatchMouseEvent('defaultA', 'click');
        expectedStates.set('defaultA', {viewState: 'active', arrowDirection: 'active-asc'});
        component.expectViewAndDirectionStates(expectedStates);
      });

      // eslint-disable-next-line jasmine/missing-expect
      it('should be correct when cycling through a default sort header', () => {
        // Sort the header to set it to the active start state
        component.sort('defaultA');
        expectedStates.set('defaultA', {viewState: 'asc-to-active', arrowDirection: 'active-asc'});
        component.expectViewAndDirectionStates(expectedStates);

        // Sorting again will reverse its direction
        component.dispatchMouseEvent('defaultA', 'click');
        expectedStates.set('defaultA', {viewState: 'active', arrowDirection: 'active-desc'});
        component.expectViewAndDirectionStates(expectedStates);

        // Sorting again will remove the sort and animate away the view
        component.dispatchMouseEvent('defaultA', 'click');
        expectedStates.set('defaultA', {viewState: 'active-to-desc', arrowDirection: 'desc'});
        component.expectViewAndDirectionStates(expectedStates);
      });

      // eslint-disable-next-line jasmine/missing-expect
      it('should not enter sort with animations if an animations is disabled', () => {
        // Sort the header to set it to the active start state
        component.defaultA._disableViewStateAnimation = true;
        component.sort('defaultA');
        expectedStates.set('defaultA', {viewState: 'active', arrowDirection: 'active-asc'});
        component.expectViewAndDirectionStates(expectedStates);

        // Sorting again will reverse its direction
        component.defaultA._disableViewStateAnimation = true;
        component.dispatchMouseEvent('defaultA', 'click');
        expectedStates.set('defaultA', {viewState: 'active', arrowDirection: 'active-desc'});
        component.expectViewAndDirectionStates(expectedStates);
      });

      // eslint-disable-next-line jasmine/missing-expect
      it('should be correct when adding sort for second header', () => {
        // Sort the first header to set up
        component.sort('defaultA');
        expectedStates.set('defaultA', {viewState: 'asc-to-active', arrowDirection: 'active-asc'});
        component.expectViewAndDirectionStates(expectedStates);

        // Sort the second header and verify that the first header did not change
        component.dispatchMouseEvent('defaultB', 'click');
        expectedStates.set('defaultA', {viewState: 'active', arrowDirection: 'active-asc'});
        expectedStates.set('defaultB', {viewState: 'asc-to-active', arrowDirection: 'active-asc'});
        component.expectViewAndDirectionStates(expectedStates);
      });

      // eslint-disable-next-line jasmine/missing-expect
      it('should be correct when sort has been disabled', () => {
        // Mousing over the first sort should set the view state to hint
        component.disabledColumnSort = true;
        fixture.detectChanges();

        component.dispatchMouseEvent('defaultA', 'mouseenter');
        component.expectViewAndDirectionStates(expectedStates);
      });

      // eslint-disable-next-line jasmine/missing-expect
      it('should be correct when sorting programmatically', () => {
        const newSort1: Sort[] = [
          { active:'defaultB', direction:'desc' }
        ];
        component.matMultiSort.sortDefinitions = newSort1;
        fixture.detectChanges();

        expectedStates.set('defaultB', {viewState: 'desc-to-active', arrowDirection: 'active-desc'});
        component.expectViewAndDirectionStates(expectedStates);

        // Change sort definition
        const newSort2: Sort[] = [
          { active:'defaultA', direction:'desc' },
          { active:'defaultB', direction:'asc' }
        ];
        component.matMultiSort.sortDefinitions = newSort2;
        fixture.detectChanges();

        expectedStates.set('defaultA', {viewState: 'desc-to-active', arrowDirection: 'active-desc'});
        expectedStates.set('defaultB', {viewState: 'active', arrowDirection: 'active-asc'});
        component.expectViewAndDirectionStates(expectedStates);
      });

      // eslint-disable-next-line jasmine/missing-expect
      it('should be correct when setting sort programmatically twice', () => {
        const newSort: Sort[] = [
          { active:'defaultA', direction:'desc' },
          { active:'defaultB', direction:'asc' }
        ];
        component.matMultiSort.sortDefinitions = newSort;
        fixture.detectChanges();

        expectedStates.set('defaultA', {viewState: 'desc-to-active', arrowDirection: 'active-desc'});
        expectedStates.set('defaultB', {viewState: 'asc-to-active', arrowDirection: 'active-asc'});
        component.expectViewAndDirectionStates(expectedStates);

        // apply sorting definition again
        component.matMultiSort.sortDefinitions = newSort;
        fixture.detectChanges();

        expectedStates.set('defaultA', {viewState: 'active', arrowDirection: 'active-desc'});
        expectedStates.set('defaultB', {viewState: 'active', arrowDirection: 'active-asc'});
        component.expectViewAndDirectionStates(expectedStates);
      });

      it('should be correct when reading sort definitions', () => {
        // start with unsorted elements
        const startSortDefinitions = component.matMultiSort.sortDefinitions;

        expect(startSortDefinitions.length).toBe(0);

        const newSort: Sort[] = [
          { active:'defaultA', direction:'desc' },
          { active:'defaultB', direction:'asc' }
        ];
        component.matMultiSort.sortDefinitions = newSort;
        fixture.detectChanges();
        const modifiedSortDefinitions = component.matMultiSort.sortDefinitions;

        expect(modifiedSortDefinitions.length).toBe(2);
        expect(modifiedSortDefinitions).toEqual(newSort);
      });
    });

    // eslint-disable-next-line jasmine/missing-expect
    it('should be able to cycle from asc -> desc from either start point', () => {
      component.disableClear = true;

      component.start = 'asc';
      testSingleColumnSortDirectionSequence(fixture, ['asc', 'desc']);

      // Reverse directions
      component.start = 'desc';
      testSingleColumnSortDirectionSequence(fixture, ['desc', 'asc']);
    });

    // eslint-disable-next-line jasmine/missing-expect
    it('should be able to cycle asc -> desc -> [none]', () => {
      component.start = 'asc';
      testSingleColumnSortDirectionSequence(fixture, ['asc', 'desc', '']);
    });

    // eslint-disable-next-line jasmine/missing-expect
    it('should be able to cycle desc -> asc -> [none]', () => {
      component.start = 'desc';
      testSingleColumnSortDirectionSequence(fixture, ['desc', 'asc', '']);
    });

    it('should allow for the cycling the sort direction to be disabled per column', () => {
      const container = (fixture.nativeElement as HTMLElement).querySelector('#defaultA .mat-sort-header-container');

      component.sort('defaultA');

      expect(component.matMultiSort.sortDefinitions.length).toBe(1);
      expect(component.matMultiSort.sortDefinitions[0].direction).toBe('asc');
      expect(container?.getAttribute('tabindex')).toBe('0');
      expect(container?.getAttribute('role')).toBe('button');

      component.disabledColumnSort = true;
      fixture.detectChanges();

      // disabling the header of a column should prevent sorting for this column
      component.matMultiSort.sortDefinitions = [];
      component.sort('defaultA');

      expect(component.matMultiSort.sortDefinitions.length).toBe(0);
      // expect(component.matMultiSort.direction).toBe('asc');
      expect(container?.hasAttribute('tabindex')).toBe(false);
      expect(container?.hasAttribute('role')).toBe(false);
    });

    it('should allow for the cycling the sort direction to be disabled for all columns', () => {
      const container = (fixture.nativeElement as HTMLElement).querySelector('#defaultA .mat-sort-header-container');

      component.sort('defaultA');

      expect(component.matMultiSort.sortDefinitions.length).toBe(1);
      expect(component.matMultiSort.sortDefinitions[0].active).toBe('defaultA');
      expect(component.matMultiSort.sortDefinitions[0].direction).toBe('asc');
      expect(container?.getAttribute('tabindex')).toBe('0');

      component.disableAllSort = true;
      fixture.detectChanges();

      // disabling the container of the columns should not change the existing sort definitions
      component.sort('defaultA');

      expect(component.matMultiSort.sortDefinitions.length).toBe(1);
      expect(component.matMultiSort.sortDefinitions[0].active).toBe('defaultA');
      expect(component.matMultiSort.sortDefinitions[0].direction).toBe('asc');
      expect(container?.getAttribute('tabindex')).toBeFalsy();

      component.sort('defaultB');

      expect(component.matMultiSort.sortDefinitions.length).toBe(1);
      expect(component.matMultiSort.sortDefinitions[0].active).toBe('defaultA');
      expect(component.matMultiSort.sortDefinitions[0].direction).toBe('asc');
      expect(container?.getAttribute('tabindex')).toBeFalsy();
    });

    it('should add new sort when a different column is sorted', () => {
      component.sort('defaultA');

      expect(component.matMultiSort.sortDefinitions.length).toBe(1);
      expect(component.matMultiSort.sortDefinitions[0].active).toBe('defaultA');
      expect(component.matMultiSort.sortDefinitions[0].direction).toBe('asc');

      component.sort('defaultA');

      expect(component.matMultiSort.sortDefinitions[0].active).toBe('defaultA');
      expect(component.matMultiSort.sortDefinitions[0].direction).toBe('desc');

      component.sort('defaultB');

      expect(component.matMultiSort.sortDefinitions.length).toBe(2);
      expect(component.matMultiSort.sortDefinitions[1].active).toBe('defaultB');
      expect(component.matMultiSort.sortDefinitions[1].direction).toBe('asc');
    });

    it('should throw an error if an MatMultiSortable is not contained within an MatMultiSort directive', () => {
        expect(() =>
          TestBed.createComponent(MatMultiSortHeaderMissingMatMultiSortApp).detectChanges()
        ).toThrowError(wrappedErrorMessage(getMultiSortHeaderNotContainedWithinMultiSortError()));
      }
    );

    it('should throw an error if two MatSortables have the same id', () => {
      expect(() =>
        TestBed.createComponent(MatMultiSortDuplicateMatSortableIdsApp).detectChanges()
      ).toThrowError(wrappedErrorMessage(getMultiSortDuplicateSortableIdError('duplicateId')));
    });

    it('should throw an error if an MatSortable is missing an id', () => {
      expect(() => TestBed.createComponent(MatSortableMissingIdApp).detectChanges()).toThrowError(
        wrappedErrorMessage(getMultiSortHeaderMissingIdError())
      );
    });

    it('should throw an error if the provided direction is invalid', () => {
      expect(() =>
        TestBed.createComponent(MatMultiSortableInvalidDirection).detectChanges()
      ).toThrowError(wrappedErrorMessage(getSortInvalidDirectionError('ascending')));
    });

    // eslint-disable-next-line jasmine/missing-expect
    it('should allow let MatSortable override the default sort parameters', () => {
      testSingleColumnSortDirectionSequence(fixture, ['asc', 'desc', '']);

      testSingleColumnSortDirectionSequence(fixture, ['desc', 'asc', ''], 'overrideStart');

      testSingleColumnSortDirectionSequence(fixture, ['asc', 'desc'], 'overrideDisableClear');
    });

    it('should toggle indicator hint on button focus/blur and hide on click', () => {
      const header = fixture.componentInstance.defaultA;
      const container = (fixture.nativeElement as HTMLElement).querySelector('#defaultA .mat-sort-header-container');
      const focusEvent = createFakeEvent('focus');
      const blurEvent = createFakeEvent('blur');

      // Should start without a displayed hint
      expect(header._showIndicatorHint).toBeFalsy();

      // Focusing the button should show the hint, blurring should hide it
      container?.dispatchEvent(focusEvent);

      expect(header._showIndicatorHint).toBeTruthy();

      container?.dispatchEvent(blurEvent);

      expect(header._showIndicatorHint).toBeFalsy();

      // Show the indicator hint. On click the hint should be hidden
      container?.dispatchEvent(focusEvent);

      expect(header._showIndicatorHint).toBeTruthy();

      header._handleClick();

      expect(header._showIndicatorHint).toBeFalsy();
    });

    it('should toggle indicator hint on mouseenter/mouseleave and hide on click', () => {
      const header = fixture.componentInstance.defaultA;
      const headerElement = (fixture.nativeElement as HTMLElement).querySelector('#defaultA');
      const mouseenterEvent = createMouseEvent('mouseenter');
      const mouseleaveEvent = createMouseEvent('mouseleave');

      // Should start without a displayed hint
      expect(header._showIndicatorHint).toBeFalsy();

      // Mouse enter should show the hint, blurring should hide it
      headerElement?.dispatchEvent(mouseenterEvent);

      expect(header._showIndicatorHint).toBeTruthy();

      headerElement?.dispatchEvent(mouseleaveEvent);

      expect(header._showIndicatorHint).toBeFalsy();

      // Show the indicator hint. On click the hint should be hidden
      headerElement?.dispatchEvent(mouseenterEvent);

      expect(header._showIndicatorHint).toBeTruthy();

      header._handleClick();

      expect(header._showIndicatorHint).toBeFalsy();
    });

    it('should apply the aria-sort label to the header when sorted', () => {
      const sortHeaderElement = (fixture.nativeElement as HTMLElement).querySelector('#defaultA');

      expect(sortHeaderElement?.getAttribute('aria-sort')).toBe('none');

      component.sort('defaultA');
      fixture.detectChanges();

      expect(sortHeaderElement?.getAttribute('aria-sort')).toBe('ascending');

      component.sort('defaultA');
      fixture.detectChanges();

      expect(sortHeaderElement?.getAttribute('aria-sort')).toBe('descending');

      component.sort('defaultA');
      fixture.detectChanges();

      expect(sortHeaderElement?.getAttribute('aria-sort')).toBe('none');
    });

    it('should not render the arrow if sorting is disabled for that column', fakeAsync(() => {
      const sortHeaderElement = (fixture.nativeElement as HTMLElement).querySelector('#defaultA');

      // Switch sorting to a different column before asserting.
      component.sort('defaultB');
      fixture.componentInstance.disabledColumnSort = true;
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(sortHeaderElement?.querySelector('.mat-sort-header-arrow')).toBeFalsy();
    }));

    it('should render the arrow if a disabled column is being sorted by', fakeAsync(() => {
      const sortHeaderElement = (fixture.nativeElement as HTMLElement).querySelector('#defaultA');

      component.sort('defaultA');
      fixture.componentInstance.disabledColumnSort = true;
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(sortHeaderElement?.querySelector('.mat-sort-header-arrow')).toBeTruthy();
    }));

    it('should have a focus indicator', () => {
      const headerNativeElement = fixture.debugElement.query(
        By.directive(MatMultiSortHeader)
      ).nativeElement as HTMLElement;
      const container = headerNativeElement.querySelector('.mat-sort-header-container');

      expect(container?.classList.contains('mat-focus-indicator')).toBe(true);
    });

    it('should add a default aria description to sort buttons', () => {
      const sortButton = (fixture.nativeElement as HTMLElement).querySelector('.mat-sort-header-container');
      const descriptionId = sortButton?.getAttribute('aria-describedby') || '';

      expect(descriptionId).toBeDefined();

      const descriptionElement = document.getElementById(descriptionId);

      expect(descriptionElement?.textContent).toBe('Sort');
    });

    it('should add a custom aria description to sort buttons', () => {
      const sortButton = (fixture.nativeElement as HTMLElement).querySelector(
        '#defaultB .mat-sort-header-container'
      );
      let descriptionId = sortButton?.getAttribute('aria-describedby') || '';

      expect(descriptionId).toBeDefined();

      let descriptionElement = document.getElementById(descriptionId);

      expect(descriptionElement?.textContent).toBe('Sort second column');

      fixture.componentInstance.secondColumnDescription = 'Sort 2nd column';
      fixture.detectChanges();
      descriptionId = sortButton?.getAttribute('aria-describedby') || '';
      descriptionElement = document.getElementById(descriptionId);

      expect(descriptionElement?.textContent).toBe('Sort 2nd column');
    });

    it('should render arrows after sort header by default', () => {
      // create component with 'arrowPosition = undefined'
      const matSortWithArrowPositionFixture = TestBed.createComponent(MatMultiSortWithArrowPosition);

      matSortWithArrowPositionFixture.detectChanges();

      const containerA = (matSortWithArrowPositionFixture.nativeElement as HTMLElement)
        .querySelector('#defaultA .mat-sort-header-container');
      const containerB = (matSortWithArrowPositionFixture.nativeElement as HTMLElement)
        .querySelector('#defaultB .mat-sort-header-container');

      expect(containerA?.classList.contains('mat-sort-header-position-before')).toBe(false);
      expect(containerB?.classList.contains('mat-sort-header-position-before')).toBe(false);
    });

    it('should render arrows before if appropriate parameter passed', () => {
      const matSortWithArrowPositionFixture = TestBed.createComponent(MatMultiSortWithArrowPosition);
      const matSortWithArrowPositionComponent = matSortWithArrowPositionFixture.componentInstance;
      matSortWithArrowPositionComponent.arrowPosition = 'before';

      matSortWithArrowPositionFixture.detectChanges();

      const containerA = (matSortWithArrowPositionFixture.nativeElement as HTMLElement)
        .querySelector('#defaultA .mat-sort-header-container');
      const containerB = (matSortWithArrowPositionFixture.nativeElement as HTMLElement)
        .querySelector('#defaultB .mat-sort-header-container');

      expect(containerA?.classList.contains('mat-sort-header-position-before')).toBe(true);
      expect(containerB?.classList.contains('mat-sort-header-position-before')).toBe(true);
    });

    it('should render arrows in proper position based on arrowPosition parameter', () => {
      // create component with 'arrowPosition = undefined'
      const matSortWithArrowPositionFixture = TestBed.createComponent(MatMultiSortWithArrowPosition);
      const matSortWithArrowPositionComponent = matSortWithArrowPositionFixture.componentInstance;

      matSortWithArrowPositionFixture.detectChanges();

      const containerA = (matSortWithArrowPositionFixture.nativeElement as HTMLElement)
        .querySelector('#defaultA .mat-sort-header-container');
      const containerB = (matSortWithArrowPositionFixture.nativeElement as HTMLElement)
        .querySelector('#defaultB .mat-sort-header-container');

      expect(containerA?.classList.contains('mat-sort-header-position-before')).toBe(false);
      expect(containerB?.classList.contains('mat-sort-header-position-before')).toBe(false);

      matSortWithArrowPositionComponent.arrowPosition = 'before';

      matSortWithArrowPositionFixture.detectChanges();

      expect(containerA?.classList.contains('mat-sort-header-position-before')).toBe(true);
      expect(containerB?.classList.contains('mat-sort-header-position-before')).toBe(true);
    });

    it('should render sorting position badge after sort header by default', () => {
      // create component with 'arrowPosition = undefined'
      const matSortWithArrowPositionFixture = TestBed.createComponent(MatMultiSortWithArrowPosition);

      matSortWithArrowPositionFixture.detectChanges();

      const badgeA = (matSortWithArrowPositionFixture.nativeElement as HTMLElement)
        .querySelector('#defaultA .mat-multi-sort-badge');
      const badgeB = (matSortWithArrowPositionFixture.nativeElement as HTMLElement)
        .querySelector('#defaultB .mat-multi-sort-badge');

      expect(badgeA?.classList.contains('mat-multi-sort-badge-after')).toBeTruthy();
      expect(badgeB?.classList.contains('mat-multi-sort-badge-after')).toBeTruthy();
    });

    it('should render sorting position badge before if appropriate parameter passed', () => {
      const matSortWithArrowPositionFixture = TestBed.createComponent(MatMultiSortWithArrowPosition);
      const matSortWithArrowPositionComponent = matSortWithArrowPositionFixture.componentInstance;
      matSortWithArrowPositionComponent.arrowPosition = 'before';

      matSortWithArrowPositionFixture.detectChanges();

      const containerA = (matSortWithArrowPositionFixture.nativeElement as HTMLElement)
        .querySelector('#defaultA .mat-multi-sort-badge');
      const containerB = (matSortWithArrowPositionFixture.nativeElement as HTMLElement)
        .querySelector('#defaultB .mat-multi-sort-badge');

      expect(containerA?.classList.contains('mat-multi-sort-badge-before')).toBeTruthy();
      expect(containerB?.classList.contains('mat-multi-sort-badge-before')).toBeTruthy();
    });

    it('should render sorting position badge in proper position based on arrowPosition parameter', () => {
      // create component with 'arrowPosition = undefined'
      const matSortWithArrowPositionFixture = TestBed.createComponent(MatMultiSortWithArrowPosition);
      const matSortWithArrowPositionComponent = matSortWithArrowPositionFixture.componentInstance;
      matSortWithArrowPositionComponent.arrowPosition = 'after';

      matSortWithArrowPositionFixture.detectChanges();

      const containerA = (matSortWithArrowPositionFixture.nativeElement as HTMLElement)
        .querySelector('#defaultA .mat-multi-sort-badge');
      const containerB = (matSortWithArrowPositionFixture.nativeElement as HTMLElement)
        .querySelector('#defaultB .mat-multi-sort-badge');

      expect(containerA?.classList.contains('mat-multi-sort-badge-after')).toBeTruthy();
      expect(containerB?.classList.contains('mat-multi-sort-badge-after')).toBeTruthy();

      matSortWithArrowPositionComponent.arrowPosition = 'before';

      matSortWithArrowPositionFixture.detectChanges();

      expect(containerA?.classList.contains('mat-multi-sort-badge-before')).toBeTruthy();
      expect(containerB?.classList.contains('mat-multi-sort-badge-before')).toBeTruthy();
    });

    it('should render sorting position badge in proper position based on arrow direction', () => {
      const badgeB = (fixture.nativeElement as HTMLElement).querySelector('#defaultB .mat-multi-sort-badge');

        // Sort the header to set it to the ascending state
      component.matMultiSort.sortDefinitions = [{ active:'defaultB', direction:'asc' }];
      fixture.detectChanges();

      expect(component.defaultB._arrowDirection).toBe('asc');
      expect(badgeB?.classList.contains('mat-multi-sort-badge-below')).toBeTruthy();

      component.matMultiSort.sortDefinitions = [{ active:'defaultB', direction:'desc' }];
      fixture.detectChanges();

      expect(component.defaultB._arrowDirection).toBe('desc');
      expect(badgeB?.classList.contains('mat-multi-sort-badge-above')).toBeTruthy();
    });
  });

  describe('with default options', () => {
    let fixture: ComponentFixture<MatMultiSortWithoutExplicitInputs>;
    let component: MatMultiSortWithoutExplicitInputs;

    beforeEach(waitForAsync(() => {
      void TestBed.configureTestingModule({
        imports: [
          MatMultiSortModule,
          MatTableModule,
          CdkTableModule,
          NoopAnimationsModule
        ],
        declarations: [
          MatMultiSortWithoutExplicitInputs
        ],
        providers: [
          {
            provide: MAT_SORT_DEFAULT_OPTIONS,
            useValue: {
              disableClear: true
            }
          }
        ]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(MatMultiSortWithoutExplicitInputs);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    // eslint-disable-next-line jasmine/no-spec-dupes, jasmine/missing-expect
    it('should be able to cycle from asc -> desc from either start point', () => {
      component.start = 'asc';
      testSingleColumnSortDirectionSequence(fixture, ['asc', 'desc']);

      // Reverse directions
      component.start = 'desc';
      testSingleColumnSortDirectionSequence(fixture, ['desc', 'asc']);
    });
  });

  describe('with default arrowPosition', () => {
    let fixture: ComponentFixture<MatSortWithoutInputs>;

    beforeEach(waitForAsync(() => {
      void TestBed.configureTestingModule({
        imports: [
          MatMultiSortModule,
          MatTableModule,
          CdkTableModule,
          NoopAnimationsModule
        ],
        declarations: [MatSortWithoutInputs],
        providers: [
          {
            provide: MAT_SORT_DEFAULT_OPTIONS,
            useValue: {
              disableClear: true,
              arrowPosition: 'before'
            }
          }
        ]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(MatSortWithoutInputs);
      fixture.detectChanges();
    });

    it('should render arrows in proper position', () => {
      const containerA = (fixture.nativeElement as HTMLElement)
        .querySelector('#defaultA .mat-sort-header-container');
      const containerB = (fixture.nativeElement as HTMLElement)
        .querySelector('#defaultB .mat-sort-header-container');

      expect(containerA?.classList.contains('mat-sort-header-position-before')).toBe(true);
      expect(containerB?.classList.contains('mat-sort-header-position-before')).toBe(true);
    });
  });
});

// eslint-disable-next-line jsdoc/require-param
/**
 * Performs a sequence of sorting on a single column to see if the sort directions are
 * consistent with expectations. Detects any changes in the fixture to reflect any changes in
 * the inputs and resets the MatMultiSort to remove any side effects from previous tests.
 */
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function testSingleColumnSortDirectionSequence(
  fixture: ComponentFixture<SimpleMatMultiSortApp | MatMultiSortWithoutExplicitInputs>,
  expectedSequence: SortDirection[],
  id: SimpleMatSortAppColumnIds = 'defaultA'
) {
  // Detect any changes that were made in preparation for this sort sequence
  fixture.detectChanges();

  // Reset the sort to make sure there are no side affects from previous tests
  const component = fixture.componentInstance;
  component.matMultiSort.sortDefinitions = [];

  // Run through the sequence to confirm the order
  const actualSequence = expectedSequence.map(entry => {
    component.sort(id);

    // Check that the sort event's active sort is consistent with the MatSort
    if(entry.length !== 0) {
      expect(component.matMultiSort.sortDefinitions.length).toBe(1);
      expect(component.matMultiSort.sortDefinitions[0].active).toBe(id);
      expect(component.matMultiSort.sortDefinitions[0].direction).toBe(entry);
      expect(component.latestSortEvent.length).toBe(1);
      expect(component.latestSortEvent[0].active).toBe(id);

      // Check that the sort event's direction is consistent with the MatSort
      expect(component.matMultiSort.sortDefinitions[0].direction).toBe(component.latestSortEvent[0].direction);
    } else {
      expect(component.matMultiSort.sortDefinitions.length).toBe(0);
      expect(component.latestSortEvent.length).toBe(0);
    }
    return entry;
  });
  expect(actualSequence).toEqual(expectedSequence);

  // Expect that performing one more sort will loop it back to the beginning.
  component.sort(id);
  expect(component.matMultiSort.sortDefinitions[0].direction).toBe(expectedSequence[0]);
}

/** Column IDs of the SimpleMatSortApp for typing of function params in the component (e.g. sort) */
type SimpleMatSortAppColumnIds = 'defaultA' | 'defaultB' | 'overrideStart' | 'overrideDisableClear';

@Component({
  template: `
    <div matMultiSort
         [matSortActive]="active"
         [matSortDisabled]="disableAllSort"
         [matSortStart]="start"
         [matSortDirection]="direction"
         [matSortDisableClear]="disableClear"
         (matMultiSortChange)="latestSortEvent = $event">
      <div id="defaultA"
           #defaultA
           mat-multi-sort-header="defaultA"
           [disabled]="disabledColumnSort">
        A
      </div>
      <div id="defaultB"
           #defaultB
           mat-multi-sort-header="defaultB"
           [sortActionDescription]="secondColumnDescription">
        B
      </div>
      <div id="overrideStart"
           #overrideStart
           mat-multi-sort-header="overrideStart" start="desc">
        D
      </div>
      <div id="overrideDisableClear"
           #overrideDisableClear
           mat-multi-sort-header="overrideDisableClear"
           disableClear>
        E
      </div>
    </div>
  `
})
class SimpleMatMultiSortApp {
  latestSortEvent!: Sort[];

  active!: string;
  start: SortDirection = 'asc';
  direction: SortDirection = '';
  disableClear!: boolean;
  disabledColumnSort = false;
  disableAllSort = false;
  secondColumnDescription = 'Sort second column';

  @ViewChild(MatMultiSort) matMultiSort!: MatMultiSort;
  @ViewChild('defaultA') defaultA!: MatMultiSortHeader;
  @ViewChild('defaultB') defaultB!: MatMultiSortHeader;
  @ViewChild('overrideStart') overrideStart!: MatMultiSortHeader;
  @ViewChild('overrideDisableClear') overrideDisableClear!: MatMultiSortHeader;

  constructor(public elementRef: ElementRef<HTMLElement>) {}

  sort(id: SimpleMatSortAppColumnIds) {
    this.dispatchMouseEvent(id, 'click');
  }

  dispatchMouseEvent(id: SimpleMatSortAppColumnIds, event: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sortElement = this.elementRef.nativeElement.querySelector(`#${id}`)!;
    dispatchMouseEvent(sortElement, event);
  }

  /**
   * Checks expectations for each sort header's view state and arrow direction states. Receives a
   * map that is keyed by each sort header's ID and contains the expectation for that header's
   * states.
   *
   * @param viewStates - Map with ViewStates to be tested
   */
  expectViewAndDirectionStates(
    viewStates: Map<string, {viewState: string; arrowDirection: string}>
  ) {
    const sortHeaders = new Map([
      ['defaultA', this.defaultA],
      ['defaultB', this.defaultB],
      ['overrideStart', this.overrideStart],
      ['overrideDisableClear', this.overrideDisableClear]
    ]);

    viewStates.forEach((viewState, id) => {
      expect(sortHeaders.get(id)?._getArrowViewState()).toEqual(viewState.viewState);
      expect(sortHeaders.get(id)?._getArrowDirectionState()).toEqual(viewState.arrowDirection);
    });
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
class FakeDataSource extends DataSource<any> {
  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return collectionViewer.viewChange.pipe(map(() => []));
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect() {}
}
/* eslint-enable @typescript-eslint/no-explicit-any */

@Component({
  template: `
    <cdk-table [dataSource]="dataSource" matMultiSort>
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef #sortHeaderA mat-multi-sort-header> Column A </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}} </cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_b">
        <cdk-header-cell *cdkHeaderCellDef #sortHeaderB mat-multi-sort-header> Column B </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.b}} </cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_c">
        <cdk-header-cell *cdkHeaderCellDef #sortHeaderC mat-multi-sort-header> Column C </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.c}} </cdk-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: columnsToRender"></cdk-row>
    </cdk-table>
  `
})
class CdkTableMatMultiSortApp {
  @ViewChild(MatMultiSort) matMultiSort: MatMultiSort | undefined;

  dataSource = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];
}

@Component({
  template: `
    <mat-table [dataSource]="dataSource" matMultiSort>
      <ng-container matColumnDef="column_a">
        <mat-header-cell *matHeaderCellDef #sortHeaderA mat-multi-sort-header> Column A </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{row.a}} </mat-cell>
      </ng-container>

      <ng-container matColumnDef="column_b">
        <mat-header-cell *matHeaderCellDef #sortHeaderB mat-multi-sort-header> Column B </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{row.b}} </mat-cell>
      </ng-container>

      <ng-container matColumnDef="column_c">
        <mat-header-cell *matHeaderCellDef #sortHeaderC mat-multi-sort-header> Column C </mat-header-cell>
        <mat-cell *matCellDef="let row"> {{row.c}} </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="columnsToRender"></mat-header-row>
      <mat-row *matRowDef="let row; columns: columnsToRender"></mat-row>
    </mat-table>
  `
})
class MatTableMatMultiSortApp {
  @ViewChild(MatMultiSort) matMultiSort: MatMultiSort | undefined;

  dataSource = new FakeDataSource();
  columnsToRender = ['column_a', 'column_b', 'column_c'];
}

@Component({
  template: '<div mat-multi-sort-header="a"> A </div>'
})
class MatMultiSortHeaderMissingMatMultiSortApp {}

@Component({
  template: `
    <div matMultiSort>
      <div mat-multi-sort-header="duplicateId"> A </div>
      <div mat-multi-sort-header="duplicateId"> B </div>
    </div>
  `
})
class MatMultiSortDuplicateMatSortableIdsApp {
  @ViewChild(MatMultiSort) matMultiSort!: MatMultiSort;
}

@Component({
  template: `
    <div matMultiSort>
      <div mat-multi-sort-header> A </div>
    </div>
  `
})
class MatSortableMissingIdApp {}

@Component({
  template: `
    <div matMultiSort matSortDirection="ascending">
      <div mat-multi-sort-header="a"> A </div>
    </div>
  `
})
class MatMultiSortableInvalidDirection {}

@Component({
  template: `
    <div matMultiSort
         [matSortActive]="active"
         [matSortStart]="start"
         (matMultiSortChange)="latestSortEvent = $event">
      <div id="defaultA" #defaultA mat-multi-sort-header="defaultA">
        A
      </div>
    </div>
  `
})
class MatMultiSortWithoutExplicitInputs {
  latestSortEvent!: Sort[];

  active!: string;
  start: SortDirection = 'asc';

  @ViewChild(MatMultiSort) matMultiSort!: MatMultiSort;
  @ViewChild('defaultA') defaultA!: MatMultiSortHeader;

  constructor(public elementRef: ElementRef<HTMLElement>) {}

  sort(id: SimpleMatSortAppColumnIds) {
    this.dispatchMouseEvent(id, 'click');
  }

  dispatchMouseEvent(id: SimpleMatSortAppColumnIds, event: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sortElement = this.elementRef.nativeElement.querySelector(`#${id}`)!;
    dispatchMouseEvent(sortElement, event);
  }
}

@Component({
  template: `
    <div matMultiSort>
      <div id="defaultA" #defaultA mat-multi-sort-header="defaultA" [arrowPosition]="arrowPosition">
        A
      </div>
      <div id="defaultB" #defaultB mat-multi-sort-header="defaultB" [arrowPosition]="arrowPosition">
        B
      </div>
    </div>
  `
})
class MatMultiSortWithArrowPosition {
  // component with default value of 'arrowPosition' = undefined
  arrowPosition?: 'before' | 'after';
  @ViewChild(MatMultiSort) matMultiSort!: MatMultiSort;
  @ViewChild('defaultA') defaultA!: MatMultiSortHeader;
  @ViewChild('defaultB') defaultB!: MatMultiSortHeader;
}

@Component({
  template: `
    <div matMultiSort>
      <div id="defaultA" #defaultA mat-multi-sort-header="defaultA">
        A
      </div>
      <div id="defaultB" #defaultB mat-multi-sort-header="defaultB">
        B
      </div>
    </div>
  `
})
class MatSortWithoutInputs {
  @ViewChild(MatMultiSort) matMultiSort!: MatMultiSort;
  @ViewChild('defaultA') defaultA!: MatMultiSortHeader;
  @ViewChild('defaultB') defaultB!: MatMultiSortHeader;
}
