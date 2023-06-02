/*
 * Public API Surface of mat-datatable
 */

// MatDatatableComponent, MatDatatableModule, Sort
export * from './lib';

export {
  MatMultiSort,
  MatMultiSortHeader,
  MatMultiSortModule,
  SortDirectionAscDesc
} from './directives/datatable-sort';

// MatColumnDefinition<TRowData>
export * from './interfaces/datatable-column-definition.interface';

// MatSortDefinition
export * from './interfaces/datatable-sort-definition.interface';
