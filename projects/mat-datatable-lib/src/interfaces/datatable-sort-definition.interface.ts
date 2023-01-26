import { SortDirection } from '@angular/material/sort';

/**
 * Interface for the definition of the sorting of 1 table column
 *
 * @interface MatSortDefinition
 */
export interface MatSortDefinition {
  columnId: string;
  direction: SortDirection;
}
