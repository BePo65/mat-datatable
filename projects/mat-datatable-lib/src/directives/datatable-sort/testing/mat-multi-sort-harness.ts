import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

import { MultiSortHarnessFilters, MultiSortHeaderHarnessFilters } from './mat-multi-sort-harness-filters';
import { MatMultiSortHeaderHarness } from './mat-multi-sort-header-harness';

/** Harness for interacting with a standard `mat-sort` in tests. */
export class MatMultiSortHarness extends ComponentHarness {
  static hostSelector = '.mat-multi-sort';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `mat-sort` with specific attributes.
   *
   * @param options Options for narrowing the search.
   * @returns a `HarnessPredicate` configured with the given options.
   */
  static with(options: MultiSortHarnessFilters = {}): HarnessPredicate<MatMultiSortHarness> {
    return new HarnessPredicate(MatMultiSortHarness, options);
  }

  /**
   * Gets all of the sort headers in the `mat-multi-sort`.
   *
   * @param filter - filter to select the sut
   */
  async getSortHeaders(filter: MultiSortHeaderHarnessFilters = {}): Promise<MatMultiSortHeaderHarness[]> {
    return this.locatorForAll(MatMultiSortHeaderHarness.with(filter))();
  }

  /** Gets the selected header in the `mat-multi-sort`. */
  async getActiveHeader(): Promise<MatMultiSortHeaderHarness | null> {
    const headers = await this.getSortHeaders();
    for (let i = 0; i < headers.length; i++) {
      if (await headers[i].isActive()) {
        return headers[i];
      }
    }
    return null;
  }
}
