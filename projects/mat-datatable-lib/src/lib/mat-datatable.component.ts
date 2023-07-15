import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { MatTable } from '@angular/material/table';
import { of as observableOf, Subject, takeUntil } from 'rxjs';

import { TableVirtualScrollDataSource } from '../components/data-source.class';
import {
  MatMultiSort,
  Sort,
  SortHeaderArrowPosition
} from '../directives/datatable-sort';
import { DatasourceEndpoint, Page, FieldSortDefinition } from '../interfaces/datasource-endpoint.interface';
import { MatColumnDefinition } from '../interfaces/datatable-column-definition.interface';
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
  ]
})
export class MatDatatableComponent<TRowData> implements AfterViewInit, OnDestroy, OnInit {
  @Input() columnDefinitions: MatColumnDefinition<TRowData>[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() rowSelectionMode: RowSelectionType = 'none';
  @Input() datastoreGetter: DatasourceEndpoint<TRowData> = emptyDatastoreGetter;
  @Output() rowClick = new EventEmitter<TRowData>();
  @Output() rowSelectionChange = new EventEmitter<TRowData[]>();
  @Output() sortChange = new EventEmitter<MatSortDefinition[]>();
  @ViewChild(MatTable) table!: MatTable<TRowData>;
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;
  @ViewChild(MatMultiSort) sort!: MatMultiSort;

  protected dataSource!: TableVirtualScrollDataSource<TRowData>;
  protected currentActivatedRow: TRowData | undefined;
  protected currentSelectedRows: TRowData[] = [];

  private readonly unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.dataSource = new TableVirtualScrollDataSource<TRowData>(this.datastoreGetter);
  }

  ngAfterViewInit(): void {
    this.dataSource.endpoint = this.datastoreGetter;

    this.sort.multiSortChange
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((newSort: Sort[]) => {
        this.dataSource.sorts = this.requestSortDefinitionFromSortArray(newSort);

        // Scroll to start of list
        this.viewport.scrollToIndex(0);
      });
    }

  ngOnDestroy(): void {
    // clear row references
    this.currentSelectedRows = [];
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
}

  /**
   * Default implementation of the datastoreGetter input variable
   * returning an observable that emits a Page with no data rows.
   * @returns observable that emits a single empty Page
   */
  const emptyDatastoreGetter = <T>() => {
    return observableOf({
    content: [] as T[],
    startRowIndex: 0,
    returnedElements: 0,
    totalElements: 0
  } as Page<T>);
};
