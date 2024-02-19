import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BehaviorSubject, delay, Subject, takeUntil } from 'rxjs';

import { DemoTableDataStore } from '../datasource/demo-table-datastore.class';

import { DemoTableItem } from './shared/demo-table-item.interface';

import {
  MatColumnDefinition,
  MatDatatableComponent,
  MatSortDefinition,
  RowSelectionType
} from 'projects/mat-datatable-lib/src';
import { FieldFilterDefinition } from 'projects/mat-datatable-lib/src/interfaces/datastore-provider.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('datatable') table!: MatDatatableComponent<DemoTableItem>;

  title = 'Mat-Datatable-Demo';

  protected dataStore = new DemoTableDataStore<DemoTableItem>(this.trackBy);
  protected columnDefinitions: MatColumnDefinition<DemoTableItem>[] = [
    {
      columnId: 'userId',
      header: 'ID',
      cell: (row: DemoTableItem) => row?.userId?.toString(),
      headerAlignment: 'right',
      cellAlignment: 'right',
      width: '5em',
      footer: '0 / 0',
      footerColumnSpan: 2
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
      width: '10em',
      footer: 'Filter: -',
      footerColumnSpan: 3
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
      footer: 'First visible row: -',
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
  protected currentFilterAsString = '-';
  protected currentPageSize$ = new BehaviorSubject('');
  protected numberOfRows = '-';
  protected numberOfFilteredRows = '-';
  protected firstVisibleRow = '-';

  private currentLocale = 'en-US';
  private headers: Record<string, string> = {};
  private readonly unsubscribe$ = new Subject<void>();
  private formattedDatastoreLengths = 'filtered {0} / total {1}';
  private formattedFirstVisibleRow = 'First visible row: {0}';

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
    .subscribe(firstVisibleRow => {
      this.firstVisibleRow = firstVisibleRow.toString();
      this.columnDefinitions[5].footer = this.formatString(this.formattedFirstVisibleRow, this.firstVisibleRow.toString());
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  protected trackBy(this: void, index: number, item: DemoTableItem) {
    return item?.userId ?? -1;
  }

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

  /**
   * Event handler for the slide toggle setting the 'withFooter' property.
   * @param event - source and new value of the slide toggle
   */
  protected onWithFooterChanged(event: MatSlideToggleChange): void {
    this.withFooter = event.checked;
    this.onClearSort();
    this.onClearSelection();
    this.onClearActivated();
    this.onClearFilter();
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

  // Demo to show setting activated rows by code
  protected onSetActivated(rowId: number) {
    const activatedRow = this.selectSingleRowByUserId(rowId);
    this.table.activatedRow = activatedRow;
    this.activatedRowAsString = this.activatedRowToString();
  }
  protected onClearActivated() {
    this.table.activatedRow = undefined;
    this.activatedRowAsString = '-';
  }

  // Demo to show setting selected rows by code
  protected onSetSelection() {
    this.table.selectedRows = this.selectRowsByUserId([ 1, 3, 66 ]);
  }
  protected onClearSelection() {
    this.table.selectedRows = [];
  }

  // Demo of scrollToRów
  protected onScrollIntoView(rowId?: number) {
    // row.userId or rowId are used, as 'trackBy' uses 'userId' as reference
    const rowToScrollTo = this.dataStore.getUnsortedData().find(row => row.userId === rowId);
    if (rowToScrollTo) {
      this.table.scrollToRow(rowToScrollTo);
    }
  }

  // Demo to show filtering by code
  protected onFilterByValue() {
    const currentFilter = [{ fieldName:'lastName', value:'Abbott' }] as FieldFilterDefinition<DemoTableItem>[];
    this.table.filterDefinitions = currentFilter;
    this.currentFilterAsString = this.filterDefinitionToString(currentFilter);
    this.columnDefinitions[2].footer = `Filter: ${this.currentFilterAsString}`;
  }
  protected onFilterByRange() {
    const currentFilter = [{ fieldName:'userId', valueFrom:50, valueTo:67 }] as FieldFilterDefinition<DemoTableItem>[];
    this.table.filterDefinitions = currentFilter;
    this.currentFilterAsString = this.filterDefinitionToString(currentFilter);
    this.columnDefinitions[2].footer = `Filter: ${this.currentFilterAsString}`;
  }
  protected onClearFilter() {
    const currentFilter = []  as FieldFilterDefinition<DemoTableItem>[];
    this.table.filterDefinitions = currentFilter;
    this.currentFilterAsString = this.filterDefinitionToString(currentFilter);
    this.columnDefinitions[2].footer = `Filter: ${this.currentFilterAsString}`;
  }

  // Demo of changing data store
  protected onAddData() {
    // TODO add data
  }
  protected onDeleteData() {
    // TODO delete data
  }
  protected onResetData() {
    // TODO reset set to original data
  }

  /**
   * Get row from raw data selected by its userId column.
   * @param rowId - userId of the row to select
   * @returns row selected by the given userId
   */
  private selectSingleRowByUserId(rowId: number) {
    return this.dataStore.getUnsortedData().find(row => row.userId === rowId);
  }

  /**
   * Get an array of rows from raw data selected by its userId column.
   * @param rowIds - array of userId's of the rows to select
   * @returns row selected by the given userId
   */
  private selectRowsByUserId(rowIds: number[]): DemoTableItem[] {
    let result: DemoTableItem[] = [];
    if (rowIds && Array.isArray(rowIds) && (rowIds.length > 0)) {
      result = this.dataStore.getUnsortedData().filter(row => rowIds.includes(row.userId));
    }
    return result;
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

  /**
   * Format filter definitions as string.
   * Only the first entry is converted.
   * @param filterDefinition - array with filter definitions
   * @returns filter definition, formatted string
   */
  private filterDefinitionToString(filterDefinition: FieldFilterDefinition<DemoTableItem>[]): string {
    let filterAsString = '-';
    if(filterDefinition && Array.isArray(filterDefinition) && (filterDefinition.length > 0)) {
      const filter = filterDefinition[0];
      if (filter.value !== undefined) {
        filterAsString = `'${filter.fieldName}' = '${filter.value.toString()}' `;
      } else  if (filter.valueFrom !== undefined) {
        filterAsString = `'${filter.fieldName}' = ${filter.valueFrom.toString()}-${filter.valueTo.toString()}`;
      }
    }

    return filterAsString;
  }
}
