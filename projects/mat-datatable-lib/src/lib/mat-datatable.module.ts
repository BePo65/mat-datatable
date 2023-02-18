import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';

import { MatDatatableHeaderAlignDirective } from '../directives/datatable-header-align.directive';
import { MatDatatableResizableDirective } from '../directives/datatable-resizable.directive';

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
    MatSortModule,
    MatTableModule
  ],
  exports: [
    MatDatatableComponent
  ]
})
export class MatDatatableModule { }
