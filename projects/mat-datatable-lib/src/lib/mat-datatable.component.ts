import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable } from '@angular/material/table';

import {
  MatMultiSort,
  MatSortable,
  Sort,
  SortHeaderArrowPosition
} from '../directives/datatable-sort';
import { MatColumnDefinition } from '../interfaces/datatable-column-definition.interface';
import { MatDatatableDataSource } from '../interfaces/datatable-datasource.class';
import { MatSortDefinition, MatSortDefinitionPos } from '../interfaces/datatable-sort-definition.interface';

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
  @Output() sortChange = new EventEmitter<MatSortDefinitionPos[]>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatMultiSort) sort!: MatMultiSort;
  @ViewChild(MatTable) table!: MatTable<TRowData>;

  protected currentActivatedRow: TRowData | undefined;
  protected currentSelectedRows: TRowData[] = [];

 constructor(private cdr: ChangeDetectorRef) {
 }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.table.dataSource = this.dataSource;
      this.setAllSorts(this.sortFromDatasource());
      this.cdr.detectChanges();
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

  setAllSorts(matSortDefinitions: MatSortDefinition[]): void {
    const sortables: MatSortable[]= [];
    for (let i = 0; i < matSortDefinitions.length; i++) {
      const sortEntry = {
        id: matSortDefinitions[i].columnId,
        start: matSortDefinitions[i].direction,
        disableClear: this.sort.disableClear
      };
      sortables.push(sortEntry);
    }
    this.sort.setAllSorts(sortables);
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

  protected onMultiSortChanged(sortStates: Sort[]) {
    if (this.dataSource !== undefined) {
      this.dataSource.setSort(this.matSortDefinitionFromSortArray(sortStates));
      this.sortChange.emit(this.matSortDefinitionPosFromSortArray(sortStates));
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

  private matSortDefinitionPosFromSortArray(sorts: Sort[]): MatSortDefinitionPos[] {
    const result: MatSortDefinitionPos[] = [];
    for (let i = 0; i < sorts.length; i++) {
      const element: MatSortDefinitionPos = {
        columnId: sorts[i].active,
        direction: sorts[i].direction,
        position: i + 1
      };
      result.push(element);
    }
    return result;
  }
}
