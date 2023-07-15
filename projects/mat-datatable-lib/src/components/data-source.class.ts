import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { map, take, takeUntil, filter, switchMap, tap } from 'rxjs/operators';

import { DatasourceEndpoint, Page, RequestRowsRange, FieldSortDefinition, FieldFilterDefinition } from '../interfaces/datasource-endpoint.interface';

export interface TableVirtualScrollDataStoreSizes {
  totalElements: number
  totalFilteredElements: number
}

export interface TVSDataSource {
  /**
   * Attach a TableItemSizeDirective to the DataSource.
   * The returned observable emits the absolute and the filtered size of the content of the
   * data store to the virtual scroller e.g. after sorting or filtering of data or with
   * manual trigger (when the data store content size changed).
   * @param rangeToDisplay$ - Observable emitting objects defining the rows required by the TableItemSizeDirective
   * @returns Observable emitting the absolute and the filtered size of the content of the data store
   */
  attachVirtualScroller(rangeToDisplay$: Observable<RequestRowsRange>): Observable<TableVirtualScrollDataStoreSizes>;
}

/**
 * Check, if a given object is of type TableVirtualScrollDataSource.
 * @param dataSource - object under inspection
 * @returns true, if dataSource is of type TableVirtualScrollDataSource
 */
export const isTVSDataSource = (dataSource: unknown): dataSource is TVSDataSource =>
  dataSource instanceof TableVirtualScrollDataSource;

export class TableVirtualScrollDataSource<T> extends DataSource<T> implements TVSDataSource {
  /** Stream that gets the range of rows to display from the TableItemSizeDirective. */
  private rangeToDisplay$: Subject<RequestRowsRange> | undefined;

  /** Subscription to the stream of ranges that the virtual scroller emits to update the table rendered rows. */
  private rangeToDisplaySubscription: Subscription | null = null;

  /** Stream that emits when the rangeToDisplay$ gets changed */
  private readonly rangeToDisplayChanges$ = new Subject<void>();

  /** Stream that emits when the number of the entries in the data source changes (e.g. by filtering or adding/deleting data). */
  private readonly dataStoreSizes$ = new BehaviorSubject<TableVirtualScrollDataStoreSizes>({ totalElements: 0, totalFilteredElements: 0 });

  /** Stream that emits to request the number of entries the data source. */
  private readonly requestDataStoreSizes$ = new Subject<void>();

  /** Stream emitting render data to the table (depends on ordered data changes). */
  private readonly renderData = new BehaviorSubject<T[]>([]);

  /** Is this DataStore connected to a table? */
  private isConnectedToTable = false;

  /** maximum number of rows available in data store after filtering */
  private filteredSizeOfDataStore = 0;

  private requestForSizesOnly: RequestRowsRange = { startRowIndex: 0, numberOfRows: 0 };

  /** Last rows requested by virtual scroller */
  private lastRangeToDisplay = this.requestForSizesOnly;
  private lastRowsContent: T[] = [];

  // Unsubscribe pattern
  private readonly unsubscribe$ = new Subject<void>();

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // eslint-disable-next-line jsdoc/require-returns
  /** Sort definition for this datasource */
  public get sorts(): FieldSortDefinition<T>[] {
    return this._sorts;
  }
  public set sorts(newSorts: FieldSortDefinition<T>[]) {
    this._sorts = newSorts;
    this.reloadSizeOfDatastore();
  }
  private _sorts: FieldSortDefinition<T>[] = [];

  // eslint-disable-next-line jsdoc/require-returns
  /** Filter definition for this datasource */
  public get filters(): FieldFilterDefinition<T>[] {
    return this._filters;
  }
  public set filters(newFilters: FieldFilterDefinition<T>[]) {
    this._filters = newFilters;
    this.reloadSizeOfDatastore();
  }
  private _filters: FieldFilterDefinition<T>[] = [];

  get endpoint(): DatasourceEndpoint<T> {
    return this._endpoint;
  }
  set endpoint(newEndpoint: DatasourceEndpoint<T>) {
    this._endpoint = newEndpoint;
    this.reloadSizeOfDatastore();
  }
  private _endpoint!: DatasourceEndpoint<T>;

  constructor(
    private datastoreEndpoint?: DatasourceEndpoint<T>
    ) {
    super();

    // default implementation is set here; given parameter 'datastoreEndpoint'
    // is handled at the end of the constructor
    this.endpoint = this._emptyDatasourceEndpoint<T>;

    // Get the number of rows in the data store;
    // no input value from requestDataStoreSizes$.next' is required
    this.requestDataStoreSizes$
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap(() => this.endpoint(this.requestForSizesOnly, this.sorts, this.filters)
          .pipe(
            take(1),
            map((page: Page<T>) => {
              return {
                totalElements: page.totalElements,
                totalFilteredElements: page.totalFilteredElements
              } as TableVirtualScrollDataStoreSizes;
            })
          )
        )
      )
      .subscribe(
        sizes => {
          this.filteredSizeOfDataStore = sizes.totalFilteredElements;
          this.dataStoreSizes$.next(sizes);
        }
      );

