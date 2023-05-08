import { firstValueFrom, forkJoin, of, Subject } from 'rxjs';
import { first, take, toArray } from 'rxjs/operators';

import { Page, RequestRowsOfList, RequestSortOfList } from '../interfaces/datasource-endpoint.interface';

import { PaginationDataSource } from './dataSource.class';

import createSpy = jasmine.createSpy;

interface User {
  id: number;
  name: string;
}

interface UserQuery {
  search: string;
}

// TODO (done) ==> async / await
describe('PaginationDatasource', () => {
  it('should query endpoint with initial parameters on connect', (done) => {
    const sorts: RequestSortOfList<User>[] = [{ property: 'name', order: 'asc' }];
    const query: UserQuery = { search: '' };
    const page: Page<User> = {
      content: [{ id: 1, name: 'Lorem' }],
      totalElements: 0,
      numberOfRows: 0,
      pageNumber: 0
    };
    const spy = createSpy('endpoint').and.callFake(() => of(page));
    const source = new PaginationDataSource<User, UserQuery>(spy, sorts, query);

    expect(spy).not.toHaveBeenCalled();

    // Initialize datasource
    source.connect().subscribe((users) => {
      expect(spy).toHaveBeenCalledWith({ page: 0, numberOfRows: 20 }, sorts, query);
      expect(users).toEqual(page.content);
      done();
    });
  });

  it('should query endpoint with several parameters', (done) => {
    const initialSorts: RequestSortOfList<User>[] = [{ property: 'name', order: 'asc' }];
    const initialQuery: UserQuery = { search: '' };
    const allPages = [
      {
        content: [{ id: 1, name: 'User[1]' }],
        totalElements: 100,
        numberOfRows: 1,
        pageNumber: 1
      },
      {
        content: [{ id: 2, name: 'User[2]' }],
        totalElements: 100,
        numberOfRows: 1,
        pageNumber: 1
      },
      {
        content: [{ id: 3, name: 'User[3]' }],
        totalElements: 100,
        numberOfRows: 1,
        pageNumber: 1
      },
      {
        content: [{ id: 4, name: 'User[4]' }],
        totalElements: 100,
        numberOfRows: 1,
        pageNumber: 3
      }
    ];
    let page = 0;
    const spy = createSpy('endpoint').and.callFake(() => of(allPages[page++]));
    const source = new PaginationDataSource<User, UserQuery>(
      spy,
      initialSorts,
      initialQuery,
      1
    );

    // Get stream of internal state starting with state after initialization
    const page$ = source.page$.pipe(take(4), toArray());
    // Get stream of data starting with selected data after initialization
    const content$ = source.connect().pipe(take(4), toArray());
    forkJoin([content$, page$]).subscribe(([contents, pages]) => {
      // Check initial state
      expect(pages).toEqual(allPages);

      // Result of first call to endpoint
      expect(contents).toEqual(allPages.map((p) => p.content));

      const [firstArgs, secondArgs, thirdArgs, fourthArgs] =
        spy.calls.allArgs();

      expect(firstArgs).toEqual([
        { page: 0, numberOfRows: 1 },
        initialSorts,
        initialQuery
      ]);

      expect(secondArgs).toEqual([
        { page: 0, numberOfRows: 1 },
        initialSorts,
        { search: 'lorem' }
      ]);

      expect(thirdArgs).toEqual([
        { page: 0, numberOfRows: 1 },
        [{ property: 'id', order: 'desc' }],
        { search: 'lorem' }
      ]);

      expect(fourthArgs).toEqual([
        { page: 3, numberOfRows: 1 },
        [{ property: 'id', order: 'desc' }],
        { search: 'lorem' }
      ]);
      done();
    });

    // Calls 2 .. 4 to endpoint
    source.queryBy({ search: 'lorem' });
    source.sortBy([{ property: 'id', order: 'desc' }]);
    source.fetch(3);
  });

  it('should query endpoint starting with initialPage', (done) => {
    const initialSort: RequestSortOfList<User>[] = [{ property: 'name', order: 'asc' }];
    const initialQuery: UserQuery = { search: '' };
    const initialPage = 2;
    const allPages = [
      {
        content: [{ id: 1, name: 'User[1]' }],
        totalElements: 100,
        numberOfRows: 1,
        pageNumber: 1
      },
      {
        content: [{ id: 2, name: 'User[2]' }],
        totalElements: 100,
        numberOfRows: 1,
        pageNumber: 1
      },
      {
        content: [{ id: 3, name: 'User[3]' }],
        totalElements: 100,
        numberOfRows: 1,
        pageNumber: 1
      },
      {
        content: [{ id: 4, name: 'User[4]' }],
        totalElements: 100,
        numberOfRows: 1,
        pageNumber: 3
      }
    ];
    const spy = createSpy('endpoint').and.callFake((value: RequestRowsOfList) => of(allPages[value.page]));
    const source = new PaginationDataSource<User, UserQuery>(
      spy,
      initialSort,
      initialQuery,
      1,
      initialPage
    );

    // Get stream of internal state starting with state after initialization
    const page$ = source.page$.pipe(take(2), toArray());
    // Get stream of data starting with selected data after initialization
    const content$ = source.connect().pipe(take(2), toArray());
    forkJoin([content$, page$]).subscribe(([contents, pages]) => {
      // Check initial state
      expect(pages).toEqual([allPages[2], allPages[0]]);

      // Result of first call to endpoint
      expect(contents).toEqual([allPages[2], allPages[0]].map((p) => p.content));

      const [firstArgs, secondArgs] = spy.calls.allArgs();

      expect(firstArgs).toEqual([
        { page: 2, numberOfRows: 1 },
        initialSort,
        initialQuery
      ]);

      expect(secondArgs).toEqual([
        { page: 0, numberOfRows: 1 },
        initialSort,
        { search: 'lorem' }
      ]);
      done();
    });

    // Second call to endpoint
    source.queryBy({ search: 'lorem' });
  });

  it('should indicate loading', async () => {
    const sink = new Subject<Page<User>>();
    const spy = createSpy('endpoint').and.callFake(() => sink);
    const source = new PaginationDataSource<User, UserQuery>(
      spy,
      [{ property: 'name', order: 'asc' }],
      { search: '' }
    );
    const firstLoading$ = firstValueFrom(source.loading$);
    source.connect().pipe(first()).subscribe();

    expect(await firstLoading$).toEqual(true);
    const secondLoading$ = firstValueFrom(source.loading$);
    sink.next({
      content: [{ id: 1, name: 'Lorem' }],
      totalElements: 100,
      numberOfRows: 1,
      pageNumber: 1
    });
    sink.complete();

    expect(await secondLoading$).toEqual(false);
  });

  /* eslint-disable jasmine/new-line-before-expect */
  it('should update pagesize', () => {
    const sink = new Subject<Page<User>>();
    const spy = createSpy('endpoint').and.callFake(() => sink);
    const sort: RequestSortOfList<User>[] = [{ property: 'name', order: 'asc' }];
    const query: UserQuery = { search: '' };
    const source = new PaginationDataSource<User, UserQuery>(spy, sort, query);
    const subscription = source.connect().subscribe();

    // Has been called with default page number
    expect(spy).toHaveBeenCalledWith({ page: 0, numberOfRows: 20 }, sort, query);

    // Call with new page number
    source.fetch(1, 30);
    expect(spy).toHaveBeenCalledWith({ page: 1, numberOfRows: 30 }, sort, query);

    // Call with new page number
    source.fetch(2);
    expect(spy).toHaveBeenCalledWith({ page: 2, numberOfRows: 30 }, sort, query);

    subscription.unsubscribe();
  });
  /* eslint-enable jasmine/new-line-before-expect */
});
