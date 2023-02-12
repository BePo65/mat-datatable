import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable, Sort, SortHeaderArrowPosition  } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';

import { MatColumnDefinition } from '../interfaces/datatable-column-definition.interface';
import { MatDatatableDataSource } from '../interfaces/datatable-datasource.class';
import { MatSortDefinition } from '../interfaces/datatable-sort-definition.interface';

export type RowSelectionType = 'none' | 'single' | 'multi';

/**
 * Datatable component based on Angular Material.
 *
 * @class MatDatatableComponent
 * @implements {AfterViewInit}
 * @template TRowData - type / interface definition for data of a single row
 */
@Component({
  selector: 'mat-datatable',
  templateUrl: './mat-datatable.component.html',
  styleUrls: ['./mat-datatable.component.scss']
})
export class MatDatatableComponent<TRowData> implements AfterViewInit, OnDestroy {
  @Input() dataSource?: MatDatatableDataSource<TRowData>;
  @Input() columnDefinitions: MatColumnDefinition<TRowData>[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() rowSelectionMode: RowSelectionType = 'none';
  @Output() rowClick = new EventEmitter<TRowData>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<TRowData>;

  protected currentActivatedRow: TRowData | undefined;
  protected currentSelectedRows: TRowData[] = [];

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.table.dataSource = this.dataSource;
      const currentSort = this.sortFromDatasource();
      if (currentSort.length > 0) {
        this.setSort(currentSort);
        this.cdr.detectChanges();
      }
    }
  }

  ngOnDestroy(): void {
    // clear row references
    this.currentSelectedRows = [];
  }

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

  /**
   * Sets the sorting of the table.
   * Emits an event to update the datasource.
   *
   * @param newSort - definition of the new sorting
   */
  setSort(newSort: MatSortDefinition[]) {
    const noSort: MatSortable = {
      id: '',
      start: '',
      disableClear: false
    };

    if (newSort.length > 0) {
      // TODO sort by more than 1 column
      // HACK Cannot set sorting direction, but only start of direction cycle.
      // Calling 'sort' with the same id, multiple times will cycle direction
      // beginning with direction given in the first call, no matter what
      // direction is given afterwards.
      // Negative effect: data is fetched twice!
      this.sort.sort(noSort);
      this.sort.sort({
        id: newSort[0].columnId,
        start: newSort[0].direction,
        disableClear: false
      });
    } else {
      this.sort.sort(noSort);
    }
  }

  protected headerFormat(columnDefinition: MatColumnDefinition<TRowData>): Record<string, string> | undefined {
    let result: Record<string, string> | undefined;
    if (columnDefinition.width !== undefined) {
      result = {
        'width': columnDefinition.width,
        'max-width': columnDefinition.width
      };
    }

    return result;
  }

  protected columnFormat(columnDefinition: MatColumnDefinition<TRowData>): Record<string, string> | undefined {
    let result: Record<string, string> | undefined;
    if (columnDefinition.width !== undefined) {
      result = {
        'width': columnDefinition.width,
        'max-width': columnDefinition.width,
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

  protected onRowClick(row: TRowData) {
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
        setTimeout(() => this.rowClick.emit(row), 0);
      } else {
        switch (this.rowSelectionMode) {
          case 'single':
            this.currentSelectedRows = [ ];
            break;
          case 'multi':
            this.currentSelectedRows = this.currentSelectedRows.filter(e => e !== row);
            break;
        }
      }
    } else {
      this.rowClick.emit(row);
    }
  }

  protected onSortChanged(sortState: Sort) {
    if (this.dataSource !== undefined) {
      // TODO sort by more than 1 column
      const newSort: MatSortDefinition[] = [
        {
          columnId: sortState.active,
          direction: sortState.direction
        }
      ];
      this.dataSource.setSort(newSort);
    }
  }

  /**
   * Gets the current sorting definition from the datasource
   *
   * @returns current sorting definition or an empty array (no sorting)
   */
  private sortFromDatasource(): MatSortDefinition[] {
    return this.dataSource?.getSort() || [];
  }
}
