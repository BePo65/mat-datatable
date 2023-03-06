import { Component, ViewChild } from '@angular/core';

import { DemoTableDataSource } from '../datasource/demo-table-datasource.class';
import { DemoTableItem } from '../datasource/demo-table-item.interface';

import {
  MatColumnDefinition,
  MatDatatableComponent,
  MatDatatableDataSource,
  MatSortDefinition,
  MatSortDefinitionPos,
  RowSelectionType
} from 'projects/mat-datatable-lib/src/public-api';

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
  protected currentSelectionMode: RowSelectionType = 'none';
  protected selectedRowsAsString = '-';
  protected activatedRowAsString = '-';

  private currentLocale = 'en-US';

  constructor() {
    this.currentLocale = new Intl.NumberFormat().resolvedOptions().locale;
    this.dataSource = new DemoTableDataSource();
    this.columnDefinitions = [
      {
        columnId: 'id',
        header: 'ID',
        cell: (row: DemoTableItem) => row.userId.toString(),
        headerAlignment: 'right',
        cellAlignment: 'right',
        width: '5em'
      },
      {
        columnId: 'firstName',
        header: 'First Name',
        cell: (row: DemoTableItem) => row.firstName,
        headerAlignment: 'left',
        cellAlignment: 'left',
        width: '10em',
        sortable: true,
        resizable: true
      },
      {
        columnId: 'lastName',
        header: 'Last Name',
        cell: (row: DemoTableItem) => row.lastName,
        headerAlignment: 'right',
        cellAlignment: 'right',
        width: '10em',
        sortable: true
      },
      {
        columnId: 'email',
        header: 'EMail',
        cell: (row: DemoTableItem) => row.email,
        width: '20em',
        tooltip: (row: DemoTableItem) => row.email,
        showAsMailtoLink: true,
        resizable: true
      },
      {
        columnId: 'birthday',
        header: 'Birthday',
        cell: (row: DemoTableItem) => row.birthday.toLocaleDateString(this.currentLocale, {dateStyle: 'medium'}),
        headerAlignment: 'center',
        cellAlignment: 'center',
        width: '8em',
        sortable: true,
        resizable: false
      },
      {
        columnId: 'description',
        header: 'Description',
        cell: (row: DemoTableItem) => row.description,
        tooltip: (row: DemoTableItem) => row.description,
        showAsSingleLine: true
      }
    ];
    this.displayedColumns = ['id', 'firstName', 'lastName', 'email', 'birthday', 'description'];
  }

  protected onRowClick($event: DemoTableItem) {
    this.selectedRowsAsString = this.selectedRowsToString();
    window.alert(`row clicked; id=${$event.userId}`);
  }

  protected onSortChanged(currentSorts: MatSortDefinitionPos[]) {
    // TODO display sorting definition
    console.group('demo > onSortChanged');
    console.log(currentSorts);
    console.groupEnd();
  }

  // HACK for testing programmatically sorting
  protected onSortId() {
    const newSort: MatSortDefinition[] = [
      { columnId:'id', direction:'asc'}
    ];
    this.table.setAllSorts(newSort);
  }
  protected onSortLastNameFirstNameBirthday() {
    const newSort: MatSortDefinition[] = [
      { columnId:'lastName', direction:'asc'},
      { columnId:'firstName', direction:'asc'},
      { columnId:'birthday', direction:'asc'}
    ];
    this.table.setAllSorts(newSort);
  }
  protected onSortLastNameBirthdayAsc() {
    const newSort: MatSortDefinition[] = [
      { columnId:'lastName', direction:'asc'},
      { columnId:'birthday', direction:'asc'}
    ];
    this.table.setAllSorts(newSort);
  }
  protected onSortLastNameBirthdayDesc() {
    const newSort: MatSortDefinition[] = [
      { columnId:'lastName', direction:'asc'},
      { columnId:'birthday', direction:'desc'}
    ];
    this.table.setAllSorts(newSort);
  }
  protected onSortBirthdayAsc() {
    const newSort: MatSortDefinition[] = [
      { columnId:'birthday', direction:'asc'}
    ];
    this.table.setAllSorts(newSort);
  }
  protected onSortBirthdayDesc() {
    const newSort: MatSortDefinition[] = [
      { columnId:'birthday', direction:'desc'}
    ];
    this.table.setAllSorts(newSort);
  }
  protected onClearSort() {
    this.table.setAllSorts([]);
  }

  // HACK for testing programmatically setting selected rows
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
        .join('; ') || '-';
    } else {
      return '-';
    }
  }

  // HACK for testing programmatically setting activated rows
  protected onClearActivated() {
    this.table.activatedRow = undefined;
    this.activatedRowAsString = '-';
  }
  protected onSetActivated() {
    this.table.activatedRow = this.dataSource.data[3];
    this.activatedRowAsString = this.selectedRowsToString();
  }
  protected activatedRowToString(): string {
    if (this.table !== undefined) {
      return this.table.activatedRow?.userId.toString() || '-';
    } else {
      return '-';
    }
  }
}
