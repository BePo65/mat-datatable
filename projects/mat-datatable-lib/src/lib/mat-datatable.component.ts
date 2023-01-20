import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';

import { MatColumnDefinition } from '../interfaces/datatable-column-definition.interface';
import { MatDatatableDataSource } from '../interfaces/datatable-datasource.class';

@Component({
  selector: 'mat-datatable',
  templateUrl: './mat-datatable.component.html',
  styleUrls: ['./mat-datatable.component.scss']
})
export class MatDatatableComponent implements AfterViewInit {
  // TODO how to make this component generic (independent from datasource structure)?
  @Input() dataSource: MatDatatableDataSource<unknown> | undefined;
  @Input() columnDefinitions: MatColumnDefinition[] = [];
  @Input() displayedColumns: string[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<unknown>;

  constructor() {
    // HACK do we need some initialization?
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      // we need a base class with fields sort and paginator
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.table.dataSource = this.dataSource;
    }
  }
}
