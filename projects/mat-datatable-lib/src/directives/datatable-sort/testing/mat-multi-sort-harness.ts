import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

import { MultiSortHarnessFilters, MultiSortHeaderHarnessFilters } from './mat-multi-sort-harness-filters';
import { MatMultiSortHeaderHarness, DomSortingDefinition } from './mat-multi-sort-header-harness';

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
   * @param filter - filter to select the sut.
   */
  async getSortHeaders(filter: MultiSortHeaderHarnessFilters = {}): Promise<MatMultiSortHeaderHarness[]> {
    return this.locatorForAll(MatMultiSortHeaderHarness.with(filter))();
  }

  /** Gets the selected headers in the `mat-multi-sort` sorted by column number. */
  async getActiveHeaders(): Promise<MatMultiSortHeaderHarness[]> {
    const result: MatMultiSortHeaderHarness[] = [];
    const headers = await this.getSortHeaders();
    for (let i = 0; i < headers.length; i++) {
      if (await headers[i].isActive()) {
        result.push(headers[i]);
      }
    }

    return result;
  }

  /** Gets sortData from all active headers sorted by sort position. */
  async getActiveSortData(): Promise<DomSortingDefinition[]> {
    const result: DomSortingDefinition[] = [];
    const headers = await this.getActiveHeaders();
    for (let i = 0; i < headers.length; i++) {
      result.push(await headers[i].getAllSortData());
    }
    const sortedResult = result.sort(
      (a:DomSortingDefinition, b:DomSortingDefinition) => {
        return a.sortPosition - b.sortPosition;
      }
    );

    return sortedResult;
  }
}
