import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';

// TODO how to make this component generic (independent fro datasource structure)?
import { MatDatatableDataSource } from '../interfaces/mat-datatable-datasource.interface';

@Component({
  selector: 'mat-datatable',
  templateUrl: './mat-datatable.component.html',
  styleUrls: ['./mat-datatable.component.scss']
})
export class MatDatatableComponent implements AfterViewInit {
  // TODO how to make this component generic (independent from datasource structure)?
  @Input() dataSource: MatDatatableDataSource<unknown> | undefined;
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
      this.displayedColumns = ['id', 'name'];
    }
  }
}
