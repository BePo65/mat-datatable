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

// MatDatatableDataSource<T>
export * from './interfaces/datatable-datasource.class';

// MatColumnDefinition<TRowData>
export * from './interfaces/datatable-column-definition.interface';

// MatSortDefinition, MatSortDefinitionPos
export * from './interfaces/datatable-sort-definition.interface';
