import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { NgClass, NgFor, NgStyle, NgIf, AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TrackByFunction,
  ViewChild
} from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import {
  MatColumnDef,
  MatCell,
  MatCellDef,
  MatFooterCell,
  MatFooterCellDef,
  MatFooterRow,
  MatFooterRowDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import { Observable, Subject, takeUntil } from 'rxjs';

import { EmptyDataStoreProvider, TableVirtualScrollDataSource } from '../components/data-source.class';
import { MatDatatableHeaderAlignDirective } from '../directives/datatable-header-align.directive';
import { MatDatatableResizableDirective } from '../directives/datatable-resizable.directive';
import {
  MatMultiSort,
  Sort,
  SortHeaderArrowPosition
} from '../directives/datatable-sort';
import { MatMultiSortHeader } from '../directives/datatable-sort/mat-multi-sort-header.component';
import { TableItemSizeDirective } from '../directives/virtual-scroll/table-item-size.directive';
import { FieldSortDefinition, FieldFilterDefinition, DataStoreProvider } from '../interfaces/datastore-provider.interface';
import { ColumnAlignmentType, MatColumnDefinition } from '../interfaces/datatable-column-definition.interface';
import { MatSortDefinition } from '../interfaces/datatable-sort-definition.interface';

export type RowSelectionType = 'none' | 'single' | 'multi';

/**
 * Datatable component based on Angular Material.
 * @class MatDatatableComponent
 * @implements { AfterViewInit }
 * @template TRowData - type / interface definition for data of a single row
 */
@Component({
    selector: 'mat-datatable',
    templateUrl: './mat-datatable.component.html',
    styleUrls: [
        './mat-datatable.component.scss',
        '../directives/datatable-resizable.directive.scss'
    ],
    standalone: true,
    imports: [
      AsyncPipe,
      CdkVirtualScrollViewport,
      MatCell,
      MatCellDef,
      MatColumnDef,
      MatDatatableHeaderAlignDirective,
      MatDatatableResizableDirective,
      MatFooterCell,
      MatFooterCellDef,
      MatFooterRow,
      MatFooterRowDef,
      MatHeaderCell,
      MatHeaderCellDef,
      MatHeaderRow,
      MatHeaderRowDef,
      MatMultiSort,
      MatMultiSortHeader,
      MatProgressBar,
      MatRow,
      MatRowDef,
      MatTable,
      NgClass,
      NgFor,
      NgIf,
      NgStyle,
      TableItemSizeDirective
    ]
})
export class MatDatatableComponent<TRowData> implements AfterViewInit, OnChanges, OnDestroy, OnInit {
  @Input() columnDefinitions: MatColumnDefinition<TRowData>[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() rowSelectionMode: RowSelectionType = 'none';
  @Input() dataStoreProvider: DataStoreProvider<TRowData> = new EmptyDataStoreProvider<TRowData>;
  @Input()
  get trackBy(): TrackByFunction<TRowData> {
    return this._trackByFn;
  }
  set trackBy(fn: TrackByFunction<TRowData>) {
    if (fn && typeof fn === 'function') {
      this._trackByFn = fn;
    } else {
      this._trackByFn = this.defaultTrackBy;
    }
  }
  protected _trackByFn: TrackByFunction<TRowData> = this.defaultTrackBy;

  @Input() withFooter = false;
  @Output() rowClick = new EventEmitter<TRowData>();
  @Output() rowSelectionChange = new EventEmitter<TRowData[]>();
  @Output() sortChange = new EventEmitter<MatSortDefinition[]>();

  public firstVisibleIndexChanged!: Observable<number>;
  public totalRowsChanged!: Observable<number>;
  public filteredRowsChanged!: Observable<number>;

  @ViewChild(MatTable) protected table!: MatTable<TRowData>;
  @ViewChild(CdkVirtualScrollViewport) protected viewport!: CdkVirtualScrollViewport;
  @ViewChild(MatMultiSort) protected sort!: MatMultiSort;

  protected displayedFooterColumns: string[] = [];
  protected dataSource!: TableVirtualScrollDataSource<TRowData>;
  protected currentActivatedRow: TRowData | undefined;
  protected currentSelectedRows: TRowData[] = [];

  @ViewChild('tvs') private tvs!: TableItemSizeDirective<TRowData>;
  private readonly unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.dataSource = new TableVirtualScrollDataSource<TRowData>(this.dataStoreProvider);
  }

  ngAfterViewInit(): void {
    // Set DataStoreProvider to value defined in parent element
    this.dataSource.dataStoreProvider = this.dataStoreProvider;

    this.sort.multiSortChange
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((newSort: Sort[]) => {
        this.dataSource.sorts = this.requestSortDefinitionFromSortArray(newSort);

        // Scroll to start of list
        this.viewport.scrollToIndex(0);
      });

    this.firstVisibleIndexChanged = this.tvs.firstVisibleIndexChanged;
    this.totalRowsChanged = this.tvs.totalRowsChanged;
    this.filteredRowsChanged = this.tvs.filteredRowsChanged;
  }

  ngOnDestroy(): void {
    // clear row references
    this.currentSelectedRows = [];
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const displayedColumnsChanges = changes['displayedColumns'];
    if (this.withFooter && (displayedColumnsChanges !== undefined)) {
      if (Array.isArray(displayedColumnsChanges.currentValue)) {
        const displayedColumns = displayedColumnsChanges.currentValue as string[];
        this.displayedFooterColumns = this.footerColumnsFromColumns(displayedColumns);
      } else {
        console.error(`'displayedColumns' is not an array of strings ('${typeof displayedColumnsChanges.currentValue}')`);
      }

    }
  }

  /**
   * Property to be used to mark a single row  (e.g. to be used to
   * mark the "current" row, when returning from a detail view).
   */
  get activatedRow(): TRowData | undefined {
    return this.currentActivatedRow;
  }
  set activatedRow(newActiveRow: TRowData | undefined) {
    this.currentActivatedRow = newActiveRow;
  }

  get selectedRows(): TRowData[] {
    return this.currentSelectedRows;
  }
  set selectedRows(newSelection: TRowData[]) {
    if (Array.isArray(newSelection)) {
      if (newSelection.length === 0) {
        this.currentSelectedRows = newSelection;
        this.onRowSelectionChanged();
        return;
      }

      switch (this.rowSelectionMode) {
        case 'multi':
          this.currentSelectedRows = newSelection;
          break;
        case 'single':
          this.currentSelectedRows = [ newSelection[0] ];
          break;
        }
        this.onRowSelectionChanged();
    } else {
      throw new Error('\'newSelection\' must be an array.');
    }
  }

  get sortDefinitions(): MatSortDefinition[] {
    return this.matSortDefinitionFromSortArray(this.sort.sortDefinitions);
  }
  set sortDefinitions(matSortDefinitions: MatSortDefinition[]) {
    const sortables: Sort[] = [];
    for (let i = 0; i < matSortDefinitions.length; i++) {
      const sortEntry = {
        active: matSortDefinitions[i].columnId,
        direction: matSortDefinitions[i].direction
      };
      sortables.push(sortEntry);
    }
    this.sort.sortDefinitions = sortables;
  }

  get filterDefinitions() : FieldFilterDefinition<TRowData>[] {
    return this.dataSource.filters;
  }
  set filterDefinitions(newFilters : FieldFilterDefinition<TRowData>[]) {
    if (newFilters && Array.isArray(newFilters)) {
      this.dataSource.filters = newFilters;
    }
  }

  scrollToRow(row: TRowData) {
    if (row !== undefined) {
      this.dataSource.rowToIndex(row)
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(index => {
          const indexOfRow = Math.max(index, 0);
          this.viewport.scrollToIndex(indexOfRow);
        });
    }
  }

  reloadTable() {
    this.dataSource.reloadSizeOfDatastore();
  }

  /**
   * Gets 'ngStyle' property of table header cell.
   * This method creates the style to set the column width.
   * @param columnDefinition - object defining a table cell
   * @returns object with properties that reflect the css styles of the header cell
   */
  protected headerFormat(columnDefinition: MatColumnDefinition<TRowData>): Record<string, string> | undefined {
    let result: Record<string, string> | undefined;
    if (columnDefinition.width !== undefined) {
      result = {
        'width': columnDefinition.width
      };
    }

    return result;
  }

  /**
   * Gets 'ngStyle' property of table data cell.
   * This method creates the style for data cells according to the given definition.
   * @param columnDefinition - object defining a table cell
   * @returns object with properties that reflect the css styles of the data cell
   */
  protected columnFormat(columnDefinition: MatColumnDefinition<TRowData>): Record<string, string> | undefined {
    let result: Record<string, string> | undefined;
    if (columnDefinition.width !== undefined) {
      result = {
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap',
        'overflow':'hidden'
      };
    }

    if (columnDefinition.showAsSingleLine) {
      const singleLineResult = {
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap',
        'overflow':'hidden'
      };
      result = Object.assign({}, result, singleLineResult);
    }

    if (columnDefinition.cellAlignment !== undefined) {
      const alignmentResult: Record<string, string> = {};
      switch (columnDefinition.cellAlignment) {
        case 'left':
          alignmentResult['text-align'] = 'start';
          break;
        case 'center':
          alignmentResult['text-align'] = 'center';
          break;
        case 'right':
          alignmentResult['text-align'] = 'end';
          break;
      }
      result = Object.assign({}, result, alignmentResult);
    }

    return result;
  }

  /**
   * Gets 'ngStyle' property of table footer cell.
   * This method creates the style for footer cells according to the given definition.
   * @param footerCellAlignment - definition of the footer cell
   * @returns object with properties that reflect the css styles of the footer cell
   */
  protected footerColumnFormat(footerCellAlignment?: ColumnAlignmentType): Record<string, string> | undefined {
    const result: Record<string, string> = {};
    if (footerCellAlignment !== undefined) {
      switch (footerCellAlignment) {
        case 'left':
          result['text-align'] = 'start';
          break;
        case 'center':
          result['text-align'] = 'center';
          break;
        case 'right':
          result['text-align'] = 'end';
          break;
      }
    }

    return result;
  }

  protected sortArrowPosition(columnDefinition: MatColumnDefinition<TRowData>): SortHeaderArrowPosition {
    return columnDefinition.headerAlignment === 'right' ? 'before' : 'after';
  }

  protected onRowClicked(row: TRowData) {
    if (this.rowSelectionMode !== 'none') {
      if (!this.currentSelectedRows.includes(row)) {
        switch (this.rowSelectionMode) {
          case 'single':
            this.currentSelectedRows = [ row ];
            break;
          case 'multi':
            this.currentSelectedRows.push(row);
            break;
        }
        this.rowClick.emit(row);
        this.onRowSelectionChanged();
      } else {
        switch (this.rowSelectionMode) {
          case 'single':
            this.currentSelectedRows = [ ];
            break;
          case 'multi':
            this.currentSelectedRows = this.currentSelectedRows.filter(e => e !== row);
            break;
        }
        this.rowClick.emit(row);
        this.onRowSelectionChanged();
      }
    } else {
      this.rowClick.emit(row);
    }
  }

  protected onRowSelectionChanged() {
    this.rowSelectionChange.emit(this.currentSelectedRows);
  }

  protected onMultiSortChanged(sortStates: Sort[]) {
    this.sortChange.emit(this.matSortDefinitionFromSortArray(sortStates));
  }

  /**
   * Are 2 rows equal? Used by template to mark currentActivatedRow.
   * @param rowA - first row to compare
   * @param rowB - second row to compare
   * @returns true: rowA equals rowB
   */
  protected areRowsEqual(rowA: TRowData, rowB: TRowData): boolean {
    return this.trackBy(0, rowA) === this.trackBy(0, rowB);
  }

  /**
   *  Check, if the given row is part of the selectedRows.
   * @param row - row to be checked
   * @returns true = given row is part of the selectedRows
   */
  protected selectedRowsIncludes(row: TRowData): boolean {
    return this.selectedRows.some(selectedRow => this.areRowsEqual(row, selectedRow));
  }

  /**
   * Extract the list of footer columns to display from the
   * list of columns to display. The footer can have columns tha
   * span several columns; therefore we need a different list.
   * @param newDisplayedColumns - list of the id of the columns to display
   * @returns list of the id of the footer columns to display
   */
  private footerColumnsFromColumns(newDisplayedColumns: string[]) {
    const displayedFooterColumns: string[] = [];
    let i = 0;
    const numberOfColumns = newDisplayedColumns.length;
    while (i < numberOfColumns) {
      displayedFooterColumns.push(newDisplayedColumns[i]);

      // Do we have a footer columnSpan for this column?
      const columnDefinition = this.columnDefinitions.find(element => element.columnId === newDisplayedColumns[i]);
      if (columnDefinition !== undefined) {
        const colSpan = columnDefinition.footerColumnSpan;
        if ((colSpan !== undefined) && Number.isInteger(colSpan) && (colSpan > 1)) {
          i += colSpan;
        } else {
          i++;
        }
      } else {
        console.error(`Column to display ('${newDisplayedColumns[i]}') has no column definition`);
        i++;
      }
    }
    return displayedFooterColumns;
  }

  /**
   * Convert an array of type Sort[] to an array of type RequestSortDataList[]
   * used in class PaginationDataSource.
   * @param sorts - sorting definition to convert
   * @returns sorting definition as array of type RequestSortDataList
   */
  private requestSortDefinitionFromSortArray(sorts: Sort[]): FieldSortDefinition<TRowData>[] {
    const result: FieldSortDefinition<TRowData>[] = [];
    for (let i = 0; i < sorts.length; i++) {
      const element: FieldSortDefinition<TRowData> = {
        fieldName: sorts[i].active as keyof TRowData,
        sortDirection: sorts[i].direction
      };
      result.push(element);
    }
    return result;
  }

  /**
   * Convert an array of type Sort[] to an array of type MatSortDefinition[].
   * @param sorts - sorting definition to convert
   * @returns sorting definition as array of type MatSortDefinition
   */
  private matSortDefinitionFromSortArray(sorts: Sort[]): MatSortDefinition[] {
    const result: MatSortDefinition[] = [];
    for (let i = 0; i < sorts.length; i++) {
      const element: MatSortDefinition = {
        columnId: sorts[i].active,
        direction: sorts[i].direction
      };
      result.push(element);
    }
    return result;
  }

  /**
   * Default implementation of trackBy function.
   * This function is required, as in strict mode 'trackBy'
   * must not be undefined.
   * @param this - required by eslint rule "typescript-eslint/unbound-method"
   * @param index - index of the row
   * @param item - object with the row data
   * @returns stringified content of the item
   */
  private defaultTrackBy(this: void, index: number, item: TRowData): string {
    return JSON.stringify(item);
  }
}
