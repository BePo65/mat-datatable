import { BaseHarnessFilters } from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of cell harness instances. */
export interface CellHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;

  /** Only find instances whose column name matches the given value. */
  columnName?: string | RegExp;
}

/** A set of criteria that can be used to filter a list of cell harness instances of a row. */
export interface RowCellHarnessFilters extends CellHarnessFilters {
  /** Only find instances whose isSingleLine attribute matches the given value. */
  isSingleLine?: boolean;
}

/** A set of criteria that can be used to filter a list of cell harness instances of a header row. */
export interface HeaderCellHarnessFilters extends CellHarnessFilters {
  /** Only find instances whose isResizable attribute matches the given value. */
  isResizable?: boolean;
}

/** A set of criteria that can be used to filter a list of row harness instances. */
export interface RowHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose cells content matches the given values. */
  rowCellsContent?: Record<string, string | RegExp>;
}

/** A set of criteria that can be used to filter a list of mat-datatable harness instances. */
export interface MatDatatableHarnessFilters extends BaseHarnessFilters {}
