import {
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

/** Harness for interacting with a mat-datatable in tests. */
export class MatDatatableHarness extends ContentContainerComponentHarness<string> {
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

 /**
  * Gets the header row of a mat-datatable.
  * @returns the header row of the mat-datatable.
  */
 async getHeaderRow(): Promise<MatHeaderRowHarness> {
  return this.locatorFor(MatHeaderRowHarness)();
 }

  /**
   * Gets all of the regular data rows in a mat-datatable.
   * @param filter - filter to select the sut (default; all rows).
   * @returns an array of all data rows matching the given filter.
   */
  async getRows(filter: RowHarnessFilters = {}): Promise<MatRowHarness[]> {
    return this.locatorForAll(this._rowHarness.with(filter))();
  }

  /**
   * Gets the text inside the entire mat-datatable data rows organized by rows.
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
    const [headerRow, dataRows] = await parallel(() => [
      this.getHeaderRow(),
      this.getRows()
    ]);

    const text: MatDatatableHarnessColumnsText = {};
    const [headerData, rowsData] = await parallel(() => [
      headerRow.getCellTextByColumnName(),
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

/**
 * Extracts the text of the cell of a particular column.
 * @param headerRowData - Array with text extracted from a mat-datatable header row organized by columns.
 * @param column - Name of the column to get the text from.
 * @returns an array of selected cell texts.
 */
const getCellTextsByColumn = (headerRowData: MatRowHarnessColumnsText, column: string): string[] => {
  const columnTexts: string[] = [];

  Object.keys(headerRowData).forEach(columnName => {
    if (columnName === column) {
      columnTexts.push(headerRowData[columnName]);
    }
  });

  return columnTexts;
};
