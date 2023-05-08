import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';

/**
 * DataSource without CollectionViewer.
 * @augments {DataSource<T>}
 * @template T - Type of a single data object in the list of data objects.
 */
export interface SimpleDataSource<T> extends DataSource<T> {
  connect(): Observable<T[]>;
  disconnect(): void;
}
