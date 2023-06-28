import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
  parallel
} from '@angular/cdk/testing';

import {
  _MatCellHarnessBase,
  MatCellHarness,
  MatHeaderCellHarness
} from './mat-datatable-cell-harness';
import {
  CellHarnessFilters,
  RowHarnessFilters
} from './mat-datatable-harness-filters';

/** Object for the content of a table row as text organized by columns. */
export interface MatRowHarnessColumnsText {
  [columnName: string]: string;
}

export abstract class _MatRowHarnessBase<
  CellType extends ComponentHarnessConstructor<Cell> & {
    with: (options?: CellHarnessFilters) => HarnessPredicate<Cell>;
  },
  Cell extends _MatCellHarnessBase,
> extends ComponentHarness {
  protected abstract _cellHarness: CellType;

  /**
   * Gets a list of `MatCellHarness` for all cells in the row.
   * @param filter - filter to select the sut (default; all cells).
   * @returns an array of the selected cells.
   */
  async getCells(filter: CellHarnessFilters = {}): Promise<Cell[]> {
    return this.locatorForAll(this._cellHarness.with(filter))();
  }

  /**
   * Gets the text of the cells in the row.
   * @param filter - filter to select the returned cells (default; all cells).
   * @returns an array of the content of the selected cells.
   */
  async getCellTextByIndex(filter: CellHarnessFilters = {}): Promise<string[]> {
    const cells = await this.getCells(filter);
    return parallel(() => cells.map(cell => cell.getText()));
  }

  /**
   * Gets the text inside the row organized by columns.
   * @returns an array of the content of the selected row cells.
   */
  async getCellTextByColumnName(): Promise<MatRowHarnessColumnsText> {
    const output: MatRowHarnessColumnsText = {};
    const cells = await this.getCells();
    const cellsData = await parallel(() =>
      cells.map(cell => {
        return parallel(() => [cell.getColumnName(), cell.getText()]);
      })
    );
    cellsData.forEach(([columnName, text]) => (output[columnName] = text));
    return output;
  }
}

/** Harness for interacting with a mat-datatable row. */
export class MatRowHarness extends _MatRowHarnessBase<
  typeof MatCellHarness,
  MatCellHarness
> {
  /** The selector for the host element of a `MatRowHarness` instance. */
  static hostSelector = '.mat-mdc-row';
  protected _cellHarness = MatCellHarness;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a table row with specific attributes.
   * @param options - Options for narrowing the search
   * @returns a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatRowHarness>(
    this: ComponentHarnessConstructor<T>,
    options: RowHarnessFilters = {}
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }

  /**
   * Clicks the row.
   * @returns promise that completes after clicking the row.
   */
  async click(): Promise<void> {
    return (await this.host()).click();
  }
}

/** Harness for interacting with a mat-datatable header row. */
export class MatHeaderRowHarness extends _MatRowHarnessBase<
  typeof MatHeaderCellHarness,
  MatHeaderCellHarness
> {
  /** The selector for the host element of a `MatHeaderRowHarness` instance. */
  static hostSelector = '.mat-mdc-header-row';
  protected _cellHarness = MatHeaderCellHarness;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a table header row with specific
   * attributes.
   * @param options - Options for narrowing the search
   * @returns a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatHeaderRowHarness>(
    this: ComponentHarnessConstructor<T>,
    options: RowHarnessFilters = {}
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }
}
