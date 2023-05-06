import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { DemoTableDataSource } from '../datasource/demo-table-datasource.class';

import { DemoTableItem } from './shared/demo-table-item.interface';

import {
  MatColumnDefinition,
  MatDatatableComponent,
  MatDatatableDataSource,
  MatSortDefinition,
  MatSortDefinitionPos,
  RowSelectionType
} from 'projects/mat-datatable-lib/src';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('datatable') table!: MatDatatableComponent<DemoTableItem>;

  title = 'Mat-Datatable-Demo';

  protected dataSource: MatDatatableDataSource<DemoTableItem>;
  protected columnDefinitions: MatColumnDefinition<DemoTableItem>[] = [
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
      cell: (row: DemoTableItem) => row.birthday.toLocaleDateString(this.currentLocale, { dateStyle: 'medium' }),
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
  protected displayedColumns: string[] = ['id', 'firstName', 'lastName', 'email', 'birthday', 'description'];
  protected currentSorts: MatSortDefinitionPos[] = [];
  protected readonly currentSorts$ = new BehaviorSubject<MatSortDefinitionPos[]>([]);
  protected currentSelectionMode: RowSelectionType = 'none';
  protected selectedRowsAsString = '-';
  protected activatedRowAsString = '-';
  protected currentPageSize$ = new BehaviorSubject('');

  private currentLocale = 'en-US';
  private headers: Record<string, string> = {};

  constructor() {
    this.currentLocale = new Intl.NumberFormat().resolvedOptions().locale;
    this.dataSource = new DemoTableDataSource();
    this.headersTextFromColumnDefinitions();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.currentPageSizeChanged());
  }

  protected onRowClick($event: DemoTableItem) {
    this.selectedRowsAsString = this.selectedRowsToString();
    window.alert(`row clicked; id=${$event.userId}`);
  }

  protected onSortChanged(currentSorts: MatSortDefinitionPos[]) {
    this.currentSorts = currentSorts;
    this.currentSorts$.next(currentSorts);
  }

  protected headerFromColumnId(columnId: string): string {
    return this.headers[columnId];
  }

  /**
   * Remove sorting for given column
   * @param columnId - ID of column to be removed from sorting
   */
  protected removeSort(columnId: string): void {
    const newSort = this.currentSorts.filter(sort => sort.columnId !== columnId);
    this.table.setSorts(newSort);
  }

  // Demo to show sorting by code
  protected onSortId() {
    const newSort: MatSortDefinition[] = [
      { columnId:'id', direction:'asc' }
    ];
    this.table.setSorts(newSort);
  }
  protected onSortLastNameFirstNameBirthday() {
    const newSort: MatSortDefinition[] = [
      { columnId:'lastName', direction:'asc' },
      { columnId:'firstName', direction:'asc' },
      { columnId:'birthday', direction:'asc' }
    ];
    this.table.setSorts(newSort);
  }
  protected onSortLastNameBirthdayAsc() {
    const newSort: MatSortDefinition[] = [
      { columnId:'lastName', direction:'asc' },
      { columnId:'birthday', direction:'asc' }
    ];
    this.table.setSorts(newSort);
  }
  protected onSortLastNameBirthdayDesc() {
    const newSort: MatSortDefinition[] = [
      { columnId:'lastName', direction:'asc' },
      { columnId:'birthday', direction:'desc' }
    ];
    this.table.setSorts(newSort);
  }
  protected onSortBirthdayAsc() {
    const newSort: MatSortDefinition[] = [
      { columnId:'birthday', direction:'asc' }
    ];
    this.table.setSorts(newSort);
  }
  protected onSortBirthdayDesc() {
    const newSort: MatSortDefinition[] = [
      { columnId:'birthday', direction:'desc' }
    ];
    this.table.setSorts(newSort);
  }
  protected onClearSort() {
    this.table.setSorts([]);
  }

  // Demo to show setting selected rows by code
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

  // Demo to show setting activated rows by code
  protected onClearActivated() {
    this.table.activatedRow = undefined;
    this.activatedRowAsString = '-';
  }
  protected onSetActivated() {
    this.table.activatedRow = this.dataSource.data[3];
    this.activatedRowAsString = this.activatedRowToString();
  }
  protected activatedRowToString(): string {
    if (this.table !== undefined) {
      return this.table.activatedRow?.userId.toString() || '-';
    } else {
      return '-';
    }
  }

  // Demo to show / change pageSize of datasource
  protected onTogglePageSize() {
    if((this.table?.dataSource !== undefined) && (this.table?.dataSource.paginator !== undefined)) {
      const oldPageSize = this.table.dataSource.paginator.pageSize;
      const newPageSize = oldPageSize === 10 ? 20 : 10;
      this.table.dataSource.paginator.pageSize = +newPageSize;
      this.table.dataSource.paginator._changePageSize(+newPageSize);
      this.currentPageSizeChanged();
    } else {
      window.alert('datasource and/or paginator are undefined');
    }
  }
  private currentPageSizeChanged() {
    if((this.table?.dataSource !== undefined) && (this.table?.dataSource.paginator !== undefined)) {
      this.currentPageSize$.next(this.table.dataSource?.paginator?.pageSize.toString());
    }
  }

  /**
   * Create list of column headers.
   * Used to display current sorting definition as chips.
   */
  private headersTextFromColumnDefinitions() {
    for (let i = 0; i < this.columnDefinitions.length; i++) {
      this.headers[this.columnDefinitions[i].columnId] = this.columnDefinitions[i].header;
    }
  }
}
