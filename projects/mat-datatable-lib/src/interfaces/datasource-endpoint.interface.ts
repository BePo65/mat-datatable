import { Observable } from 'rxjs';

import { SortDirectionAscDesc } from 'projects/mat-datatable-lib/src';

export interface RequestSortDataList<T> {
  fieldName: keyof T
  order: SortDirectionAscDesc
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

export type DatasourceEndpoint<T, Q> = (
  rowsRange: RequestPageOfList,
  filters?: Q,
  sorts?: RequestSortDataList<T>[]
) => Observable<Page<T>>
