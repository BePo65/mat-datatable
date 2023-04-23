/* eslint-disable @angular-eslint/directive-class-suffix */
/* eslint-disable @angular-eslint/no-host-metadata-property */
/* eslint-disable @angular-eslint/no-output-rename */

import {
  Directive,
  EventEmitter,
  Inject,
  Input,
  Optional,
  Output,
  isDevMode
} from '@angular/core';
import {
  MatSort,
  MatSortable,
  MatSortDefaultOptions,
  MAT_SORT_DEFAULT_OPTIONS,
  Sort,
  SortDirection
} from '@angular/material/sort';

import {
  getMultiSortDuplicateSortableIdError,
  getMultiSortHeaderMissingIdError
} from './mat-multi-sort-errors';

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

    // Trigger sortChange to update arrows in header
    this.sortChange.emit({active: '', direction: ''});
    this.multiSortChange.emit(structuredClone(this.sortDefinitions) as Sort[]);
  }
  private _sortDefinitions: Sort[] = [];

  // Event emitted when the user changes the sort definition.
  @Output('matMultiSortChange') readonly multiSortChange: EventEmitter<Sort[]> = new EventEmitter<Sort[]>();

  constructor(
    @Optional() @Inject(MAT_SORT_DEFAULT_OPTIONS) private __defaultOptions?: MatSortDefaultOptions
  ) {
    super(__defaultOptions);
  }

  /**
   * Register function to be used by the contained MatSortables. Adds the MatSortable to the
   * collection of MatSortables.
   * @param sortable - sort definition to be added to the list of registered columns
   */
  override register(sortable: MatSortable): void {
    if (isDevMode()) {
      if (!sortable.id) {
        throw getMultiSortHeaderMissingIdError();
      }

      if (this.sortables.has(sortable.id)) {
        throw getMultiSortDuplicateSortableIdError(sortable.id);
      }
    }

    this.sortables.set(sortable.id, sortable);
  }

  /**
   * Add / remove a single sort definition.
   * This overwrite is necessary to handle the sorts added by
   * clicking on a column header.
   * @param sortable - sort definition to add / remove
   */
  override sort(sortable: MatSortable): void {
    this.updateSortDefinitions(sortable);
    this.multiSortChange.emit(structuredClone(this.sortDefinitions) as Sort[]);

    // Trigger sortChange to update arrows in header
    this.sortChange.emit({active: '', direction: ''});
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
      } else {
        this.sortDefinitions.splice(sortIndex, 1);
      }
    } else {
      const newSort: Sort = {
        active: sortable.id,
        direction: sortable.start ? sortable.start : this.start
      };
      this.sortDefinitions.push(newSort);
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
