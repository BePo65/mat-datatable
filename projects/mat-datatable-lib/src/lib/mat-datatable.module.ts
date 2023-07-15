import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';

import { MatDatatableHeaderAlignDirective } from '../directives/datatable-header-align.directive';
import { MatDatatableResizableDirective } from '../directives/datatable-resizable.directive';
import { MatMultiSortModule } from '../directives/datatable-sort';
import { TableItemSizeDirective } from '../directives/virtual-scroll/table-item-size.directive';

import { MatDatatableComponent } from './mat-datatable.component';

@NgModule({
  declarations: [
    MatDatatableComponent,
    MatDatatableHeaderAlignDirective,
    MatDatatableResizableDirective,
    TableItemSizeDirective
  ],
  imports: [
    BrowserModule,
    MatProgressBarModule,
    MatTableModule,
    MatMultiSortModule,
    ScrollingModule
  ],
  exports: [
    MatDatatableComponent
  ]
})
export class MatDatatableModule { }
