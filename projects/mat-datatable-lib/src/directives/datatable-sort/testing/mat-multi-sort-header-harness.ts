import { ComponentHarness, HarnessPredicate, TestElement } from '@angular/cdk/testing';
import { SortDirection } from '@angular/material/sort';

import { MultiSortHeaderHarnessFilters } from './mat-multi-sort-harness-filters';

/**
 * Interface for the definition of the sorting of 1 table column
 * @param columnId - The id (name) of the column used for sorting.
 * @param direction - The current sorting direction (e.g. 'asc').
 */
export interface DomSortingDefinition {
  id: string;
  label: string;
  sortDirection: SortDirection;
  sortPosition: number;
}

/** Harness for interacting with a sAngular Material multi sort header in tests. */
export class MatMultiSortHeaderHarness extends ComponentHarness {
  static hostSelector = '.mat-multi-sort-header';
  private _containerContent = this.locatorFor('.mat-sort-header-content');
  private _badgeContent = this.locatorFor('.mat-multi-sort-badge-content');

  /**
   * Gets a `HarnessPredicate` that can be used to
   * search for a sort header with specific attributes.
   * @param options - Options for narrowing the search.
   * @returns predicate for identifying the sut
   */
  static with(options: MultiSortHeaderHarnessFilters = {}): HarnessPredicate<MatMultiSortHeaderHarness> {
    return new HarnessPredicate(MatMultiSortHeaderHarness, options)
      .addOption('label', options.label, (harness, label) =>
        HarnessPredicate.stringMatches(harness.getLabel(), label)
      )
      .addOption('id', options.id, (harness, id) =>
        HarnessPredicate.stringMatches(harness.getId(), id)
      )
      .addOption('sortDirection', options.sortDirection, (harness, sortDirection) => {
        return HarnessPredicate.stringMatches(harness.getSortDirection(), sortDirection);
      })
      .addOption('sortPosition', options.sortPosition, (harness, sortPosition) => {
        return numberMatches(harness.getSortPosition(), sortPosition);
      });
  }

  /**
   * Gets the label of the sort header.
   * @returns the label of the sort header.
   */
  async getLabel(): Promise<string> {
    return (await this._containerContent()).text();
  }

  /**
   * Gets the id of the sort header.
   * @returns the id of the sort header.
   */
  async getId(): Promise<string> {
    const host = await this.host();
    return await this._getId(host);
  }

  /**
   * Gets the sorting direction of the header.
   * @returns the sorting direction of the sort header.
   */
  async getSortDirection(): Promise<SortDirection> {
    const host = await this.host();
    return await this._getSortDirection(host);
  }

  /**
   * Gets the sorting position of the header.
   * @returns the sorting position of the sort header.
   */
  async getSortPosition(): Promise<number> {
    let result = Number.NaN;
    try {
      const position = await ((await this._badgeContent()).text());
      if (position.length !== 0) {
        result = Number(position);
      }
    } catch (err) {
      result = Number.NaN;
    }
    return result;
  }

  /**
   * Gets object with id, sortDirection and sortPosition
   * @returns an object with all information about the sort header.
   */
  async getAllSortData(): Promise<DomSortingDefinition> {
    const result = {
      id: '',
      label: '',
      sortDirection: '',
      sortPosition: Number.NaN
    } as DomSortingDefinition;
    const host = await this.host();
    const id = await this._getId(host);
    if (id !== '') {
      result.id = id;
      result.label = await (await this._containerContent()).text();
      result.sortDirection = await this._getSortDirection(host);
      result.sortPosition = await this.getSortPosition();
    }
    return result;
  }

  /**
   * Gets whether the sort header is currently being sorted by.
   * @returns true if the sort header is used for sorting.
   */
  async isActive(): Promise<boolean> {
    return !!(await this.getSortDirection());
  }

  /**
   * Whether the sort header is disabled.
   * @returns true if the sort header is disabled.
   */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).hasClass('mat-sort-header-disabled');
  }

  /**
   * Clicks the header to change its sorting direction.
   * Only works if the header is enabled.
   * @returns promise that completes after clicking the header.
   */
  async click(): Promise<void> {
    return (await this.host()).click();
  }

  /**
   * Gets the id of the sort header.
   * @param host - TestElement to be inspected (from 'await this.host()').
   * @returns promise that completes when id of the header is available.
   */
  private async _getId(host: TestElement): Promise<string> {
    const id = await host.getAttribute('mat-multi-sort-header');
    if (id !== null) {
      return id;
    } else {
      return '';
    }
  }

  /**
   * Gets the sorting direction of the header.
   * @param host - TestElement to be inspected (from 'await this.host()').
   * @returns promise that completes when SortDirection is available.
   */
  private async _getSortDirection(host: TestElement): Promise<SortDirection> {
    const ariaSort = await host.getAttribute('aria-sort');

    if (ariaSort === 'ascending') {
      return 'asc';
    } else if (ariaSort === 'descending') {
      return 'desc';
    }

    return '';
  }
}

/**
 * Checks if the specified nullable number value matches the given value.
 * @param value The nullable number value to check, or a Promise resolving to the
 *   nullable number value.
 * @param pattern The number the value is expected to match. If `pattern` is `null`,
 *   the value is expected to be `null`.
 * @returns Whether the value matches the pattern.
 */
const numberMatches= async (
  value: number | null | Promise<number | null>,
  pattern: number | null
): Promise<boolean> => {
  value = await value;
  if (pattern === null) {
    return value === null;
  } else if (value === null) {
    return false;
  }
  return value === pattern;
};
