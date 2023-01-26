import { AfterViewInit, ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort  } from '@angular/material/sort';
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
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<TRowData>;

  constructor(private cdr: ChangeDetectorRef) {
    // no initialization needed
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.table.dataSource = this.dataSource;
      const currentSort = this.initialSort();
      this.setSort(currentSort);
      this.cdr.detectChanges();
    }
  }

  // TODO rename function; refactor sorting as function of datasource
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      console.log(`Sorted for column ${sortState.active} ${sortState.direction}ending`);
    } else {
      console.log('Sorting cleared');
    }
  }

  /**
   * Sets the sorting of the table.
   * Emits an event to update the datasource.
   *
   * @param currentSort - definition of the sorting
   */
  setSort(currentSort: MatSortDefinition[]) {
    if (currentSort.length > 0) {
      // TODO sort by more than 1 column
      this.sort.sort({
        id: currentSort[0].columnId,
        start: currentSort[0].direction,
        disableClear: false
      });
    }
    // TODO what to do, if array is empty? Clear soring display?!
  }

  // TODO get the current sorting definition from the datasource
  private initialSort(): MatSortDefinition[] {
    return [
      { columnId: 'id', direction: 'asc' }
    ];
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
