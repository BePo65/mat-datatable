import { delay, of } from 'rxjs';

import EXAMPLE_DATA from '../app/services/demo-table.mock.data';

import { FieldSortDefinition, RequestRowsRange, Page, FieldFilterDefinition } from 'projects/mat-datatable-lib/src/interfaces/datasource-endpoint.interface';

/**
 * Datastore for the DemoTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class DemoTableDataStore<DatatableItem> {
  private data: DatatableItem[];
  private currentSortingDefinitions: FieldSortDefinition<DatatableItem>[] = [];

  constructor() {
    this.data = [ ...EXAMPLE_DATA as DatatableItem[] ];
    this.currentSortingDefinitions = [];
  }

  /**
   * Paginate the data.
   * @param rowsRange - data to be selected
   * @param sorts - optional array of objects with the sorting definition
   * @param filters - optional array of objects with the filter definition
   * @returns observable for the data for the mat-datatable
   */
  getPagedData(
    rowsRange: RequestRowsRange,
    sorts?: FieldSortDefinition<DatatableItem>[],
    filters?: FieldFilterDefinition<DatatableItem>[]
  ) {
    let selectedDataset = structuredClone(EXAMPLE_DATA) as DatatableItem[];

    // Filter data
    if ((filters !== undefined) &&
        Array.isArray(filters) &&
        (filters.length > 0)) {
      selectedDataset = selectedDataset.filter((row: DatatableItem) => {
        return filters.reduce((isSelected: boolean, currentFilter: FieldFilterDefinition<DatatableItem>) => {
          if (currentFilter.value !== undefined) {
            isSelected ||= row[currentFilter.fieldName] === currentFilter.value;
          } else if ((currentFilter.valueFrom !== undefined) && (currentFilter.valueTo !== undefined)) {
            isSelected ||= (
              (row[currentFilter.fieldName] >= currentFilter.valueFrom) &&
              (row[currentFilter.fieldName] <= currentFilter.valueTo)
              );
          }
          return isSelected;
        }, false);
      });
    }

    // Sort data
    if ((sorts !== undefined) &&
        Array.isArray(sorts) &&
        (sorts.length > 0) &&
        !this.areSortDefinitionsEqual(this.currentSortingDefinitions, sorts) &&
        (rowsRange.numberOfRows !== 0)) {
      this.currentSortingDefinitions = sorts;
      selectedDataset.sort(this.compareFn);
    }

    // Save sorted and filtered data for later use
    this.data = selectedDataset;

    const startIndex = rowsRange.startRowIndex;
    const resultingData = this.data.slice(startIndex, startIndex + rowsRange.numberOfRows);
    const result = {
      content: resultingData,
      startRowIndex: startIndex,
      returnedElements: resultingData.length,
      totalElements: EXAMPLE_DATA.length,
      totalFilteredElements: this.data.length
    } as Page<DatatableItem>;
    const simulatedResponseTime = Math.round((Math.random() * 2000 + 500) * 100) / 100;
    return of(result).pipe(delay(simulatedResponseTime));
  }

  /**
   * Gets a single element from the mocked datastore (without sorting).
   * As the demo does not manipulate the data, we can return a reference
   * to the original data.
   * @param index - element to be selected (zero based).
   * @returns the selected element.
   */
  getUnsortedPage(index: number): DatatableItem {
    return EXAMPLE_DATA[index] as DatatableItem;
  }

  /**
   * Compare function for sorting the current dataset.
   * @param a - row to compare against
   * @param b - row to compare with parameter a
   * @returns 0:a===b; -1:a<b; 1:a>b
   */
  private compareFn = (a: DatatableItem, b: DatatableItem): number => {
    let result = 0;
    for (let i = 0; i < this.currentSortingDefinitions.length; i++) {
      const fieldName = this.currentSortingDefinitions[i].fieldName;
      const isAsc = (this.currentSortingDefinitions[i].sortDirection === 'asc');
      const valueA = a[fieldName] as string | number;
      const valueB = b[fieldName] as string | number;
      result = compare(valueA, valueB, isAsc);
      if (result !== 0) {
        break;
      }
    }
    return result;
  };

  /**
   * Compare 2 sort definitions.
   * @param a - 1st sort definition
   * @param b - 2nd sort definition
   * @returns true= both definitions are equal
   */
  private areSortDefinitionsEqual(a: FieldSortDefinition<DatatableItem>[], b: FieldSortDefinition<DatatableItem>[]): boolean {
    return a.length === b.length &&
    a.every((element, index) => (element.fieldName === b[index].fieldName) &&
      element.sortDirection === b[index].sortDirection);
  }
}

/**
 * Simple sort comparator for string | number values.
 * @param a - 1st parameter to compare
 * @param b - 2nd parameter to compare
 * @param isAsc - is this an ascending comparison
 * @returns comparison result (0:a===b; -1:a<b; 1:a>b)
 */
const compare = (a: string | number, b: string | number, isAsc: boolean): number => {
  return (a === b ? 0 : (a < b ? -1 : 1)) * (isAsc ? 1 : -1);
};
