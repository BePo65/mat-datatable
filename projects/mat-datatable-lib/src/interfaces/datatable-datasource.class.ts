import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export abstract class MatDatatableDataSource<T> extends DataSource<T> {
  data: T[] = [];
  paginator: MatPaginator | undefined;
  sort: MatSort | undefined;
}
