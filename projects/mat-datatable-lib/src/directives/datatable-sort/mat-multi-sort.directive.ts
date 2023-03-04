/* eslint-disable @angular-eslint/directive-class-suffix */
/* eslint-disable @angular-eslint/no-host-metadata-property */
/* eslint-disable @angular-eslint/no-output-rename */

import {
  Directive,
  EventEmitter,
  Inject,
  Input,
  Optional,
  Output
} from '@angular/core';
import {
  MatSort,
  MatSortable,
  MatSortDefaultOptions,
  MAT_SORT_DEFAULT_OPTIONS,
  Sort,
  SortDirection
} from '@angular/material/sort';

export type SortDirectionAscDesc = Omit<SortDirection, ''>;

// Container for MatSortables to manage the sort state and provide default sort parameters.
@Directive({
  selector: '[matMultiSort]',
  exportAs: 'matMultiSort',
  host: {
    'class': 'mat-multi-sort'
  }
})
export class MatMultiSort extends MatSort {
  // The currently active sort definition.
  @Input('matMultiSortDefinition')
  get sortDefinitions(): Sort[] {
    return this._sortDefinitions;
  }
  set sortDefinitions(sorts: Sort[]) {
    this._sortDefinitions = sorts;
    // TODO emit multiSortChange?
    console.log('>>> set sortDefinitions');
  }
  private _sortDefinitions: Sort[] = [];

  // Event emitted when the user changes the sort definition.
  @Output('matMultiSortChange') readonly multiSortChange: EventEmitter<Sort[]> = new EventEmitter<Sort[]>();

  constructor(
    @Optional() @Inject(MAT_SORT_DEFAULT_OPTIONS) private __defaultOptions?: MatSortDefaultOptions
  ) {
    super(__defaultOptions);
  }

  // TODO need 'setMultiSort' in directive
  // TODO need 'clearMultiSort' in directive
  // Add / remove a single sort definition
  override sort(sortable: MatSortable): void {
    this.updateSortDefinitions(sortable);
    this.multiSortChange.emit(structuredClone(this.sortDefinitions) as Sort[]);
    super.sort(sortable);
  }

  updateSortDefinitions(sortable: MatSortable): void {
    const sortIndex = this.sortDefinitions.findIndex(sort => sort.active === sortable.id);

    if (sortIndex >= 0) {
      const newSort: Sort = {
        active: sortable.id,
        direction: this.getNextMultiSortDirection(sortable)
      };
      if (newSort.direction !== '') {
        this.sortDefinitions.splice(sortIndex, 1, newSort);
        console.log(`>>> updateSortDefinitions - updated Sort '${JSON.stringify(newSort)}'`);
      } else {
        this.sortDefinitions.splice(sortIndex, 1);
        console.log(`>>> updateSortDefinitions - removed Sort '${JSON.stringify(newSort)}'`);
      }
    } else {
      const newSort: Sort = {
        active: sortable.id,
        direction: sortable.start ? sortable.start : this.start
      };
      this.sortDefinitions.push(newSort);
      console.log(`>>> updateSortDefinitions - new Sort '${JSON.stringify(newSort)}'`);
    }
  }

  // Returns the next sort direction of the given sortable, checking for potential overrides.
  getNextMultiSortDirection(sortable: MatSortable): SortDirection {
    if (!sortable) {
      return '';
    }

    // Get the sort direction cycle with the potential sortable overrides.
    const disableClear = sortable?.disableClear ?? this.disableClear ?? !!this.__defaultOptions?.disableClear;
    const sortDirectionCycle = getSortDirectionCycle(sortable.start || this.start, disableClear);
    const sortIndex = this.sortDefinitions.findIndex(sort => sort.active === sortable.id);

    // Get and return the next direction in the cycle
    let nextDirectionIndex = sortDirectionCycle.indexOf(this.sortDefinitions[sortIndex].direction) + 1;
    if (nextDirectionIndex >= sortDirectionCycle.length) {
      nextDirectionIndex = 0;
    }
    return sortDirectionCycle[nextDirectionIndex];
  }
}

// Returns the sort direction cycle to use given the provided parameters of order and clear.
const getSortDirectionCycle = (start: SortDirection, disableClear: boolean): SortDirection[] => {
  const sortOrder: SortDirection[] = ['asc', 'desc'];
  if (start == 'desc') {
    sortOrder.reverse();
  }
  if (!disableClear) {
    sortOrder.push('');
  }

  return sortOrder;
};
