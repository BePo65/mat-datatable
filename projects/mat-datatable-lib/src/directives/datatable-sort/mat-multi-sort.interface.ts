import { SortDirection } from '@angular/material/sort';

/** Sort direction with 'asc ' or 'desc' only */
export type SortDirectionAscDesc = Omit<SortDirection, ''>;

/** Allowed horizontal position options for matBadgePositionH */
export type MatBadgePosition = 'before' | 'after';
