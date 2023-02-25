import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';

import { MatDatatableHeaderAlignDirective } from '../directives/datatable-header-align.directive';
import { MatDatatableResizableDirective } from '../directives/datatable-resizable.directive';
import { MatMultiSortModule } from '../directives/datatable-sort/mat-multi-sort.module';

import { MatDatatableComponent } from './mat-datatable.component';

@NgModule({
  declarations: [
    MatDatatableComponent,
    MatDatatableHeaderAlignDirective,
    MatDatatableResizableDirective
  ],
  imports: [
    BrowserModule,
    MatPaginatorModule,
    MatTableModule,
    MatMultiSortModule
  ],
  exports: [
    MatDatatableComponent
  ]
})
export class MatDatatableModule { }
