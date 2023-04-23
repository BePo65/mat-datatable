import {
  ComponentHarness,
  ComponentHarnessConstructor,
  ContentContainerComponentHarness,
  HarnessPredicate,
  parallel
} from '@angular/cdk/testing';

import {
  RowHarnessFilters,
  MatDatatableHarnessFilters
} from './mat-datatable-harness-filters';
import {
  MatHeaderRowHarness,
  MatRowHarness,
  MatRowHarnessColumnsText
} from './mat-datatable-row-harness';

/** Text extracted from a mat-datatable organized by columns. */
export interface MatDatatableHarnessColumnsText {
  [columnName: string]: {
    text: string[];
    headerText: string[];
  };
}

interface RowBase extends ComponentHarness {
  getCellTextByColumnName(): Promise<MatRowHarnessColumnsText>;
  getCellTextByIndex(): Promise<string[]>;
}

export abstract class _MatDatatableHarnessBase<
  HeaderRowType extends ComponentHarnessConstructor<HeaderRow> & {
    with: (options?: RowHarnessFilters) => HarnessPredicate<HeaderRow>;
  },
  HeaderRow extends RowBase,
  RowType extends ComponentHarnessConstructor<Row> & {
    with: (options?: RowHarnessFilters) => HarnessPredicate<Row>;
  },
  Row extends RowBase,
> extends ContentContainerComponentHarness<string> {
  protected abstract _headerRowHarness: HeaderRowType;
  protected abstract _rowHarness: RowType;

  /**
   * Gets all of the header rows in a mat-datatable.
   * @param filter - filter to select the sut (default; all rows).
   * @returns an array of all header rows matching the given filter.
   */
  async getHeaderRows(filter: RowHarnessFilters = {}): Promise<HeaderRow[]> {
    return this.locatorForAll(this._headerRowHarness.with(filter))();
  }

  /**
   * Gets all of the regular data rows in a mat-datatable.
   * @param filter - filter to select the sut (default; all rows).
   * @returns an array of all data rows matching the given filter.
   */
  async getRows(filter: RowHarnessFilters = {}): Promise<Row[]> {
    return this.locatorForAll(this._rowHarness.with(filter))();
  }

  /**
   * Gets the text inside the entire mat-datatable organized by rows.
   * @returns an array of arrays of the content of all data rows.
   */
  async getCellTextByIndex(): Promise<string[][]> {
    const rows = await this.getRows();
    return parallel(() => rows.map(row => row.getCellTextByIndex()));
  }

  /**
   * Gets the text inside the entire mat-datatable organized by columns.
   * @returns an object with all columns with headerText and array of data values.
   */
  async getCellTextByColumnName(): Promise<MatDatatableHarnessColumnsText> {
    const [headerRows, dataRows] = await parallel(() => [
      this.getHeaderRows(),
      this.getRows()
    ]);

    const text: MatDatatableHarnessColumnsText = {};
    const [headerData, rowsData] = await parallel(() => [
      parallel(() => headerRows.map(row => row.getCellTextByColumnName())),
      parallel(() => dataRows.map(row => row.getCellTextByColumnName()))
    ]);

    rowsData.forEach(data => {
      Object.keys(data).forEach(columnName => {
        const cellText = data[columnName];

        if (!text[columnName]) {
          text[columnName] = {
            headerText: getCellTextsByColumn(headerData, columnName),
            text: []
          };
        }

        text[columnName].text.push(cellText);
      });
    });

    return text;
  }
}

/** Harness for interacting with a mat-datatable in tests. */
export class MatDatatableHarness extends _MatDatatableHarnessBase<
  typeof MatHeaderRowHarness,
  MatHeaderRowHarness,
  typeof MatRowHarness,
  MatRowHarness
> {
  /** The selector for the host element of a `MatDatatableHarness` instance. */
  static hostSelector = '.mat-datatable';
  protected _headerRowHarness = MatHeaderRowHarness;
  protected _rowHarness = MatRowHarness;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a mat-datatable
   * with specific attributes.
   * @param options - Options for narrowing the search.
   * @returns a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatDatatableHarness>(
    this: ComponentHarnessConstructor<T>,
    options: MatDatatableHarnessFilters = {}
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }
}

/**
 * Extracts the text of cells only under a particular column.
 * @param rowsData - Array with text extracted from a mat-datatable row organized by columns.
 * @param column - Name of the column to get the texts from.
 * @returns an array of selected cell texts.
 */
const getCellTextsByColumn = (rowsData: MatRowHarnessColumnsText[], column: string): string[] => {
  const columnTexts: string[] = [];

  rowsData.forEach(data => {
    Object.keys(data).forEach(columnName => {
      if (columnName === column) {
        columnTexts.push(data[columnName]);
      }
    });
  });

  return columnTexts;
};
