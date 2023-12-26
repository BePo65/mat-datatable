import { delay, of } from 'rxjs';

import EXAMPLE_DATA from '../app/services/demo-table.mock.data';

import { RequestSortDataList, RequestPageOfList, Page } from 'projects/mat-datatable-lib/src/interfaces/datasource-endpoint.interface';

/**
 * Datastore for the DemoTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class DemoTableDataStore<DatatableItem, DatatableFilter> {
  private data: DatatableItem[];
  private currentSortingDefinitions: RequestSortDataList<DatatableItem>[] = [];

  constructor() {
    this.data = [ ...EXAMPLE_DATA as DatatableItem[] ];
    this.currentSortingDefinitions = [];
  }

  /**
   * Paginate the data.
   * @param rowsRange - data to be selected
   * @param sorts - optional array of objects with the sorting definition
   * @param filters - optional object with the filter definition
   * @returns observable for the data for the mat-datatable
   */
  getPagedData(
    rowsRange: RequestPageOfList,
    sorts?: RequestSortDataList<DatatableItem>[],
    filters?: DatatableFilter // eslint-disable-line @typescript-eslint/no-unused-vars
  ) {
    if ((sorts !== undefined) && !this.areSortDefinitionsEqual(this.currentSortingDefinitions, sorts)) {
      this.currentSortingDefinitions = sorts;
      this.data = this.getSortedData();
    }
    const startIndex = rowsRange.page * rowsRange.numberOfRows;
    const resultingData = this.data.slice(startIndex, startIndex + rowsRange.numberOfRows);
    const result = {
      content: resultingData,
      pageNumber: rowsRange.page,
      returnedElements: resultingData.length,
      totalElements: this.data.length
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
   * Compare 2 sort definitions.
   * @param a - 1st sort definition
   * @param b - 2nd sort definition
   * @returns true= both definitions are equal
   */
  private areSortDefinitionsEqual(a: RequestSortDataList<DatatableItem>[], b: RequestSortDataList<DatatableItem>[]): boolean {
    return a.length === b.length &&
    a.every((element, index) => (element.fieldName === b[index].fieldName) &&
      element.order === b[index].order);
  }

  private getSortedData(): DatatableItem[] {
    const baseData = [ ...EXAMPLE_DATA as DatatableItem[] ];
    if (!this.currentSortingDefinitions || this.currentSortingDefinitions.length === 0) {
      return baseData;
    }

    return baseData.sort((a, b) => {
      let result = 0;
      for (let i = 0; i < this.currentSortingDefinitions.length; i++) {
        const fieldName = this.currentSortingDefinitions[i].fieldName;
        const isAsc = (this.currentSortingDefinitions[i].order === 'asc');
        const valueA = a[fieldName] as string | number;
        const valueB = b[fieldName] as string | number;
        result = compare(valueA, valueB, isAsc);
        if (result !== 0) {
          break;
        }
      }
      return result;
    });
  }
}

/**
 * Simple sort comparator for string | number values.
 * @param a - 1st parameter to compare
 * @param b - 2nd parameter to compare
 * @param isAsc - is this an ascending comparison
 * @returns comparison result
 */
const compare = (a: string | number, b: string | number, isAsc: boolean): number => {
  return (a === b ? 0 : (a < b ? -1 : 1)) * (isAsc ? 1 : -1);
};
