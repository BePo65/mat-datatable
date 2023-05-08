import { Observable } from 'rxjs';

import { SortDirectionAscDesc } from 'projects/mat-datatable-lib/src';

export interface RequestSortOfList<T> {
  property: keyof T
  order: SortDirectionAscDesc
}

  // TODO change name to RowsRange
export interface RequestRowsOfList {
  // TODO rename to startRow
  page: number
  numberOfRows: number
}

export interface Page<T> {
  content: T[]
  totalElements: number
  // TODO rename to startRow
  pageNumber: number
  numberOfRows: number
}

export type DatasourceEndpoint<T, Q> = (
  rowsRange: RequestRowsOfList,
  sorts?: RequestSortOfList<T>[],
  filters?: Q
) => Observable<Page<T>>
