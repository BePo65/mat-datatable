import { BehaviorSubject, defer, Observable, Subject } from 'rxjs';
import { switchMap, startWith, map, shareReplay, tap, finalize, combineLatestWith } from 'rxjs/operators';

import { Page, RequestSortDataList, DatasourceEndpoint } from '../interfaces/datasource-endpoint.interface';
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

// TODO how to change pageSize after initialization?
export class PaginationDataSource<T, F> implements SimpleDataSource<T> {
  public loading$: Observable<boolean>;
  public page$: Observable<Page<T>>;
  public pageSize = 20; // TODO do we need this, if any request will contain the numberOfRows?
  public initialRow = 0; // TODO do we need this - see below?

  // TODO change to type rowsRange
  private readonly pageNumber = new Subject<number>();
  private readonly sorts: BehaviorSubject<RequestSortDataList<T>[]>;
  private readonly filter: BehaviorSubject<F | undefined>;
  private readonly loading = new Subject<boolean>();

  constructor(
    // HACK endpoint is made public to change it on ngAfterViewInit
    public endpoint: DatasourceEndpoint<T, F>,
    initialFilter: F | undefined = undefined,
    initialSorts: RequestSortDataList<T>[] = []
  ) {
    let firstCall = true;
    this.sorts = new BehaviorSubject<RequestSortDataList<T>[]>(initialSorts);
    this.filter = new BehaviorSubject<F | undefined>(initialFilter);
    const param$ = this.sorts.pipe(combineLatestWith(this.filter));
    this.loading$ = this.loading.asObservable();
    this.page$ = param$.pipe(
      switchMap(([sort, filter]) => this.pageNumber.pipe(
        // TODO should we always start with "0"?
        startWith(this.initialRow && firstCall ? this.initialRow : 0),
        tap(() => firstCall = false),
        switchMap(page => this.endpoint({ page, numberOfRows: this.pageSize }, filter, sort).pipe(
          indicate(this.loading)
        ))
      )),
      shareReplay(1)
    );
  }

  connect(): Observable<T[]> {
    return this.page$.pipe(map(page => page.content));
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect(): void {}

  /**
   * Gets the sorting definition from the datasource.
   * @returns fields and directions that the datasource uses for sorting
   */
  get sort(): RequestSortDataList<T>[] {
    return this.sorts.getValue();
  }

  /**
   * Sets the sorting definition from the datasource and triggers page$ to
   * emit new data.
   * @param sortDefinition - fields and directions that should be used for sorting
   */
  set sort(sortDefinition: RequestSortDataList<T>[]) {
    const newSort = structuredClone(sortDefinition) as  RequestSortDataList<T>[];
    this.sorts.next(newSort);
  }

  filterBy(filter: F): void {
    const newQuery = structuredClone(filter) as F;
    this.filter.next(newQuery);
  }

  fetch(startRow: number, numberOfRows?: number): void {
    if (numberOfRows) {
      this.pageSize = numberOfRows;
    }
    this.pageNumber.next(startRow);
  }
}
