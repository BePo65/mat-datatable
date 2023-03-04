import { SortDirection } from '@angular/material/sort';

/**
 * Interface for the definition of the sorting of 1 table column
 *
 * @interface MatSortDefinition
 * @param columnId - The id (name) of the column used for sorting.
 * @param direction - The current sorting direction (e.g. 'asc').
 */
export interface MatSortDefinition {
  columnId: string;
  direction: SortDirection;
}

/**
 * Interface for the definition of the sorting of 1 table column
 *
 * @interface MatSortDefinitionPos
 * @param position - The number of the column in the sorting definition (1..numberOfColumns).
 */
export interface MatSortDefinitionPos extends MatSortDefinition {
  position: number;
}
