import { AfterViewInit, Component, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { BehaviorSubject, delay, Subject, takeUntil } from 'rxjs';

import { DemoTableDataStore } from '../datasource/demo-table-datastore.class';

import { DemoTableItem } from './shared/demo-table-item.interface';

import {
  MatColumnDefinition,
  MatDatatableComponent,
  MatSortDefinition,
  RowSelectionType
} from 'projects/mat-datatable-lib/src';
import { RequestRowsRange, FieldSortDefinition, FieldFilterDefinition } from 'projects/mat-datatable-lib/src/interfaces/datasource-endpoint.interface';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('datatable') table!: MatDatatableComponent<DemoTableItem>;

  title = 'Mat-Datatable-Demo';

  protected dataStore = new DemoTableDataStore<DemoTableItem>();
  protected columnDefinitions: MatColumnDefinition<DemoTableItem>[] = [
    {
      columnId: 'userId',
      header: 'ID',
      cell: (row: DemoTableItem) => row?.userId?.toString(),
      headerAlignment: 'right',
      cellAlignment: 'right',
      width: '5em',
      footer: '0 / 0',
      footerColumnSpan: 5
    },
    {
      columnId: 'firstName',
      sortable: true,
      resizable: true,
      header: 'First Name',
      headerAlignment: 'left',
      cell: (row: DemoTableItem) => row?.firstName,
      cellAlignment: 'left',
      width: '10em'
    },
    {
      columnId: 'lastName',
      sortable: true,
      header: 'Last Name',
      headerAlignment: 'right',
      cell: (row: DemoTableItem) => row?.lastName,
      cellAlignment: 'right',
      width: '10em'
    },
    {
      columnId: 'email',
      resizable: true,
      header: 'EMail',
      cell: (row: DemoTableItem) => row?.email,
      width: '20em',
      tooltip: (row: DemoTableItem) => row?.email,
      showAsMailtoLink: true
    },
    {
      columnId: 'birthday',
      sortable: true,
      resizable: false,
      header: 'Birthday',
      headerAlignment: 'center',
      cell: (row: DemoTableItem) => row?.birthday?.toLocaleDateString(this.currentLocale, { dateStyle: 'medium' }),
      cellAlignment: 'center',
      width: '8em'
    },
    {
      columnId: 'description',
      header: 'Description',
      cell: (row: DemoTableItem) => row?.description,
      tooltip: (row: DemoTableItem) => row?.description,
      showAsSingleLine: true,
      footer: 'no filter',
      footerAlignment: 'right'
    }
  ];
  protected withFooter = true;
  protected displayedColumns: string[] = ['userId', 'firstName', 'lastName', 'email', 'birthday', 'description'];
  protected currentSorts: MatSortDefinition[] = [];
  protected readonly currentSorts$ = new BehaviorSubject<MatSortDefinition[]>([]);
  protected currentSelectionMode: RowSelectionType = 'none';
  protected selectedRowsAsString = '-';
  protected activatedRowAsString = '-';
  protected currentPageSize$ = new BehaviorSubject('');
  protected numberOfRows = '-';
  protected numberOfFilteredRows = '-';
  protected firstVisibleRow = '-';

  private currentLocale = 'en-US';
  private headers: Record<string, string> = {};
  private readonly unsubscribe$ = new Subject<void>();
  private formattedDatastoreLengths = 'filtered {0} / total {1}';

  constructor() {
    this.currentLocale = new Intl.NumberFormat().resolvedOptions().locale;
    this.headersTextFromColumnDefinitions();
  }

  ngAfterViewInit(): void {
    this.table.totalRowsChanged
    .pipe(
      takeUntil(this.unsubscribe$),
      delay(0)
    )
    .subscribe(numberOfRows => {
      this.numberOfRows = numberOfRows.toString();
      this.columnDefinitions[0].footer = this.formatString(this.formattedDatastoreLengths, this.numberOfFilteredRows.toString(), this.numberOfRows.toString());
    });

    this.table.filteredRowsChanged
    .pipe(
      takeUntil(this.unsubscribe$),
      delay(0)
    )
    .subscribe(numberOfRows => {
      this.numberOfFilteredRows = numberOfRows.toString();
      this.columnDefinitions[0].footer = this.formatString(this.formattedDatastoreLengths, this.numberOfFilteredRows.toString(), this.numberOfRows.toString());
    });

    this.table.firstVisibleIndexChanged
    .pipe(
      takeUntil(this.unsubscribe$),
      delay(0)
    )
    .subscribe(firstVisibleRow => this.firstVisibleRow = firstVisibleRow.toString());
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // Arrow function is required to give dataStore.getPagedData the correct 'this'
  protected getData = (rowsRange: RequestRowsRange, sorts?: FieldSortDefinition<DemoTableItem>[], filters?: FieldFilterDefinition<DemoTableItem>[]) => {
    const newPage = this.dataStore.getPagedData(rowsRange, sorts, filters);
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
        .map(row => row?.userId)
        .join('; ') || '-';
    }
    this.selectedRowsAsString = result;
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
      { columnId:'userId', direction:'asc' }
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

  /**
   * Event handler for the slide toggle setting the 'withFooter' property.
   * @param event - source and new value of the slide toggle
   */
  protected onWithFooterChanged(event: MatSlideToggleChange): void {
    this.withFooter = event.checked;
  }

  /**
   * Create a string representation of activated row.
   * @returns string with the userId of the activated row as string
   */
  private activatedRowToString(): string {
    if (this.table !== undefined) {
      return this.table.activatedRow?.userId.toString() || '-';
    } else {
      return '-';
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

  /**
   * Format a list of strings using a template string.
   * Usage: formatString('Hello {0}, your order {1} has been shipped.', 'John', 10001)
   * @param template - template string with placeholders in the form of {indexOfDataToInsert}
   * @param args - array of strings with data to insert into the template
   * @returns formatted string
   */
  private formatString(template: string, ...args: string[]) {
    return template.replace(/{([0-9]+)}/g, (match, index: number) => {
      return typeof args[index] === 'undefined' ? match : args[index];
    });
  }
}
