import { firstValueFrom, forkJoin, of, Subject } from 'rxjs';
import { first, take, toArray } from 'rxjs/operators';

import { Page, RequestPageOfList, RequestSortDataList } from '../interfaces/datasource-endpoint.interface';

import { PaginationDataSource } from './dataSource.class';

import createSpy = jasmine.createSpy;

interface User {
  id: number;
  name: string;
}

interface UserFilter {
  search: string;
}

describe('PaginationDatasource', () => {
  it('should query endpoint with initial parameters on connect', (done) => {
    const sorts: RequestSortDataList<User>[] = [{ fieldName: 'name', order: 'asc' }];
    const filter: UserFilter = { search: '' };
    const page: Page<User> = {
      content: [{ id: 1, name: 'Lorem' }],
      pageNumber: 0,
      returnedElements: 0,
      totalElements: 0
    };
    const spy = createSpy('endpoint').and.callFake(() => of(page));
    const source = new PaginationDataSource<User, UserFilter>(spy, filter, sorts);

    expect(spy).not.toHaveBeenCalled();

    // Initialize datasource
    source.connect().subscribe((users) => {
      expect(spy).toHaveBeenCalledWith({ page: 0, numberOfRows: 20 }, filter, sorts);
      expect(users).toEqual(page.content);
      done();
    });
  });

  it('should query endpoint with several parameters', (done) => {
    const initialSorts: RequestSortDataList<User>[] = [{ fieldName: 'name', order: 'asc' }];
    const initialFilter: UserFilter = { search: '' };
    const allPages = [
      {
        content: [{ id: 1, name: 'User[1]' }],
        pageNumber: 1,
        returnedElements: 1,
        totalElements: 100
      },
      {
        content: [{ id: 2, name: 'User[2]' }],
        pageNumber: 1,
        returnedElements: 1,
        totalElements: 100
      },
      {
        content: [{ id: 3, name: 'User[3]' }],
        pageNumber: 1,
        returnedElements: 1,
        totalElements: 100
      },
      {
        content: [{ id: 4, name: 'User[4]' }],
        pageNumber: 3,
        returnedElements: 1,
        totalElements: 100
      }
    ];
    let page = 0;
    const spy = createSpy('endpoint').and.callFake(() => of(allPages[page++]));
    const source = new PaginationDataSource<User, UserFilter>(
      spy,
      initialFilter,
      initialSorts,
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
        initialFilter,
        initialSorts
      ]);

      expect(secondArgs).toEqual([
        { page: 0, numberOfRows: 1 },
        { search: 'lorem' },
        initialSorts
      ]);

      expect(thirdArgs).toEqual([
        { page: 0, numberOfRows: 1 },
        { search: 'lorem' },
        [{ fieldName: 'id', order: 'desc' }]
      ]);

      expect(fourthArgs).toEqual([
        { page: 3, numberOfRows: 1 },
        { search: 'lorem' },
        [{ fieldName: 'id', order: 'desc' }]
      ]);
      done();
    });

    // Calls 2 .. 4 to endpoint
    source.filterBy({ search: 'lorem' });
    source.sort = ([{ fieldName: 'id', order: 'desc' }]);
    source.fetch(3);
  });

  it('should query endpoint starting with initialPage', (done) => {
    const initialSort: RequestSortDataList<User>[] = [{ fieldName: 'name', order: 'asc' }];
    const initialFilter: UserFilter = { search: '' };
    const initialPage = 2;
    const allPages = [
      {
        content: [{ id: 1, name: 'User[1]' }],
        pageNumber: 1,
        returnedElements: 1,
        totalElements: 100
      },
      {
        content: [{ id: 2, name: 'User[2]' }],
        pageNumber: 1,
        returnedElements: 1,
        totalElements: 100
      },
      {
        content: [{ id: 3, name: 'User[3]' }],
        pageNumber: 1,
        returnedElements: 1,
        totalElements: 100
      },
      {
        content: [{ id: 4, name: 'User[4]' }],
        pageNumber: 3,
        returnedElements: 1,
        totalElements: 100
      }
    ];
    const spy = createSpy('endpoint').and.callFake((value: RequestPageOfList) => of(allPages[value.page]));
    const source = new PaginationDataSource<User, UserFilter>(
      spy,
      initialFilter,
      initialSort,
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
        initialFilter,
        initialSort
      ]);

      expect(secondArgs).toEqual([
        { page: 0, numberOfRows: 1 },
        { search: 'lorem' },
        initialSort
      ]);
      done();
    });

    // Second call to endpoint
    source.filterBy({ search: 'lorem' });
  });

  it('should indicate loading', async () => {
    const sink = new Subject<Page<User>>();
    const spy = createSpy('endpoint').and.callFake(() => sink);
    const source = new PaginationDataSource<User, UserFilter>(
      spy,
      { search: '' },
      [{ fieldName: 'name', order: 'asc' }]
    );
    const firstLoading$ = firstValueFrom(source.loading$);
    source.connect().pipe(first()).subscribe();

    expect(await firstLoading$).toEqual(true);
    const secondLoading$ = firstValueFrom(source.loading$);
    sink.next({
      content: [{ id: 1, name: 'Lorem' }],
      pageNumber: 1,
      returnedElements: 1,
      totalElements: 100
    });
    sink.complete();

    expect(await secondLoading$).toEqual(false);
  });

  /* eslint-disable jasmine/new-line-before-expect */
  it('should update pagesize', () => {
    const sink = new Subject<Page<User>>();
    const spy = createSpy('endpoint').and.callFake(() => sink);
    const sort: RequestSortDataList<User>[] = [{ fieldName: 'name', order: 'asc' }];
    const filter: UserFilter = { search: '' };
    const source = new PaginationDataSource<User, UserFilter>(spy, filter, sort);
    const subscription = source.connect().subscribe();

    // Has been called with default page number
    expect(spy).toHaveBeenCalledWith({ page: 0, numberOfRows: 20 }, filter, sort);

    // Call with new page number
    source.fetch(1, 30);
    expect(spy).toHaveBeenCalledWith({ page: 1, numberOfRows: 30 }, filter, sort);

    // Call with new page number
    source.fetch(2);
    expect(spy).toHaveBeenCalledWith({ page: 2, numberOfRows: 30 }, filter, sort);

    subscription.unsubscribe();
  });
  /* eslint-enable jasmine/new-line-before-expect */

  // TODO add tests for constructor without optional parameters
  // TODO add tests for results received
});
