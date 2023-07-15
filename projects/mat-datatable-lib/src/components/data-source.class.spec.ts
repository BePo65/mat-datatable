/* eslint-disable jasmine/new-line-before-expect */
/* eslint-disable jasmine/no-expect-in-setup-teardown */

import { delay, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { Page, FieldSortDefinition } from '../interfaces/datasource-endpoint.interface';

import { TableVirtualScrollDataSource } from './data-source.class';

import createSpy = jasmine.createSpy;

type pageRequest<T> = {
  page?: number,
  rows?: number,
  sort?: FieldSortDefinition<T>[],
  filter?: UserFilter
}

interface User {
  id: number;
  name: string;
}

interface UserFilter {
  search: string;
}

describe('PaginationDatasource', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) =>
      expect(actual).toEqual(expected)
    );
  });

  it('should return default page on connect', () => {
    const allPages = [
      {
        content: [],
        startRowIndex: 0,
        returnedElements: 0,
        totalElements: 0
      },
      {
        content: [{ id: 1, name: 'User[1]' }],
        startRowIndex: 1,
        returnedElements: 1,
        totalElements: 80
      }
    ] as Page<User>[];

    // Start with index 1, as first element is returned as default value
    let page = 1;
    const spy = createSpy('endpoint').and.callFake(() => of(allPages[page++]));
    const dataSource = new TableVirtualScrollDataSource<User, UserFilter>(spy);

    testScheduler.run(helpers => {
      const { expectObservable, flush } = helpers;
      const expectedMarbles = 'i';
      const expectedValues = {
        i: allPages[0]
      };

      expectObservable(dataSource.page$).toBe(expectedMarbles, expectedValues);

      flush();

      expect(spy).not.toHaveBeenCalled();
    });

    // complete all subscriptions
    dataSource.disconnect();
  });

  it('should get 3 pages from datasource', () => {
    const pageRequests: pageRequest<User>[] = [
      { page:0, rows:11, sort:undefined, filter:{ search: 'lorem' }},
      { page:1, rows:12, sort:[{ fieldName: 'id', sortDirection: 'desc' } as FieldSortDefinition<User>], filter:undefined },
      { page:2, rows:undefined, sort:undefined, filter:undefined }
    ];
    const allPages = [
      {
        content: [{ id: 1, name: 'User[1]' }],
        startRowIndex: 1,
        returnedElements: 1,
        totalElements: 80
      },
      {
        content: [{ id: 2, name: 'User[2]' }],
        startRowIndex: 2,
        returnedElements: 1,
        totalElements: 90
      },
      {
        content: [{ id: 3, name: 'User[3]' }],
        startRowIndex: 3,
        returnedElements: 1,
        totalElements: 100
      }
    ] as Page<User>[];

    let page = 0;
    const spy = createSpy('endpoint').and.callFake(() => of(allPages[page++]));
    const dataSource = new TableVirtualScrollDataSource<User, UserFilter>(spy);

    testScheduler.run(helpers => {
      const { cold, expectObservable, flush } = helpers;
      const sourceMarbles = '1-2-3-|';
      const expectedMarbles = 'a-b-c';
      const expectedValues = {
        a: allPages[0],
        b: allPages[1],
        c: allPages[2]
      };

      const source = cold(sourceMarbles, {
        1: pageRequests[0],
        2: pageRequests[1],
        3: pageRequests[2]
      });

      // Use source to make dataSource emit values
      source.subscribe(
        request => {
          if (request !== undefined) {
            // TODO dataSource.loadPage(request.page, request.rows, request.sort, request.filter);
          }
        }
      );

      expectObservable(dataSource.page$).toBe(expectedMarbles, expectedValues);

      flush();

      expect(spy).toHaveBeenCalledTimes(3);

      // Check calling parameters
      const defaultRows = 10;
      const defaultSort: FieldSortDefinition<User>[] = [];
      const callingParams = spy.calls.allArgs();
      const expectedParams = pageRequests.map(params => {
        const reformattedParams = [];
        reformattedParams.push({ page: params.page, numberOfRows: params.rows || defaultRows });
        reformattedParams.push(params.sort || defaultSort);
        reformattedParams.push(params.filter);
        return reformattedParams;
      });
      expect(callingParams).toEqual(expectedParams);
    });

    // Complete source
    dataSource.disconnect();
  });

  it('should return 3 content arrays from datasource', () => {
    const pageRequests = [
      { page:0, rows:11, sort:undefined, filter:{ search: 'lorem' }},
      { page:1, rows:12, sort:[{ fieldName: 'id', sortDirection: 'desc' } as FieldSortDefinition<User>], filter:undefined },
      { page:2, rows:undefined, sort:undefined, filter:undefined }
    ];
    const allPages = [
      {
        content: [{ id: 1, name: 'User[1]' }],
        startRowIndex: 1,
        returnedElements: 1,
        totalElements: 80
      },
      {
        content: [{ id: 2, name: 'User[2]' }],
        startRowIndex: 2,
        returnedElements: 1,
        totalElements: 90
      },
      {
        content: [{ id: 3, name: 'User[3]' }],
        startRowIndex: 3,
        returnedElements: 1,
        totalElements: 100
      }
    ] as Page<User>[];

    let page = 0;
    const spy = createSpy('endpoint').and.callFake(() => of(allPages[page++]));
    const dataSource = new TableVirtualScrollDataSource<User, UserFilter>(spy);

    testScheduler.run(helpers => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { cold, expectObservable, flush } = helpers;
      const sourceMarbles = '1-2-3-|';
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const expectedMarbles = 'a-b-c';
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const expectedValues = {
        a: allPages[0].content,
        b: allPages[1].content,
        c: allPages[2].content
      };

      const source = cold(sourceMarbles, {
        1: pageRequests[0],
        2: pageRequests[1],
        3: pageRequests[2]
      });

      // Use source to make dataSource emit values
      source.subscribe(
        request => {
          if (request !== undefined) {
            // TODO dataSource.loadPage(request.page, request.rows, request.sort, request.filter);
          }
        }
      );

      // TODO expectObservable(dataSource.connect()).toBe(expectedMarbles, expectedValues);

      flush();

      expect(spy).toHaveBeenCalledTimes(3);
    });

    // complete all subscriptions
    dataSource.disconnect();
  });

  it('should indicate loading for 1 page', () => {
    const pageRequests = [
      { page:0, rows:11, sort:undefined, filter:{ search: 'lorem' }}
    ];
    const allPages = [
      {
        content: [{ id: 1, name: 'User[1]' }],
        startRowIndex: 1,
        returnedElements: 1,
        totalElements: 80
      }
    ] as Page<User>[];

    let page = 0;
    const spy = createSpy('endpoint').and.callFake(() => of(allPages[page++]).pipe(delay(100)));
    const dataSource = new TableVirtualScrollDataSource<User, UserFilter>(spy);

    testScheduler.run(helpers => {
      const { cold, expectObservable, flush } = helpers;
      const sourceMarbles = '1-|';
      const expectedMarbles = 'a 99ms b';
      const expectedValues = {
        a: true,
        b: false
      };

      const source = cold(sourceMarbles, {
        1: pageRequests[0]
      });

      // Use source to make dataSource emit values
      source.subscribe(
        request => {
          if (request !== undefined) {
            // TODO dataSource.loadPage(request.page, request.rows, request.sort, request.filter);
          }
        }
      );

      expectObservable(dataSource.loading$).toBe(expectedMarbles, expectedValues);

      flush();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    // Complete source
    dataSource.disconnect();
  });

  it('should indicate loading for 3 pages', () => {
    const pageRequests = [
      { page:0, rows:11, sort:undefined, filter:{ search: 'lorem' }},
      { page:1, rows:12, sort:[{ fieldName: 'id', sortDirection: 'desc' } as FieldSortDefinition<User>], filter:undefined },
      { page:2, rows:undefined, sort:undefined, filter:undefined }
    ];
    const allPages = [
      {
        content: [{ id: 1, name: 'User[1]' }],
        startRowIndex: 1,
        returnedElements: 1,
        totalElements: 80
      },
      {
        content: [{ id: 2, name: 'User[2]' }],
        startRowIndex: 2,
        returnedElements: 1,
        totalElements: 90
      },
      {
        content: [{ id: 3, name: 'User[3]' }],
        startRowIndex: 3,
        returnedElements: 1,
        totalElements: 100
      }
    ] as Page<User>[];

    let page = 0;
    const spy = createSpy('endpoint').and.callFake(() => of(allPages[page++]));
    const dataSource = new TableVirtualScrollDataSource<User, UserFilter>(spy);

    testScheduler.run(helpers => {
      const { cold, expectObservable, flush } = helpers;
      const sourceMarbles = '1 500ms 2 500ms 3-|';
      const expectedMarbles = 'a 500ms (bc) 497ms (de)';
      const expectedValues = {
        a: false,
        b: true,
        c: false,
        d: true,
        e: false
      };

      const source = cold(sourceMarbles, {
        1: pageRequests[0],
        2: pageRequests[1],
        3: pageRequests[2]
      });

      // Use source to make dataSource emit values
      source.subscribe(
        request => {
          if (request !== undefined) {
            // TODO dataSource.loadPage(request.page, request.rows, request.sort, request.filter);
          }
        }
      );

      expectObservable(dataSource.loading$).toBe(expectedMarbles, expectedValues);

      flush();

      expect(spy).toHaveBeenCalledTimes(3);
    });

    // Complete source
    dataSource.disconnect();
  });
});
