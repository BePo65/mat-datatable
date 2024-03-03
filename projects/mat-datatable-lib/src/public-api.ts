/*
 * Public API Surface of mat-datatable
 */

// MatDatatableComponent
export * from './lib/mat-datatable.component';

export { MatMultiSort, MatMultiSortHeader, SortDirectionAscDesc } from './directives/datatable-sort';

export { Sort } from '@angular/material/sort';

// MatColumnDefinition<TRowData>
export * from './interfaces/datatable-column-definition.interface';

// MatSortDefinition
export * from './interfaces/datatable-sort-definition.interface';

// FieldSortDefinition, FieldFilterDefinitionSimple, FieldFilterDefinitionRange
// FieldFilterDefinition, RequestRowsRange, Page, DataStoreProvider
export * from './interfaces/datastore-provider.interface';
