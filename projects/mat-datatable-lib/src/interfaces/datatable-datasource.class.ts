import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';

import { MatSortDefinition } from './datatable-sort-definition.interface';

export abstract class MatDatatableDataSource<T> extends DataSource<T> {
  data: T[] = [];
  paginator: MatPaginator | undefined;

  /**
   * Gets the sorting definition from the datasource.
   * @abstract
   * @returns fields and directions that the datasource uses for sorting
   */
  abstract getSort(): MatSortDefinition[];

  /**
   * Sets the sorting definition from the datasource and sort data.
   * @abstract
   * @param sortDefinition - fields and directions that should be used for sorting
   */
  abstract setSort(sortDefinition: MatSortDefinition[]): void;
}
