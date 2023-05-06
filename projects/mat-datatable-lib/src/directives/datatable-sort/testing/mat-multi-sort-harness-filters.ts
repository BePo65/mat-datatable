import { BaseHarnessFilters } from '@angular/cdk/testing';
import { SortDirection } from '@angular/material/sort';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MultiSortHarnessFilters extends BaseHarnessFilters {}

export interface MultiSortHeaderHarnessFilters extends BaseHarnessFilters {
  label?: string | RegExp;
  id?: string | RegExp;
  sortDirection?: SortDirection | RegExp;
  sortPosition?: number;
}
