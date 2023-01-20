import { Component } from '@angular/core';

import { DemoTableDataSource, DemoTableItem } from '../datasource/demo-table-datasource';

import { MatDatatableDataSource } from 'projects/mat-datatable-lib/src/interfaces/mat-datatable-datasource.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'mat-datatable-demo';

  dataSource: MatDatatableDataSource<DemoTableItem> | undefined;
  displayedColumns: string[] = [];

  constructor() {
    this.dataSource = new DemoTableDataSource();
    this.displayedColumns = ['id', 'name'];
  }
}
