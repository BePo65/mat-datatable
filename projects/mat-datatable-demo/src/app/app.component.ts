import { Component } from '@angular/core';

import { DemoTableDataSource } from '../datasource/demo-table-datasource.class';
import { DemoTableItem } from '../datasource/demo-table-item.interface';

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

  private currentLocale = 'en-US';

  constructor() {
    this.currentLocale = new Intl.NumberFormat().resolvedOptions().locale;
    this.dataSource = new DemoTableDataSource();
    this.columnDefinitions = [
      {
        columnId: 'id',
        header: 'ID',
        cell: (row: DemoTableItem) => row.userId.toString(),
        width: '5em'
      },
      {
        columnId: 'firstName',
        header: 'First Name',
        cell: (row: DemoTableItem) => row.firstName,
        width: '10em',
        isSortable: true
      },
      {
        columnId: 'lastName',
        header: 'Last Name',
        cell: (row: DemoTableItem) => row.lastName,
        width: '10em',
        isSortable: true
      },
      {
        columnId: 'email',
        header: 'EMail',
        cell: (row: DemoTableItem) => row.email,
        width: '20em',
        tooltip: (row: DemoTableItem) => row.email,
        showAsMailtoLink: true
      },
      {
        columnId: 'birthdate',
        header: 'Birthday',
        cell: (row: DemoTableItem) => row.birthdate.toLocaleDateString(this.currentLocale, {dateStyle: 'medium'}),
        width: '8em',
        isSortable: true
      },
      {
        columnId: 'description',
        header: 'Description',
        cell: (row: DemoTableItem) => row.description,
        tooltip: (row: DemoTableItem) => row.description,
        showAsSingleLine: true
      }
    ];
    this.displayedColumns = ['id', 'firstName', 'lastName', 'email', 'birthdate', 'description'];
  }
}
