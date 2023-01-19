import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { MatDatatableComponent } from './mat-datatable.component';

@NgModule({
  declarations: [
    MatDatatableComponent
  ],
  imports: [
    MatPaginatorModule,
    MatSortModule,
    MatTableModule
  ],
  exports: [
    MatDatatableComponent
  ]
})
export class MatDatatableModule { }
