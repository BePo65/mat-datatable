import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable, Sort  } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';

import { MatColumnDefinition } from '../interfaces/datatable-column-definition.interface';
import { MatDatatableDataSource } from '../interfaces/datatable-datasource.class';
import { MatSortDefinition } from '../interfaces/datatable-sort-definition.interface';

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
export class MatDatatableComponent<TRowData> implements AfterViewInit {
  @Input() dataSource?: MatDatatableDataSource<TRowData>;
  @Input() columnDefinitions: MatColumnDefinition<TRowData>[] = [];
  @Input() displayedColumns: string[] = [];
  @Output() rowClick = new EventEmitter<TRowData>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<TRowData>;

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

  protected onRowClick(row: TRowData) {
    this.rowClick.emit(row);
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

    return result;
  }
}
