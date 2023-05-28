import { Observable } from 'rxjs';

import { SortDirectionAscDesc } from 'projects/mat-datatable-lib/src';

export interface RequestSortDataList<T> {
  fieldName: keyof T
  order: SortDirectionAscDesc
}

// TODO define base for filter parameter and implement in tests and project
export interface RequestFilter {
  combine(): { [name:string]: string }
}

  // TODO change name to RowsRange
export interface RequestPageOfList {
  // TODO rename to startRowNumber
  page: number
  numberOfRows: number
}

export interface Page<T> {
  content: T[]
  // TODO rename to startRowNumber
  pageNumber: number
  returnedElements: number
  totalElements: number
}

// TODO export type DatasourceEndpoint<T, Q extends RequestFilter> = (
export type DatasourceEndpoint<T, Q> = (
  rowsRange: RequestPageOfList,
  sorts?: RequestSortDataList<T>[],
  filters?: Q
) => Observable<Page<T>>
