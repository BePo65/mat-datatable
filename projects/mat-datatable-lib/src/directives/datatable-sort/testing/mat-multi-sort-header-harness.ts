import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { SortDirection } from '@angular/material/sort';

import { MultiSortHeaderHarnessFilters } from './mat-multi-sort-harness-filters';

/** Harness for interacting with a sAngular Material multi sort header in tests. */
export class MatMultiSortHeaderHarness extends ComponentHarness {
  static hostSelector = '.mat-multi-sort-header';
  private _containerContent = this.locatorFor('.mat-sort-header-content');

  /**
   * Gets a `HarnessPredicate` that can be used to
   * search for a sort header with specific attributes.
   *
   * @param options - filter for identifying the sut
   * @returns predicate for identifying the sut
   */
  static with(options: MultiSortHeaderHarnessFilters = {}): HarnessPredicate<MatMultiSortHeaderHarness> {
    return new HarnessPredicate(MatMultiSortHeaderHarness, options)
      .addOption('label', options.label, (harness, label) =>
        HarnessPredicate.stringMatches(harness.getLabel(), label)
      )
      .addOption('sortDirection', options.sortDirection, (harness, sortDirection) => {
        return HarnessPredicate.stringMatches(harness.getSortDirection(), sortDirection);
      });
  }

  /** Gets the label of the sort header. */
  async getLabel(): Promise<string> {
    return (await this._containerContent()).text();
  }

  /** Gets the sorting direction of the header. */
  async getSortDirection(): Promise<SortDirection> {
    const host = await this.host();
    const ariaSort = await host.getAttribute('aria-sort');

    if (ariaSort === 'ascending') {
      return 'asc';
    } else if (ariaSort === 'descending') {
      return 'desc';
    }

    return '';
  }

  /** Gets whether the sort header is currently being sorted by. */
  async isActive(): Promise<boolean> {
    return !!(await this.getSortDirection());
  }

  /** Whether the sort header is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).hasClass('mat-sort-header-disabled');
  }

  /** Clicks the header to change its sorting direction. Only works if the header is enabled. */
  async click(): Promise<void> {
    return (await this.host()).click();
  }
}
