/* eslint-disable @angular-eslint/directive-class-suffix */

import { Directive, OnChanges, OnInit } from '@angular/core';
import { MatSort, MatSortable, SortDirection } from '@angular/material/sort';

export type SortDirectionAscDesc = Omit<SortDirection, ''>;

@Directive({
  selector: '[matMultiSort]',
  exportAs: 'matMultiSort'
})
export class MatMultiSort extends MatSort implements OnInit, OnChanges {

  // HACK start = 'asc' as 'asc' | 'desc';

  actives: string[] = [];
  directions: SortDirection[] = [];

  override ngOnInit(): void {
    super.ngOnInit();
  }

  override sort(sortable: MatSortable): void {
    this.updateMultipleSorts(sortable);
    super.sort(sortable);
  }

  updateMultipleSorts(sortable: MatSortable): void {
    const i = this.actives.findIndex(activeId => activeId === sortable.id);

    if (this.isActive(sortable)) {
      if (this.activeDirection(sortable) === (sortable.start ? sortable.start : this.start)) {
        this.directions.splice(i, 1, this.getNextSortDirection(sortable));
      } else {
        this.actives.splice(i, 1);
        this.directions.splice(i, 1);
      }
    } else {
      this.actives.push(sortable.id);
      this.directions.push(sortable.start ? sortable.start : this.start);
    }
  }

  isActive(sortable: MatSortable) {
    const i = this.actives.findIndex(activeId => activeId === sortable.id);
    return i > -1;
  }

  activeDirection(sortable: MatSortable): SortDirectionAscDesc {
    const i = this.actives.findIndex(activeId => activeId === sortable.id);
    return this.directions[i] || (sortable.start ? sortable.start : this.start);
  }

}
