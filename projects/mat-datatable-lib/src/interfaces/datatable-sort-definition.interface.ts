import { SortDirection } from '@angular/material/sort';

/**
 * Interface for the definition of the sorting of 1 table column
 * @param columnId - The id (name) of the column used for sorting.
 * @param direction - The current sorting direction (e.g. 'asc').
 */
export interface MatSortDefinition {
  columnId: string;
  direction: SortDirection;
}
