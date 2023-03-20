import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSortModule } from '@angular/material/sort';

import { MatMultiSortBadgeDirective } from './mat-multi-sort-badge.directive';
import { MatMultiSortHeaderComponent} from './mat-multi-sort-header.component';
import { MatMultiSort } from './mat-multi-sort.directive';

@NgModule({
  imports: [
    CommonModule,
    MatSortModule
  ],
  exports: [
    MatMultiSortHeaderComponent,
    MatMultiSort
  ],
  declarations: [
    MatMultiSortHeaderComponent,
    MatMultiSortBadgeDirective,
    MatMultiSort
  ]
})
export class MatMultiSortModule {
}
