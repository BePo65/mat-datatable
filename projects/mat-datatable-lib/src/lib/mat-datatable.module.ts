import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';

import { MatDatatableHeaderAlignDirective } from '../directives/datatable-header-align.directive';
import { MatDatatableResizableDirective } from '../directives/datatable-resizable.directive';
import { MatMultiSortModule } from '../directives/datatable-sort';

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
    MatProgressBarModule,
    MatTableModule,
    MatMultiSortModule
  ],
  exports: [
    MatDatatableComponent
  ]
})
export class MatDatatableModule { }
