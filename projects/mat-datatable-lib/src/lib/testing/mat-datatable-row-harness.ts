import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
  parallel
} from '@angular/cdk/testing';

import {
  _MatCellHarnessBase,
  MatRowCellHarness,
  MatHeaderCellHarness
} from './mat-datatable-cell-harness';
import {
  CellHarnessFilters,
  HeaderCellHarnessFilters,
  RowCellHarnessFilters,
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
  CellFilterType extends RowCellHarnessFilters
> extends ComponentHarness {
  protected abstract _cellHarness: CellType;

  /**
   * Checks if the values of the table row columns given in the 'value' parameter,
   * match the given column values. Only columns defined in the pattern are inspected.
   * @param value The nullable object defining all columns of a row and their values used for the checks.
   *   Alternatively a Promise resolving to the nullable object.
   * @param pattern Object defining the columns and the values or RegExp expected to match.
   *   If `pattern` is `null`, the value is expected to be `null`.
   * @returns Whether the value matches the pattern.
   */
  static async rowCellsContentMatch(
    value: MatRowHarnessColumnsText | Promise<MatRowHarnessColumnsText> | null,
    pattern: Record<string, string | RegExp> | null
  ): Promise<boolean> {
    value = await value;
    if (pattern === null) {
      return value === null;
    } else if (value === null) {
      return false;
    }

    let result = false;
    for (const key in pattern) {
      const sourceValue = value[key];
      const targetValueOrPattern = pattern[key];

      result = typeof targetValueOrPattern === 'string' ?
        sourceValue === targetValueOrPattern :
        targetValueOrPattern.test(sourceValue);

      if (!result) {
        break;
      }
    }
    return result;
  }

  /**
   * Gets a list of `MatRowCellHarness` or 'MatHeaderCellHarness' for all cells in the row.
   * @param filter - filter to select the sut (default; all cells).
   * @returns an array of the selected cells.
   */
  async getCells(filter: CellFilterType = {} as CellFilterType): Promise<Cell[]> {
    return this.locatorForAll(this._cellHarness.with(filter))();
  }

  /**
   * Gets the text of the cells in the row.
   * @param filter - filter to select the returned cells (default; all cells).
   * @returns an array of the content of the selected cells.
   */
  async getCellTextByIndex(filter: CellFilterType = {} as CellFilterType): Promise<string[]> {
    const cells = await this.getCells(filter);
    return parallel(() => cells.map(cell => cell.getText()));
  }

  /**
   * Gets the text inside the row as object organized by column names.
   * @param filter - filter to select the sut (default; all cells).
   * @returns an object for the selected cells with the columns as properties.
   */
  async getCellTextByColumnName(filter: CellFilterType = {} as CellFilterType): Promise<MatRowHarnessColumnsText> {
    const output: MatRowHarnessColumnsText = {};
    const cells = await this.getCells(filter);
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
  typeof MatRowCellHarness,
  MatRowCellHarness,
  RowCellHarnessFilters
> {
  /** The selector for the host element of a `MatRowHarness` instance. */
  static hostSelector = '.mat-mdc-row';
  protected _cellHarness = MatRowCellHarness;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a table row with specific attributes.
   * @param options - Options for narrowing the search
   * @returns a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatRowHarness>(
    this: ComponentHarnessConstructor<T>,
    options: RowHarnessFilters = {}
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
    // Filter for content of row cells defined in an object with
    // `  property name = column name
    // `  property value = cell value or RegExp to be filtered for
    .addOption('rowCellsContent', options.rowCellsContent, (harness, cellsContent) =>
    _MatRowHarnessBase.rowCellsContentMatch(harness.getCellTextByColumnName(), cellsContent)
  );
}

  /**
   * Clicks the row.
   * @returns promise that completes after clicking the row
   */
  async click(): Promise<void> {
    return (await this.host()).click();
  }
}

/** Harness for interacting with a mat-datatable header row. */
export class MatHeaderRowHarness extends _MatRowHarnessBase<
  typeof MatHeaderCellHarness,
  MatHeaderCellHarness,
  HeaderCellHarnessFilters
> {
  /** The selector for the host element of a `MatHeaderRowHarness` instance. */
  static hostSelector = '.mat-mdc-header-row';
  protected _cellHarness = MatHeaderCellHarness;

  /**
   * Gets a list of `MatHeaderCellHarness` for all cells in the header row.
   * @param filter - filter to select the sut (default; all cells).
   * @returns an array of the selected cells.
   */
  override async getCells(filter: HeaderCellHarnessFilters = {} as HeaderCellHarnessFilters): Promise<MatHeaderCellHarness[]> {
    return this.locatorForAll(this._cellHarness.with(filter))();
  }
}
