import { Observable, of as observableOf, merge, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { DemoTableItem } from './demo-table-item.interface';
import EXAMPLE_DATA from './demo-table.mock.data';

import { MatDatatableDataSource } from 'projects/mat-datatable-lib/src/interfaces/datatable-datasource.class';
import { MatSortDefinition } from 'projects/mat-datatable-lib/src/interfaces/datatable-sort-definition.interface';

/**
 * Data source for the DemoTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class DemoTableDataSource extends MatDatatableDataSource<DemoTableItem> {
  private currentSortingDefinitions: MatSortDefinition[] = [];
  private sortChanged = new Subject<void>();

  private readonly defaultSortingDefinitions: MatSortDefinition[] = [
    { columnId: 'id', direction: 'asc' }
  ];

  constructor() {
    super();
    this.data = EXAMPLE_DATA;
    this.currentSortingDefinitions = this.defaultSortingDefinitions;
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<DemoTableItem[]> {
    if (this.paginator) {
      // Combine everything that affects the rendered data into one update
      // stream for the data-table to consume.
      return merge(observableOf(this.data), this.paginator.page, this.sortChanged)
        .pipe(map(() => {
          return this.getPagedData(this.getSortedData());
        }));
    } else {
      throw Error('Please set the paginator on the data source before connecting.');
    }
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect(): void {}

  /**
   * Gets the sorting definition from the datasource.
   * @returns fields and directions that the datasource uses for sorting
   */
  getSort(): MatSortDefinition[] {
    return this.currentSortingDefinitions;
  }

  /**
   * Sort data according to sortDefinition.
   * @param sortDefinition - fields and direction that should be used for sorting
   */
  setSort(sortDefinition: MatSortDefinition[]): void {
    if (!this.areSortDefinitionsEqual(this.currentSortingDefinitions, sortDefinition)) {
      this.currentSortingDefinitions = sortDefinition;
      this.data = this.getSortedData();
      this.sortChanged.next();
    }
  }

  /**
   * Compare 2 sort definitions.
   * @param a - 1st sort definition
   * @param b - 2nd sort definition
   * @returns true= both definitions are equal
   */
  private areSortDefinitionsEqual(a: MatSortDefinition[], b: MatSortDefinition[]): boolean {
    return a.length === b.length &&
    a.every((element, index) => (element.columnId === b[index].columnId) &&
      element.direction === b[index].direction);
  }

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   * @param data - input data to be paginated
   * @returns data for the mat-datatable
   */
  private getPagedData(data: DemoTableItem[]): DemoTableItem[] {
    if (this.paginator) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      return data.splice(startIndex, this.paginator.pageSize);
    } else {
      return data;
    }
  }

  // TODO request sorted data from server
  /**
   * Get sorted the data.
   * @returns data sorted according to this.currentSortingDefinitions[]
   */
  private getSortedData(): DemoTableItem[] {
    const baseData = [ ...EXAMPLE_DATA ];
    if (!this.currentSortingDefinitions || this.currentSortingDefinitions.length === 0) {
      return baseData;
    }

    return baseData.sort((a, b) => {
      let result = 0;
      for (let i = 0; i < this.currentSortingDefinitions.length; i++) {
        const fieldName = this.currentSortingDefinitions[i].columnId;
        const isAsc = (this.currentSortingDefinitions[i].direction === 'asc');
        let valueA: string | number = '';
        let valueB: string | number = '';
        switch (fieldName) {
          case 'id':
            valueA = +a.userId;
            valueB = +b.userId;
            break;
          case 'birthday':
            valueA = +a[fieldName as keyof DemoTableItem].valueOf();
            valueB = +b[fieldName as keyof DemoTableItem].valueOf();
            break;
          case 'firstName':
          case 'lastName':
          case 'email':
          case 'description':
            valueA = a[fieldName as keyof DemoTableItem] as string;
            valueB = b[fieldName as keyof DemoTableItem] as string;
            break;
        }
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
 * Simple sort comparator for example ID/Name columns (for client-side sorting).
 * @param a - 1st parameter to compare
 * @param b - 2nd parameter to compare
 * @param isAsc - is this an ascending comparison
 * @returns comparison result
 */
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a === b ? 0 : (a < b ? -1 : 1)) * (isAsc ? 1 : -1);
}
