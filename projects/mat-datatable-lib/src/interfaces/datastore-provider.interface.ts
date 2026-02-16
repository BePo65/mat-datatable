import { Observable } from 'rxjs';

import { SortDirectionAscDesc } from '../directives/datatable-sort/mat-multi-sort.interface';

type UnionKeys<T> = T extends T? keyof T : never;
type StrictUnionHelper<T, TAll> = T extends T? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, undefined>> : never;
type StrictUnion<T> = StrictUnionHelper<T, T>

/**
 * Type defining the sorting a column.
 * @template T - type defining the data of a table row
 */
export type FieldSortDefinition<T> = {
  fieldName: keyof T
  sortDirection: SortDirectionAscDesc
}

/**
 * Definition of a simple string filter for a table column.
 * @template T - type defining the data of a table row
 */
export type FieldFilterDefinitionSimple<T> = {
  fieldName: keyof T
  value: string | number | Date
}

/**
 * Definition of a range filter for a table column.
 * @template T - type defining the data of a table row
 */
export type FieldFilterDefinitionRange<T> = {
  fieldName: keyof T
  valueFrom: string | number | Date
  valueTo: string | number | Date
}

/**
 * Definition of a filter for a table column.
 * @template T - type defining the data of a table row
 */
export type FieldFilterDefinition<T> = StrictUnion<(FieldFilterDefinitionSimple<T> | FieldFilterDefinitionRange<T>)>

/**
 * Interface defining the properties of a requests for a range of rows.
 */
export interface RequestRowsRange {
  startRowIndex: number
  numberOfRows: number
}

/**
 * Interface defining the properties of a page of rows returned from the datastore.
 * @template T - type defining the data of a table row
 */
export interface Page<T> {
  content: T[]
  startRowIndex: number
  returnedElements: number
  totalElements: number
  totalFilteredElements: number
}

/**
 * Interface defining the methods of a class fetching data from a server.
 * @template T - type defining the data of a table row
 */
export interface DataStoreProvider<T> {
  /**
   * Fetching data from the datastore respecting sorting and filtering.
   * @param rowsRange - object with definition of rows to get the index for
   * @param sorts - optional array of objects with the sorting definition
   * @param filters - optional array of objects with the filter definition
   * @returns observable emitting a Page<T> object
   */
  getPagedData: (
    rowsRange: RequestRowsRange,
    sorts?: FieldSortDefinition<T>[],
    filters?: FieldFilterDefinition<T>[]
  ) => Observable<Page<T>>

  /**
   * Get the relative index of a row in the datastore (0..n) respecting
   * sorting and filtering.
   * @param row - row to get the index for
   * @param sorts - optional array of objects with the sorting definition
   * @param filters - optional array of objects with the filter definition
   * @returns observable emitting the index of the row in the datastore (0..n-1) or -1 (= row not in data store)
   */
  indexOfRow: (
    row: T,
    sorts?: FieldSortDefinition<T>[],
    filters?: FieldFilterDefinition<T>[]
  ) => Observable<number>
}
