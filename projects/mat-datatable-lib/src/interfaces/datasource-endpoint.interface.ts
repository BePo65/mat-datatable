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
  valueFrom: never
  valueTo: never
}

/**
 * Definition of a range filter for a table column.
 * @template T - type defining the data of a table row
 */
export type FieldFilterDefinitionRange<T> = {
  fieldName: keyof T
  value: never
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
 * Type defining the signature of a function fetching data from
 * the datastore. The function returns an observable emitting
 * a Page<T> object.
 * @template T - type defining the data of a table row
 */
export type DatasourceEndpoint<T> = (
  rowsRange: RequestRowsRange,
  sorts?: FieldSortDefinition<T>[],
  filters?: FieldFilterDefinition<T>[]
) => Observable<Page<T>>

/**
 * Interface defining the methods of a class fetching data from a server.
 * @template T - type defining the data of a table row
 */
export interface DataStoreGetter<T> {
  getPagedData: (rowsRange: RequestRowsRange) => Observable<Page<T>>
}
