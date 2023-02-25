import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSortModule } from '@angular/material/sort';

import {MatMultiSortHeaderComponent} from './mat-multi-sort-header.component';
import {MatMultiSort} from './mat-multi-sort.directive';

@NgModule({
  declarations: [
    MatMultiSortHeaderComponent,
    MatMultiSort
  ],
  exports: [
    MatMultiSortHeaderComponent,
    MatMultiSort
  ],
  imports: [
    CommonModule,
    MatSortModule
  ]
})
export class MatMultiSortModule {
}
