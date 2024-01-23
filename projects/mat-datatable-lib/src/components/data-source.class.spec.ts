/* eslint-disable jasmine/new-line-before-expect */
/* eslint-disable jasmine/no-expect-in-setup-teardown */

import { delay, of, Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { Page, FieldSortDefinition, RequestRowsRange, FieldFilterDefinition } from '../interfaces/datasource-endpoint.interface';

import { TableVirtualScrollDataSource, TableVirtualScrollDataStoreSizes } from './data-source.class';

import createSpy = jasmine.createSpy;

type pageRequest<T> = {
  rowsRange: RequestRowsRange,
  sorts?: FieldSortDefinition<T>[],
  filters?: FieldFilterDefinition<T>[]
}

interface User {
  id: number;
  name: string;
}

describe('TableVirtualScrollDataSource', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) =>
      expect(actual).toEqual(expected)
    );
  });

  it('should emit datastore sizes once on connect', () => {
    const allEndpointResults: Page<User>[] = [
      {
        content: [],
        startRowIndex: 0,
        returnedElements: 0,
        totalElements: 80,
        totalFilteredElements: 80
      }
    ];

    const allDatastoreSizes: TableVirtualScrollDataStoreSizes[] = [
      {
        totalElements: 80,
        totalFilteredElements: 80
      }
    ];

    const allEndpointParameters: pageRequest<User>[] = [
      {
        rowsRange: { startRowIndex:0, numberOfRows:0 },
        sorts: [],
        filters: []
      }
    ];

    let page = 0;
    const spyOnEndpoint = createSpy('endpoint').and.callFake(() => of(allEndpointResults[page++]));
    const dataSource = new TableVirtualScrollDataSource<User>(spyOnEndpoint);
    const rangeToDisplay = new Subject<RequestRowsRange>;
    const dataStoreSizes = dataSource.attachVirtualScroller(rangeToDisplay);

    testScheduler.run(helpers => {
      const { expectObservable, flush } = helpers;
      const expectedMarbles = 'a';
      const expectedValues = {
        a: allDatastoreSizes[0]
      };

      expectObservable(dataStoreSizes).toBe(expectedMarbles, expectedValues);

      flush();

      expect(spyOnEndpoint).toHaveBeenCalledTimes(1);
      expect(spyOnEndpoint).toHaveBeenCalledWith(allEndpointParameters[0].rowsRange, allEndpointParameters[0].sorts, allEndpointParameters[0].filters);
    });

    // complete all subscriptions
    dataSource.disconnect();
  });

  it('should get rendered data and preliminary data for 3 pages from datasource', () => {
    const allEndpointParameters: pageRequest<User>[] = [
      { rowsRange:{ startRowIndex:0, numberOfRows:0 }, sorts:[], filters:[] },
      { rowsRange:{ startRowIndex:1, numberOfRows:2 }, sorts:[], filters:[] },
      { rowsRange:{ startRowIndex:5, numberOfRows:1 }, sorts:[], filters:[] },
      { rowsRange:{ startRowIndex:27, numberOfRows:3 }, sorts:[], filters:[] }
    ];

    // The spy also gets called by virtual scroller for getting the size of the datastore
    const expectedSpyCallingParameters = [
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':1,'numberOfRows':2 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':5,'numberOfRows':1 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':27,'numberOfRows':3 }, [], []]
    ];

    const defaultSorts: FieldSortDefinition<User>[] = [];
    const defaultFilters: FieldFilterDefinition<User>[] = [];

    const fakeDataStore = new FakeUserDataStore(80);
    const spy = createSpy('endpoint').and.callFake((range: RequestRowsRange, sorts: FieldSortDefinition<User>[], filters: FieldFilterDefinition<User>[]) => {
      return of(fakeDataStore.getData(range, sorts, filters));
    });
    const dataSource = new TableVirtualScrollDataSource<User>(spy);
    const rangeToDisplay = new Subject<RequestRowsRange>;
    dataSource.attachVirtualScroller(rangeToDisplay);
    const renderData = dataSource.connect();

    testScheduler.run(helpers => {
      const { cold, expectObservable, flush } = helpers;
      const sourceMarbles = '1-2----3-|';
      const expectedMarbles = 'a-(bc)-(de)';
      const expectedValues = {
        a: [{ id: 1, name: 'User0001' }, { id: 2, name: 'User0002' }],
        b: Array(1),
        c: [{ id: 5, name: 'User0005' }],
        d: Array(3),
        e: [{ id: 27, name: 'User0027' }, { id: 28, name: 'User0028' }, { id: 29, name: 'User0029' }]
      };

      const source = cold(sourceMarbles, {
        1: allEndpointParameters[1],
        2: allEndpointParameters[2],
        3: allEndpointParameters[3]
      });

      // Use source to make dataSource emit values
      source.subscribe(
        request => {
          if (request !== undefined) {
            dataSource.sorts = request.sorts || defaultSorts;
            dataSource.filters = request.filters || defaultFilters;
            rangeToDisplay.next(request.rowsRange);
          }
        }
      );

      expectObservable(renderData).toBe(expectedMarbles, expectedValues);

      flush();

      expect(spy).toHaveBeenCalledTimes(expectedSpyCallingParameters.length);

      // Check calling parameters
      const callingParams = spy.calls.allArgs();
      expect(callingParams).toEqual(expectedSpyCallingParameters);
    });

    // Complete source
    dataSource.disconnect();
  });

  it('should get datastore sizes for 3 pages from datasource', () => {
    const allEndpointParameters: pageRequest<User>[] = [
      { rowsRange:{ startRowIndex:0, numberOfRows:0 }, sorts:[], filters:[] },
      { rowsRange:{ startRowIndex:1, numberOfRows:2 }, sorts:[], filters:[] },
      { rowsRange:{ startRowIndex:5, numberOfRows:1 }, sorts:[], filters:[] },
      { rowsRange:{ startRowIndex:27, numberOfRows:3 }, sorts:[], filters:[] }
    ];

    // The spy also gets called by virtual scroller for getting the size of the datastore
    const expectedSpyCallingParameters = [
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':1,'numberOfRows':2 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':5,'numberOfRows':1 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':27,'numberOfRows':3 }, [], []]
    ];

    const defaultSorts: FieldSortDefinition<User>[] = [];
    const defaultFilters: FieldFilterDefinition<User>[] = [];

    const fakeDataStore = new FakeUserDataStore(80);
    const spy = createSpy('endpoint').and.callFake((range: RequestRowsRange, sorts: FieldSortDefinition<User>[], filters: FieldFilterDefinition<User>[]) => {
      return of(fakeDataStore.getData(range, sorts, filters));
    });
    const dataSource = new TableVirtualScrollDataSource<User>(spy);
    const rangeToDisplay = new Subject<RequestRowsRange>;
    const dataStoreSizes = dataSource.attachVirtualScroller(rangeToDisplay);
    dataSource.connect();

    testScheduler.run(helpers => {
      const { cold, expectObservable, flush } = helpers;
      const sourceMarbles = '1-2----3-|';
      const expectedMarbles = 'a-(bc)-(de)';
      const expectedValues = {
        a: { 'totalElements':80,'totalFilteredElements':80 },
        b: { 'totalElements':80,'totalFilteredElements':80 },
        c: { 'totalElements':80,'totalFilteredElements':80 },
        d: { 'totalElements':80,'totalFilteredElements':80 },
        e: { 'totalElements':80,'totalFilteredElements':80 }
      };

      const source = cold(sourceMarbles, {
        1: allEndpointParameters[1],
        2: allEndpointParameters[2],
        3: allEndpointParameters[3]
      });

      // Use source to make dataSource emit values
      source.subscribe(
        request => {
          if (request !== undefined) {
            dataSource.sorts = request.sorts || defaultSorts;
            dataSource.filters = request.filters || defaultFilters;
            rangeToDisplay.next(request.rowsRange);
          }
        }
      );

      expectObservable(dataStoreSizes).toBe(expectedMarbles, expectedValues);

      flush();

      expect(spy).toHaveBeenCalledTimes(expectedSpyCallingParameters.length);
    });

    // Complete source
    dataSource.disconnect();
  });

  it('should indicate loading for 1 page - test without loading$:true', () => {
    // The spy also gets called by virtual scroller for getting the size of the datastore
    const expectedSpyCallingParameters = [
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':11 }, [], []]
    ];

    const defaultSorts: FieldSortDefinition<User>[] = [];
    const defaultFilters: FieldFilterDefinition<User>[] = [];
    const fakeDataStore = new FakeUserDataStore(80);
    const spy = createSpy('endpoint').and.callFake((range: RequestRowsRange, sorts: FieldSortDefinition<User>[], filters: FieldFilterDefinition<User>[]) => {
      return of(fakeDataStore.getData(range, sorts, filters));
    });
    const dataSource = new TableVirtualScrollDataSource<User>(spy);
    const rangeToDisplay = new Subject<RequestRowsRange>;
    dataSource.attachVirtualScroller(rangeToDisplay);
    dataSource.connect();

    testScheduler.run(helpers => {
      const { cold, expectObservable, flush } = helpers;
      const sourceMarbles = '-1-|';
      const expectedMarbles = 'ab';

      // rxjs marble tests cannot get values emitted by setTimeout;
      // the data-source emits true on loading$ via setTimeout to avoid
      // "ExpressionChangedAfterItHasBeenCheckedError"
      const expectedValues = {
        a: false,
        b: false
      };

      const source = cold(sourceMarbles, {
        1: { rowsRange:{ startRowIndex:0, numberOfRows:11 }, sorts:[], filters:[] }
      });

      // Use source to make dataSource emit values
      source.subscribe(
        request => {
          if (request !== undefined) {
            dataSource.sorts = request.sorts || defaultSorts;
            dataSource.filters = request.filters || defaultFilters;
            rangeToDisplay.next(request.rowsRange);
          }
        }
      );

      expectObservable(dataSource.loading$).toBe(expectedMarbles, expectedValues);

      flush();

      expect(spy).toHaveBeenCalledTimes(expectedSpyCallingParameters.length);

      // Check calling parameters
      const callingParams = spy.calls.allArgs();
      expect(callingParams).toEqual(expectedSpyCallingParameters);
    });

    // Complete source
    dataSource.disconnect();
  });

  it('should indicate loading for 3 pages - test without loading$:true', () => {
    // The spy also gets called by virtual scroller for getting the size of the datastore
    const expectedSpyCallingParameters = [
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':11 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':1,'numberOfRows':12 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':2,'numberOfRows':5 }, [], []]
    ];

    const defaultSorts: FieldSortDefinition<User>[] = [];
    const defaultFilters: FieldFilterDefinition<User>[] = [];

    const fakeDataStore = new FakeUserDataStore(80);
    const spy = createSpy('endpoint').and.callFake((range: RequestRowsRange, sorts: FieldSortDefinition<User>[], filters: FieldFilterDefinition<User>[]) => {
      return of(fakeDataStore.getData(range, sorts, filters));
    });
    const dataSource = new TableVirtualScrollDataSource<User>(spy);
    const rangeToDisplay = new Subject<RequestRowsRange>;
    dataSource.attachVirtualScroller(rangeToDisplay);
    dataSource.connect();

    testScheduler.run(helpers => {
      const { cold, expectObservable, flush } = helpers;
      const sourceMarbles = '-1-2-3-|';
      const expectedMarbles = 'ab-c-d';

      // rxjs marble tests cannot get values emitted by setTimeout;
      // the data-source emits true on loading$ via setTimeout to avoid
      // "ExpressionChangedAfterItHasBeenCheckedError"
      const expectedValues = {
        a: false,
        b: false,
        c: false,
        d: false
      };

      const source = cold(sourceMarbles, {
        1: { rowsRange:{ startRowIndex:0, numberOfRows:11 }, sorts:[], filters:[] },
        2: { rowsRange:{ startRowIndex:1, numberOfRows:12 }, sorts:[], filters:[] },
        3: { rowsRange:{ startRowIndex:2, numberOfRows:5 }, sorts:[], filters:[] }
      });

      // Use source to make dataSource emit values
      source.subscribe(
        request => {
          if (request !== undefined) {
            dataSource.sorts = request.sorts || defaultSorts;
            dataSource.filters = request.filters || defaultFilters;
            rangeToDisplay.next(request.rowsRange);
          }
        }
      );

      expectObservable(dataSource.loading$).toBe(expectedMarbles, expectedValues);

      flush();

      expect(spy).toHaveBeenCalledTimes(expectedSpyCallingParameters.length);

      // Check calling parameters
      const callingParams = spy.calls.allArgs();
      expect(callingParams).toEqual(expectedSpyCallingParameters);
    });

    // Complete source
    dataSource.disconnect();
  });

  // TODO test changing size of datastore
  // TODO test dataSource with sorting
  // { rowsRange:{ startRowIndex:5, numberOfRows:1 }, sorts:[{ fieldName: 'id', sortDirection: 'desc' }], filters:[] },
  // TODO test dataSource with filtering
  // filter definition throws { rowsRange:{ startRowIndex:0, numberOfRows:11 }, sorts:[], filters:[{ fieldName: 'name ', value:'lorem' }] },
  // TODO test dataSource with sorting and filtering
});

