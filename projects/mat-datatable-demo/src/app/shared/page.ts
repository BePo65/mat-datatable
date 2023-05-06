import { Observable } from 'rxjs';

import { SortDirectionAscDesc } from 'projects/mat-datatable-lib/src';

export interface RequestSortOfList<T> {
  property: keyof T
  order: SortDirectionAscDesc
}

export interface RequestRowsOfList {
  startRow: number
  numberOfRows: number
}

export interface Page<T> {
  content: T[]
  totalElements: number
  size: number
  number: number
}

export type PaginationEndpoint<T, Q> = (
  rowsRange: RequestRowsOfList,
  sorts?: RequestSortOfList<T>[],
  filters?: Q
) => Observable<Page<T>>
