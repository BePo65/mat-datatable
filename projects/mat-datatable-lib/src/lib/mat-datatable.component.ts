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
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTable } from '@angular/material/table';
import { of as observableOf, Subject, takeUntil } from 'rxjs';

import { PaginationDataSource } from '../components/dataSource.class';
import {
  MatMultiSort,
  Sort,
  SortHeaderArrowPosition
} from '../directives/datatable-sort';
import { DatasourceEndpoint, Page, RequestSortDataList } from '../interfaces/datasource-endpoint.interface';
import { MatColumnDefinition } from '../interfaces/datatable-column-definition.interface';
import { MatSortDefinition } from '../interfaces/datatable-sort-definition.interface';

export type RowSelectionType = 'none' | 'single' | 'multi';

/**
 * Datatable component based on Angular Material.
 * @class MatDatatableComponent
 * @implements {AfterViewInit}
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
export class MatDatatableComponent<TRowData, TListFilter> implements AfterViewInit, OnDestroy, OnInit {
  @Input() columnDefinitions: MatColumnDefinition<TRowData>[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() rowSelectionMode: RowSelectionType = 'none';
  @Input() datastoreGetter: DatasourceEndpoint<TRowData, TListFilter> = emptyDatastoreGetter;
  @Output() rowClick = new EventEmitter<TRowData>();
  @Output() sortChange = new EventEmitter<MatSortDefinition[]>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @ViewChild(MatTable) table!: MatTable<TRowData>;
  @ViewChild(MatMultiSort) sort!: MatMultiSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  protected dataSource!: PaginationDataSource<TRowData, TListFilter>;
  protected currentActivatedRow: TRowData | undefined;
  protected currentSelectedRows: TRowData[] = [];

  private readonly unsubscribe$ = new Subject<void>();

  constructor() {
    // TODO do we need injected parameters?
  }

  ngOnInit(): void {
    this.dataSource = new PaginationDataSource<TRowData, TListFilter>(
      this.datastoreGetter
    );
  }

  ngAfterViewInit(): void {
    this.dataSource.endpoint = this.datastoreGetter;

    this.sort.multiSortChange
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((newSort: Sort[]) => {
        // reset the paginator after changing the sort definition
        this.paginator.pageIndex = 0;
        this.getPageFromDataSource(newSort, this.paginator);
      });

    this.paginator.page
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(newPage => {
        this.getPageFromDataSource(this.sort.sortDefinitions, newPage);
        this.onPageSizeChange(newPage.pageSize);
      });

    setTimeout(() => {
      this.getPageFromDataSource(this.sort.sortDefinitions, this.paginator);
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

  get pageSize(): number {
    return this.paginator.pageSize;
  }
  set pageSize(newPageSize: number) {
    this.paginator.pageSize = +newPageSize;
    this.paginator._changePageSize(+newPageSize);
  }

  protected headerFormat(columnDefinition: MatColumnDefinition<TRowData>): Record<string, string> | undefined {
    let result: Record<string, string> | undefined;
    if (columnDefinition.width !== undefined) {
      result = {
        'width': columnDefinition.width
      };
    }

    return result;
  }

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
      }
    } else {
      this.rowClick.emit(row);
    }
  }

  protected onMultiSortChanged(sortStates: Sort[]) {
    this.sortChange.emit(this.matSortDefinitionFromSortArray(sortStates));
  }

  protected onPageSizeChange(pageSize: number) {
    this.pageSizeChange.emit(pageSize);
  }

  /**
   * Requests a new page from the datasource.
   * @param newSort - sorting definition to be used
   * @param newPage - definition of the page to be fetched
   */
  private getPageFromDataSource(newSort: Sort[], newPage: PageEvent) {
    const sortFormatted = this.requestSortDefinitionFromSortArray(newSort);
    // TODO add filter
    this.dataSource.loadPage(newPage.pageIndex, newPage.pageSize, sortFormatted);
  }

  /**
   * Convert an array of type Sort[] to an array of type RequestSortDataList[]
   * used in class PaginationDataSource.
   * @param sorts - sorting definition to convert
   * @returns sorting definition as array of type RequestSortDataList
   */
  private requestSortDefinitionFromSortArray(sorts: Sort[]): RequestSortDataList<TRowData>[] {
    const result: RequestSortDataList<TRowData>[] = [];
    for (let i = 0; i < sorts.length; i++) {
      const element: RequestSortDataList<TRowData> = {
        fieldName: sorts[i].active as keyof TRowData,
        order: sorts[i].direction
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
    pageNumber: 0,
    returnedElements: 0,
    totalElements: 0
  } as Page<T>);
};
