import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSortModule } from '@angular/material/sort';

import { MatMultiSortBadgeDirective } from './mat-multi-sort-badge.directive';
import { MatMultiSortHeaderComponent} from './mat-multi-sort-header.component';
import { MatMultiSort } from './mat-multi-sort.directive';

@NgModule({
  declarations: [
    MatMultiSortHeaderComponent,
    MatMultiSortBadgeDirective,
    MatMultiSort
  ],
  exports: [
    MatMultiSortHeaderComponent,
    MatMultiSortBadgeDirective,
    MatMultiSort
  ],
  imports: [
    CommonModule,
    MatSortModule
  ]
})
export class MatMultiSortModule {
}
