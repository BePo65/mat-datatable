import {
  ComponentHarnessConstructor,
  ContentContainerComponentHarness,
  HarnessPredicate,
  parallel
} from '@angular/cdk/testing';

import {
  MatDatatableHarnessFilters,
  RowHarnessFilters
} from './mat-datatable-harness-filters';
import {
  MatFooterRowHarness,
  MatHeaderRowHarness,
  MatRowHarness,
  MatRowHarnessColumnsText
} from './mat-datatable-row-harness';

/** Text extracted from a mat-datatable organized by columns. */
export interface MatDatatableHarnessColumnsText {
  [columnName: string]: {
    text: string[];
    headerText: string;
    footerText: string | undefined;
  };
}

/** Harness for interacting with a mat-datatable in tests. */
export class MatDatatableHarness extends ContentContainerComponentHarness<string> {
  /** The selector for the host element of a `MatDatatableHarness` instance. */
  static hostSelector = '.mat-datatable';
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
  * Gets a list of the header rows of a mat-datatable.
  * @returns array of the header rows of the mat-datatable (length is always 1).
  */
 async getHeaderRows(): Promise<MatHeaderRowHarness[]> {
  return this.locatorForAll(MatHeaderRowHarness)();
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
   * Gets a list of the footer rows in a mat-datatable.
   * @returns array of the footer rows of the mat-datatable (or an empty array, if no footer is defined).
   */
  async getFooterRows(): Promise<MatFooterRowHarness[]> {
    return this.locatorForAll(MatFooterRowHarness)();
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
    const [headerRows, footerRows, dataRows] = await parallel(() => [
      this.getHeaderRows(),
      this.getFooterRows(),
      this.getRows()
    ]);

    const text: MatDatatableHarnessColumnsText = {};
    const [headerData, footerData, rowsData] = await parallel(() => [
      headerRows[0].getCellTextByColumnName(),
      (footerRows.length === 1) ? footerRows[0].getCellTextByColumnName() : undefined,
      parallel(() => dataRows.map(row => row.getCellTextByColumnName()))
    ]);

    rowsData.forEach(data => {
      Object.keys(data).forEach(columnName => {
        const cellText = data[columnName];

        if (!text[columnName]) {
          text[columnName] = {
            headerText: getHeaderCellTextByColumn(headerData, columnName),
            footerText: (footerData !== undefined) ? getFooterCellTextByColumn(footerData, columnName) : undefined,
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
 * Extracts the text of the header cell of a particular column.
 * @param headerRowData - Array with text extracted from a mat-datatable header row organized by columns.
 * @param column - Name of the column to get the text from.
 * @returns the selected cell text.
 */
const getHeaderCellTextByColumn = (headerRowData: MatRowHarnessColumnsText, column: string): string => {
  let columnText = '';

  Object.keys(headerRowData).forEach(columnName => {
    if (columnName === column) {
      columnText = headerRowData[columnName];
    }
  });

  return columnText;
};

/**
 * Extracts the text of the header cell of a particular column.
 * @param footerRowData - Array with text extracted from a mat-datatable footer row organized by columns.
 * @param column - Name of the column to get the text from.
 * @returns the selected footer cell text (or undefined, if no footer is defined).
 */
const getFooterCellTextByColumn = (footerRowData: MatRowHarnessColumnsText, column: string): string | undefined => {
  let columnText: string | undefined;

  Object.keys(footerRowData).forEach(columnName => {
    if (columnName === column) {
      columnText = footerRowData[columnName];
    }
  });

  return columnText;
};
