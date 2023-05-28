import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';

import { Page, RequestSortDataList, DatasourceEndpoint } from '../interfaces/datasource-endpoint.interface';
import { SimpleDataSource } from '../interfaces/simple-datasource.interface';

export class PaginationDataSource<T, F> implements SimpleDataSource<T> {
  private emptyPage: Page<T> = {
    content: [] as T[],
    pageNumber: 0,
    returnedElements: 0,
    totalElements: 0
  };
  private readonly pageSubject = new BehaviorSubject<Page<T>>(this.emptyPage);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  public page$ = this.pageSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    // HACK endpoint is made public to change it on ngAfterViewInit
    public endpoint: DatasourceEndpoint<T, F>
  ) {
  }

  connect(): Observable<T[]> {
    return this.pageSubject.asObservable()
      .pipe(
        map(page => page.content)
      );
  }

  disconnect(): void {
    this.pageSubject.complete();
    this.loadingSubject.complete();
  }

  /**
   * Load a single page from the datasource (via 'endpoint').
   * The new page is emitted on page$.
   * Before calling 'endpoint' to fetch data from the datasource,
   * 'loading$' emits 'true'; when the data from the datasource arrived,
   * 'loading$' emits 'false'.
   * Errors from the datasource ('endpoint') are ignored; an empty page is emitted.
   * @param [pageNumber=0] - number of the page to be loaded (zero-based)
   * @param [pageSize=10] - number of rows to load
   * @param [sorts=[]] - list of sort definitions to apply
   * @param [filter] - filter object to apply
   */
  loadPage(
    pageNumber = 0,
    pageSize = 10,
    sorts: RequestSortDataList<T>[] = [],
    filter?: F): void {
      this.loadingSubject.next(true);
      this.endpoint({ page: pageNumber, numberOfRows: pageSize }, sorts, filter)
        .pipe(
          take(1),
          catchError(() => of(this.emptyPage))
        )
        .subscribe({
          next: page => this.pageSubject.next(page),
          complete: () => this.loadingSubject.next(false)
        });
  }
}