class FakeUserDataStore {
  public get datastoreSize() : number {
    return this._datastoreSize;
  }
  public set datastoreSize(value: number) {
    if (+value >= 0) {
      this._datastoreSize = +value;
      this.createDataset();
    } else {
      throw new Error(`FakeDataStore set datastoreSize: new value must be greater or equal to 0 (is '${value}')`);
    }
  }
  private _datastoreSize: number;

  public get datastoreFilteredSize() : number {
    return this._datastoreFilteredSize;
  }
  private _datastoreFilteredSize = 0;

  private fakeDataset: User[] = [];

  constructor(defaultDatastoreSize = 0) {
    this._datastoreSize = defaultDatastoreSize;
    this.createDataset();
  }

  getData(
    rowsRange: RequestRowsRange,
    sorts?: FieldSortDefinition<User>[],
    filters?: FieldFilterDefinition<User>[]
  ) {
    const newPage = {
      content: [],
      startRowIndex: rowsRange.startRowIndex,
      returnedElements: Math.max(rowsRange.numberOfRows, 0),
      totalElements: this.datastoreSize,
      totalFilteredElements: this.datastoreSize
    } as Page<User>;

    const selectedDataset = structuredClone(this.fakeDataset) as User[];
    // TODO sort data
    // TODO filter data
    newPage.totalFilteredElements = selectedDataset.length;

    if (rowsRange.numberOfRows > 0) {
      newPage.content = selectedDataset.slice(rowsRange.startRowIndex, rowsRange.startRowIndex + rowsRange.numberOfRows);
    }

    return newPage;
  }

  private createDataset() {
    this.fakeDataset = Array.from({ length: this.datastoreSize }, (v: unknown, k: number) => {
      const index = k;
      const newUser = { id: index, name: `User${index.toString().padStart(4, '0')}` } as User;
      return newUser;
    });
  }
}
