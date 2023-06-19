import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { DemoTableDataStore } from '../datasource/demo-table-datastore.class';

import { DemoTableItem } from './shared/demo-table-item.interface';

import {
  MatColumnDefinition,
  MatDatatableComponent,
  MatSortDefinition,
  RowSelectionType
} from 'projects/mat-datatable-lib/src';
import { RequestPageOfList, RequestSortDataList } from 'projects/mat-datatable-lib/src/interfaces/datasource-endpoint.interface';

// HACK filter type as a starter - replace with correct one
type EmptyTestFilter = object;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('datatable') table!: MatDatatableComponent<DemoTableItem, EmptyTestFilter>;

  title = 'Mat-Datatable-Demo';

  protected dataStore = new DemoTableDataStore<DemoTableItem, object>();
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
  protected currentPage = 0;
  protected currentSorts: MatSortDefinition[] = [];
  protected readonly currentSorts$ = new BehaviorSubject<MatSortDefinition[]>([]);
  protected currentSelectionMode: RowSelectionType = 'none';
  protected selectedRowsAsString = '-';
  protected activatedRowAsString = '-';
  protected currentPageSize$ = new BehaviorSubject('');

  private currentLocale = 'en-US';
  private headers: Record<string, string> = {};

  constructor() {
    this.currentLocale = new Intl.NumberFormat().resolvedOptions().locale;
    this.headersTextFromColumnDefinitions();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.currentPageSizeChanged());
  }

  // arrow function is required to give dataStore.getPagedData the correct 'this'
  protected getData = (rowsRange: RequestPageOfList, sorts?: RequestSortDataList<DemoTableItem>[], filters?: object) => {
    const newPage = this.dataStore.getPagedData(rowsRange, sorts, filters);
    this.currentPage = this.table.page + 1;
    return newPage;
  };

  protected onRowClick($event: DemoTableItem) {
    window.alert(`row clicked; id=${$event.userId}`);
  }

  protected onSortChanged(currentSorts: MatSortDefinition[]) {
    this.currentSorts = currentSorts;
    this.currentSorts$.next(currentSorts);
  }

  protected onRowSelectionChange($event: DemoTableItem[]) {
    let result = '-';
    if ($event.length > 0) {
      result = $event
        .sort((a: DemoTableItem, b: DemoTableItem) => a.userId - b.userId )
        .map(row => row.userId)
        .join('; ') || '-';
    }
    this.selectedRowsAsString = result;
  }

  protected onPageSizeChanged() {
    this.currentPageSizeChanged();
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
    this.table.sortDefinitions = newSort;
  }

  // Demo to show sorting by code
  protected onSortId() {
    const newSort: MatSortDefinition[] = [
      { columnId:'id', direction:'asc' }
    ];
    this.table.sortDefinitions = newSort;
  }
  protected onSortLastNameFirstNameBirthday() {
    const newSort: MatSortDefinition[] = [
      { columnId:'lastName', direction:'asc' },
      { columnId:'firstName', direction:'asc' },
      { columnId:'birthday', direction:'asc' }
    ];
    this.table.sortDefinitions = newSort;
  }
  protected onSortLastNameBirthdayAsc() {
    const newSort: MatSortDefinition[] = [
      { columnId:'lastName', direction:'asc' },
      { columnId:'birthday', direction:'asc' }
    ];
    this.table.sortDefinitions = newSort;
  }
  protected onSortLastNameBirthdayDesc() {
    const newSort: MatSortDefinition[] = [
      { columnId:'lastName', direction:'asc' },
      { columnId:'birthday', direction:'desc' }
    ];
    this.table.sortDefinitions = newSort;
  }
  protected onSortBirthdayAsc() {
    const newSort: MatSortDefinition[] = [
      { columnId:'birthday', direction:'asc' }
    ];
    this.table.sortDefinitions = newSort;
  }
  protected onSortBirthdayDesc() {
    const newSort: MatSortDefinition[] = [
      { columnId:'birthday', direction:'desc' }
    ];
    this.table.sortDefinitions = newSort;
  }
  protected onClearSort() {
    this.table.sortDefinitions = [];
  }

  // Demo to show setting selected rows by code
  protected onClearSelection() {
    this.table.selectedRows = [];
  }
  protected onSetSelection() {
    this.table.selectedRows = [ this.dataStore.getUnsortedPage(1), this.dataStore.getUnsortedPage(3), this.dataStore.getUnsortedPage(88) ];
  }

  // Demo to show setting activated rows by code
  protected onClearActivated() {
    this.table.activatedRow = undefined;
    this.activatedRowAsString = '-';
  }
  protected onSetActivated() {
    this.table.activatedRow = this.dataStore.getUnsortedPage(3);
    this.activatedRowAsString = this.activatedRowToString();
  }
  private activatedRowToString(): string {
    if (this.table !== undefined) {
      return this.table.activatedRow?.userId.toString() || '-';
    } else {
      return '-';
    }
  }

  // Demo to show / change pageSize of datasource
  protected onTogglePageSize() {
    const oldPageSize = this.table.pageSize;
    const newPageSize = oldPageSize === 10 ? 20 : 10;
    this.table.pageSize = +newPageSize;
    this.currentPageSizeChanged();
  }
  private currentPageSizeChanged() {
      this.currentPageSize$.next(this.table.pageSize.toString());
  }

  protected onGotoPage(pageNumber: number) {
    this.table.page = pageNumber;
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
