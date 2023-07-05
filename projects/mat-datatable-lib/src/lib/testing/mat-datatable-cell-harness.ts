import {
  ContentContainerComponentHarness,
  HarnessPredicate
} from '@angular/cdk/testing';

import { HeaderCellHarnessFilters, RowCellHarnessFilters } from './mat-datatable-harness-filters';

export abstract class _MatCellHarnessBase extends ContentContainerComponentHarness {
  /**
   * Gets the cell's text.
   * @returns the text of the cell.
   */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /**
   * Gets the name of the column that the cell belongs to.
   * @returns the name of the column of the cell.
   */
  async getColumnName(): Promise<string> {
    const host = await this.host();
    const classAttribute = await host.getAttribute('class');

    if (classAttribute) {
      const prefix = 'mat-column-';
      const name = classAttribute
        .split(' ')
        .map(c => c.trim())
        .find(c => c.startsWith(prefix));

      if (name) {
        return name.split(prefix)[1];
      }
    }

    throw Error('Could not determine column name of cell.');
  }

  /**
   * Gets the cell's column width in 'px' (with padding).
   * @returns the width of the header cell.
   */
  async getColumnWidth(): Promise<number> {
    const widthAsString = await (await this.host()).getCssValue('width');
    let width = 0;

    if (!Number.isNaN(widthAsString)) {
      width = parseFloat(widthAsString);
    }

    return width;
  }
}

/** Harness for interacting with a mat-datatable cell of a row. */
export class MatRowCellHarness extends _MatCellHarnessBase {
  /** The selector for the host element of a `MatRowCellHarness` instance. */
  static hostSelector = '.mat-mdc-cell';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a table cell with specific attributes.
   * @param options - Options for narrowing the search
   * @returns a `HarnessPredicate` configured with the given options.
   */
  static with(options: RowCellHarnessFilters = {}): HarnessPredicate<MatRowCellHarness> {
    return new HarnessPredicate(MatRowCellHarness, options)
      .addOption('text', options.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text)
      )
      .addOption('columnName', options.columnName, (harness, name) =>
        HarnessPredicate.stringMatches(harness.getColumnName(), name)
      )
      .addOption('isSingleLine', options.isSingleLine, (harness, isSingleLine) =>
        booleanMatches(harness.isSingleLine(), isSingleLine)
      );
  }

  /**
   * Check, if cell is defined as 'showAsSingleLine'.
   * @returns true, if cell is shown as single line
   */
  async isSingleLine(): Promise<boolean> {
    return (await this.host()).hasClass('mat-datatable-single-line');
  }
}

/** Harness for interacting with a mat-datatable cell of a header row. */
export class MatHeaderCellHarness extends _MatCellHarnessBase {
  /** The selector for the host element of a `MatHeaderCellHarness` instance. */
  static hostSelector = '.mat-mdc-header-cell';
  protected resizerElement = this.locatorForOptional('.resize-holder');
  protected headerContent = this.locatorFor('.mat-sort-header-content');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a table header cell with specific
   * attributes.
   * @param options - Options for narrowing the search
   * @returns a `HarnessPredicate` configured with the given options.
   */
  static with(options: HeaderCellHarnessFilters = {}): HarnessPredicate<MatHeaderCellHarness> {
    return new HarnessPredicate(MatHeaderCellHarness, options)
      .addOption('text', options.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text)
      )
      .addOption('columnName', options.columnName, (harness, name) =>
        HarnessPredicate.stringMatches(harness.getColumnName(), name)
      )
      .addOption('isResizable', options.isResizable, (harness, isResizable) =>
        booleanMatches(harness.isResizable(), isResizable)
      );
  }

  /**
   * Gets the cell's header text.
   * The method must take the text from the div containing the header title;
   * otherwise the sorting position would be appended.
   * @returns the header text of the cell.
   */
  override async getText(): Promise<string> {
    return (await this.headerContent()).text();
  }

  /**
   * Check, if cell is defined as 'resizable'.
   * @returns true, if cell is resizable
   */
  async isResizable(): Promise<boolean> {
    return (await this.resizerElement() !== null);
  }

  /**
   * Resize header cell (and therefore column) to new width.
   * @param newWidth - new width of the column
   * @returns promise that completes after resizing the column
   */
  async resize(newWidth: number): Promise<void> {
    const element = await this.resizerElement();
    if (element !== null) {
      const originalWidth = await this.getColumnWidth();
      const startPosition = 0;
      const endPosition = startPosition + (newWidth - originalWidth);
      await (element).dispatchEvent('mousedown',{ pageX: startPosition });
      document.dispatchEvent(new MouseEvent('mousemove', { buttons: 1, clientX: endPosition }));
      document.dispatchEvent(new MouseEvent('mouseup',{ clientX: endPosition }));
    }
    return;
  }
}

/**
 * Checks if the specified nullable boolean value matches the given value.
 * @param value The nullable boolean value to check, or a Promise resolving to the
 *   nullable boolean value.
 * @param pattern The boolean the value is expected to match. If `pattern` is `null`,
 *   the value is expected to be `null`.
 * @returns Whether the value matches the pattern.
 */
const booleanMatches= async (
  value: boolean | null | Promise<boolean | null>,
  pattern: boolean | null
): Promise<boolean> => {
  value = await value;
  if (pattern === null) {
    return value === null;
  } else if (value === null) {
    return false;
  }
  return value === pattern;
};
