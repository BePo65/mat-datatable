import { Component } from '@angular/core';

import { DemoTableDataSource, DemoTableItem } from '../datasource/demo-table-datasource';

import { MatColumnDefinition } from 'projects/mat-datatable-lib/src/interfaces/datatable-column-definition.interface';
import { MatDatatableDataSource } from 'projects/mat-datatable-lib/src/interfaces/datatable-datasource.class';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'mat-datatable-demo';

  dataSource: MatDatatableDataSource<DemoTableItem>;
  columnDefinitions: MatColumnDefinition<DemoTableItem>[];
  displayedColumns: string[];

  constructor() {
    this.dataSource = new DemoTableDataSource();
    this.columnDefinitions = [
      {
        columnId: 'id',
        header: 'ID',
        cell: (row: DemoTableItem) => row.id.toString(),
        width: '5em'
      },
      {
        columnId: 'name',
        header: 'Name',
        cell: (row: DemoTableItem) => row.name
      }
    ];
    this.displayedColumns = ['id', 'name'];
  }
}