    if (this.datastoreEndpoint !== undefined) {
      this.endpoint = this.datastoreEndpoint;
    }
  }

  /**
   * Used by the MatTable. Called when it connects to the data source.
   * @returns stream that emits array to be rendered by material table
   */
  connect() {
    this.isConnectedToTable = true;
    return this.renderData;
  }

  /**
   * Used by the MatTable. Called when it disconnects from the data source.
   */
  disconnect() {
    this.loadingSubject.complete();

    // stop sending values to virtual scroller and table
    this.isConnectedToTable = false;
  }

  /**
   * Attach TableItemSizeDirective to this DataSource.
   * @param rangeToDisplay - observable emitting range of rows to display
   * @returns observable emitting size of data store
   */
  attachVirtualScroller(rangeToDisplay: Subject<RequestRowsRange>): Observable<TableVirtualScrollDataStoreSizes> {
    this.rangeToDisplay$ = rangeToDisplay;
    this.rangeToDisplayChanges$.next();
    this._updateRangeToDisplaySubscription();
    return this.dataStoreSizes$.asObservable();
  }

  /**
   * Reload the size of the datastore.
   */
  reloadSizeOfDatastore() {
    this.requestDataStoreSizes$.next();
  }

  /**
   * Attach the handlers to the stream of row ranges to display, emitted
   * by the virtual scroller.
   */
  private _updateRangeToDisplaySubscription() {
    // Replace all subscriptions to _renderChangesSubscription with new ones
    this.rangeToDisplaySubscription?.unsubscribe();
    this.rangeToDisplaySubscription = new Subscription();

    if (this.rangeToDisplay$ === undefined) {
      return;
    }

    // Send preliminary data evaluated from last list of rows to table to
    // satisfy virtual scroller.
    this.rangeToDisplaySubscription.add(
    this.rangeToDisplay$
      .pipe(
        takeUntil(this.unsubscribe$),
        takeUntil(this.rangeToDisplayChanges$),
        filter(() => this.isConnectedToTable)
      )
      .subscribe(range => {
        const preliminaryData = this.preliminaryRowsToDisplay(range);
        this.renderData.next(preliminaryData);
      })
    );

    // Emit rows from data source to table
    this.rangeToDisplaySubscription.add(
    this.rangeToDisplay$
      .pipe(
        takeUntil(this.unsubscribe$),
        takeUntil(this.rangeToDisplayChanges$),
        filter(() => this.isConnectedToTable),
        tap(() => {
          // used to avoid "ExpressionChangedAfterItHasBeenCheckedError"
          setTimeout(() => this.loadingSubject.next(true), 0);
        }),
        switchMap(range => this.endpoint(range, this.sorts, this.filters)
          .pipe(
            take(1),
            tap(() => this.loadingSubject.next(false))
          )
        )
      )
      .subscribe(page => {
          this.renderData.next(page.content);
          this.lastRangeToDisplay = {
            startRowIndex: page.startRowIndex,
            numberOfRows: page.returnedElements
          } as RequestRowsRange;
          this.lastRowsContent = page.content;

          if (this.datastoreSizesChanged(page)) {
            this.dataStoreSizes$.next({
              totalElements: page.totalElements,
              totalFilteredElements: page.totalFilteredElements
            });
          }
        }
      )
    );
  }

  /**
   * Generate a preliminary representation of the next range of rows
   * to display. Used to update display immediately after scrolling,
   * even when the data from the data store is not yet available.
   * As the virtual scroller requests rows beyond the size of the
   * data store content, we have to limit the output to the maximum
   * number of rows available after filtering.
   * @param range - range of rows to scroll to
   * @returns array with preliminary row content
   */
  private preliminaryRowsToDisplay(range: RequestRowsRange): T[] {
    let result: T[] = [];
    if (range.numberOfRows === 0) {
      return [];
    }

    const lastRange = this.lastRangeToDisplay;
    const oldContentLength = this.lastRowsContent.length;
    const offset = Math.abs(range.startRowIndex - lastRange.startRowIndex);

    if (range.startRowIndex >= lastRange.startRowIndex) {
      const copyLength = Math.max(Math.min(oldContentLength - offset, range.numberOfRows), 0);
      const copyEndIndex = offset + copyLength;
      // handle case, when we request data beyond the end of the datastore
      // TODO should we better use sizeOfDatastore instead of 0?
      const filteredSizeOfDataStore= this.filteredSizeOfDataStore || 0;
      const numberOfExcessRows =  Math.max((range.startRowIndex + range.numberOfRows) - filteredSizeOfDataStore, 0);
      const emptyRowsToAdd = Math.max(range.numberOfRows - copyLength - numberOfExcessRows, 0);
      result = this.lastRowsContent.slice(offset, copyEndIndex)
        .concat(Array(emptyRowsToAdd));
    } else {
      // we take only rows that overlap between the lastRange and the requested range
      const copyLength = Math.max(Math.min(oldContentLength - offset, range.startRowIndex + range.numberOfRows - lastRange.startRowIndex), 0);
      const copyEndIndex = copyLength;
      result = Array<T>(Math.min(offset, range.numberOfRows))
        .concat(this.lastRowsContent.slice(0, copyEndIndex));
    }
    return result;
  }

  /**
   * Did the size of the datastore change since the last request?
   * @param page - Page object returned from datastore
   * @returns true, if the totalElements or the totalFilteredElements changed
   */
  private datastoreSizesChanged(page: Page<T>): boolean {
    return (page.totalElements !== this.dataStoreSizes$.value.totalElements) ||
    (page.totalFilteredElements !== this.dataStoreSizes$.value.totalFilteredElements);
  }

  /**
   * Default implementation for the data source endpoint property,
   * returning an observable that emits a Page with no data rows.
   * @param rowsRange - range of data to fetch (unused, as this implementation simulates an empty datastore)
   * @returns observable that synchronously emits a single empty Page
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _emptyDatasourceEndpoint<T>(this: void, rowsRange: RequestRowsRange) {
    return of(
      {
        content: [] as T[],
        startRowIndex: 0,
        returnedElements: 0,
        totalElements: 0,
        totalFilteredElements: 0
      } as Page<T>);
  }
}
