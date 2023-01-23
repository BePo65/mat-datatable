import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';

import { MatColumnDefinition } from '../interfaces/datatable-column-definition.interface';
import { MatDatatableDataSource } from '../interfaces/datatable-datasource.class';

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

  constructor() {
    // no initialization needed
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.table.dataSource = this.dataSource;
    }
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
