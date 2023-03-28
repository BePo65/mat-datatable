/* eslint-disable @angular-eslint/component-class-suffix */

import { CollectionViewer } from '@angular/cdk/collections';
import { CdkTableModule, DataSource } from '@angular/cdk/table';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, map } from 'rxjs';

import { MatMultiSortHeaderComponent } from './mat-multi-sort-header.component';
import { MatMultiSort } from './mat-multi-sort.directive';
import { MatMultiSortModule } from './mat-multi-sort.module';
import { MatSortable, Sort, SortDirection } from './public-api';
import {
  dispatchMouseEvent
} from './testing/fake-events/dispatch-events';

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
          MatTableMatMultiSortApp
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
        expectedStates.set('defaultA', {viewState: 'asc', arrowDirection: 'asc'});
        expectedStates.set('defaultB', {viewState: 'asc', arrowDirection: 'asc'});
        component.expectViewAndDirectionStates(expectedStates);

        const newSort1: MatSortable[] = [
          { id:'defaultB', start:'desc', disableClear:false }
        ];
        component.matMultiSort.setAllSorts(newSort1);
        fixture.detectChanges();

        expectedStates.set('defaultB', {viewState: 'active', arrowDirection: 'active-desc'});
        component.expectViewAndDirectionStates(expectedStates);

        // Change sort definition
        const newSort2: MatSortable[] = [
          { id:'defaultA', start:'desc', disableClear:false },
          { id:'defaultB', start:'asc', disableClear:false }
        ];
        component.matMultiSort.setAllSorts(newSort2);
        fixture.detectChanges();

        expectedStates.set('defaultA', {viewState: 'active', arrowDirection: 'active-desc'});
        expectedStates.set('defaultB', {viewState: 'active', arrowDirection: 'active-asc'});
        component.expectViewAndDirectionStates(expectedStates);
      });

      // eslint-disable-next-line jasmine/missing-expect
      it('should be correct when setting sort programmatically twice', () => {
        expectedStates.set('defaultA', {viewState: 'asc', arrowDirection: 'asc'});
        expectedStates.set('defaultB', {viewState: 'asc', arrowDirection: 'asc'});
        component.expectViewAndDirectionStates(expectedStates);

        const newSort: MatSortable[] = [
          { id:'defaultA', start:'desc', disableClear:false },
          { id:'defaultB', start:'asc', disableClear:false }
        ];
        component.matMultiSort.setAllSorts(newSort);
        fixture.detectChanges();

        expectedStates.set('defaultA', {viewState: 'active', arrowDirection: 'active-desc'});
        expectedStates.set('defaultB', {viewState: 'active', arrowDirection: 'active-asc'});
        component.expectViewAndDirectionStates(expectedStates);

        component.matMultiSort.setAllSorts(newSort);
        fixture.detectChanges();

        expectedStates.set('defaultA', {viewState: 'active', arrowDirection: 'active-desc'});
        expectedStates.set('defaultB', {viewState: 'active', arrowDirection: 'active-asc'});
        component.expectViewAndDirectionStates(expectedStates);
      });

      it('should be correct when reading sort definitions', () => {
        const startSortDefinitions = component.matMultiSort.sortDefinitions;

        expect(startSortDefinitions.length).toBe(0);

        const newSort: MatSortable[] = [
          { id:'defaultA', start:'desc', disableClear:false },
          { id:'defaultB', start:'asc', disableClear:false }
        ];
        component.matMultiSort.setAllSorts(newSort);
        fixture.detectChanges();
        const modifiedSortDefinitions = component.matMultiSort.sortDefinitions;

        expect(modifiedSortDefinitions.length).toBe(2);
      });

      // eslint-disable-next-line jasmine/missing-expect
      it('should be correct when sorting with setAllSorts or set sortDefinitions', () => {
        const newSort1: MatSortable[] = [
          { id:'defaultB', start:'desc', disableClear:false }
        ];
        component.matMultiSort.setAllSorts(newSort1);
        fixture.detectChanges();

        expectedStates.set('defaultB', {viewState: 'active', arrowDirection: 'active-desc'});
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
    });

    // TODO checking correct badge position when sorting

    // eslint-disable-next-line jasmine/missing-expect
    it('should be able to cycle from asc -> desc from either start point', () => {
      component.disableClear = true;

      component.start = 'asc';
      testSingleColumnSortDirectionSequence(fixture, ['asc', 'desc']);

      // Reverse directions
      component.start = 'desc';
      testSingleColumnSortDirectionSequence(fixture, ['desc', 'asc']);
    });
  });
});

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
  latestSortEvent!: MatMultiSort;

  active!: string;
  start: SortDirection = 'asc';
  direction: SortDirection = '';
  disableClear!: boolean;
  disabledColumnSort = false;
  disableAllSort = false;
  secondColumnDescription = 'Sort second column';

  @ViewChild(MatMultiSort)
  matMultiSort!: MatMultiSort;
  @ViewChild('defaultA')
  defaultA!: MatMultiSortHeaderComponent;
  @ViewChild('defaultB')
  defaultB!: MatMultiSortHeaderComponent;
  @ViewChild('overrideStart')
  overrideStart!: MatMultiSortHeaderComponent;
  @ViewChild('overrideDisableClear')
  overrideDisableClear!: MatMultiSortHeaderComponent;

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
