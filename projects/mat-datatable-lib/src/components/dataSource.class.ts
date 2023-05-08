import { BehaviorSubject, defer, Observable, Subject } from 'rxjs';
import { switchMap, startWith, map, shareReplay, tap, finalize, combineLatestWith } from 'rxjs/operators';

import { Page, RequestSortOfList, DatasourceEndpoint } from '../interfaces/datasource-endpoint.interface';
import { SimpleDataSource } from '../interfaces/simple-datasource.interface';

/**
 * RXJS operator that emits 'true' on the given 'indicator' Subject,
 * when the source observable emits a value.
 * Emits 'false' again, when the source observable completes or errors.
 * @param indicator - Subject to send boolean values to.
 * @returns clone of the source observable for any subscribed observer.
 */
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function indicate<T>(indicator: Subject<boolean>): (source: Observable<T>) => Observable<T> {
  return (source: Observable<T>) => source.pipe(
    s => defer(() => {
      indicator.next(true);
      return s;
    }),
    finalize(() => indicator.next(false))
  );
}

export class PaginationDataSource<T, Q = Partial<T>> implements SimpleDataSource<T> {
  public loading$: Observable<boolean>;
  public page$: Observable<Page<T>>;

  // TODO change to type rowsRange
  private readonly pageNumber = new Subject<number>();
  private readonly sorts: BehaviorSubject<RequestSortOfList<T>[]>;
  private readonly filter: BehaviorSubject<Q>;
  private readonly loading = new Subject<boolean>();

  constructor(
    private endpoint: DatasourceEndpoint<T, Q>,
    initialSorts: RequestSortOfList<T>[],
    initialQuery: Q,
    public pageSize = 20, // TODO do we need this, if any request will contain the numberOfRows?
    public initialRow = 0
  ) {
    let firstCall = true;
    this.sorts = new BehaviorSubject<RequestSortOfList<T>[]>(initialSorts);
    this.filter = new BehaviorSubject<Q>(initialQuery);
    const param$ = this.sorts.pipe(combineLatestWith(this.filter));
    this.loading$ = this.loading.asObservable();
    this.page$ = param$.pipe(
      switchMap(([sort, filter]) => this.pageNumber.pipe(
        startWith(initialRow && firstCall ? initialRow : 0),
        tap(() => firstCall = false),
        switchMap(page => this.endpoint({ page, numberOfRows: this.pageSize }, sort, filter)
          .pipe(indicate(this.loading))
        )
      )),
      shareReplay(1)
    );
  }

  /**
   * Set new sorting definition.
   * @param sorts - new sorting definition.
   */
  sortBy(sorts: RequestSortOfList<T>[]): void {
    this.sorts.next(structuredClone(sorts));
  }

  queryBy(query: Partial<Q>): void {
    const lastQuery = this.filter.getValue();
    const nextQuery = { ...lastQuery, ...query };
    this.filter.next(nextQuery);
  }

  fetch(startRow: number, numberOfRows?: number): void {
    if (numberOfRows) {
      this.pageSize = numberOfRows;
    }
    this.pageNumber.next(startRow);
  }

  connect(): Observable<T[]> {
    return this.page$.pipe(map(page => page.content));
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect(): void {}

}
