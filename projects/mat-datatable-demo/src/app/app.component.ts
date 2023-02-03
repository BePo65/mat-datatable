import { Component, ViewChild } from '@angular/core';

import { DemoTableDataSource } from '../datasource/demo-table-datasource.class';
import { DemoTableItem } from '../datasource/demo-table-item.interface';

import { MatColumnDefinition } from 'projects/mat-datatable-lib/src/interfaces/datatable-column-definition.interface';
import { MatDatatableDataSource } from 'projects/mat-datatable-lib/src/interfaces/datatable-datasource.class';
import { MatSortDefinition } from 'projects/mat-datatable-lib/src/interfaces/datatable-sort-definition.interface';
import { MatDatatableComponent } from 'projects/mat-datatable-lib/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('datatable') table!: MatDatatableComponent<DemoTableItem>;

  title = 'mat-datatable-demo';

  protected dataSource: MatDatatableDataSource<DemoTableItem>;
  protected columnDefinitions: MatColumnDefinition<DemoTableItem>[];
  protected displayedColumns: string[];
  protected selectedRowsAsString = '-';

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

  protected onRowClick($event: DemoTableItem) {
    this.selectedRowsAsString = this.selectedRowsToString();
    window.alert(`row clicked; id=${$event.userId}`);
  }

  // HACK for testing programatically sorting
  protected onSortFirstNameAsc() {
    const newSort: MatSortDefinition[] = [{ columnId:'firstName', direction:'asc'} ];
    this.table.setSort(newSort);
  }
  protected onSortFirstNameDesc() {
    const newSort: MatSortDefinition[] = [{ columnId:'firstName', direction:'desc'} ];
    this.table.setSort(newSort);
  }
  protected onSortBirthday() {
    const newSort: MatSortDefinition[] = [{ columnId:'birthdate', direction:'asc'} ];
    this.table.setSort(newSort);
  }
  protected onResetSort() {
    const newSort: MatSortDefinition[] = [{ columnId:'', direction:'asc'} ];
    this.table.setSort(newSort);
  }

  // HACK for testing programatically setting selected rows
  protected onClearSelection() {
    this.table.selectedRows = [];
    this.selectedRowsAsString = '-';
  }
  protected onSetSelection() {
    this.table.selectedRows = [ this.dataSource.data[1], this.dataSource.data[3], this.dataSource.data[88] ];
    this.selectedRowsAsString = this.selectedRowsToString();
  }
  protected selectedRowsToString(): string {
    if (this.table !== undefined) {
      return this.table.selectedRows
        .map(row => row.userId)
        .sort((a: number, b: number) => a - b )
        .join('; ');
    } else {
      return '-';
    }
  }
}
