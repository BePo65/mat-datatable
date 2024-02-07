/* eslint-disable jasmine/new-line-before-expect */
/* eslint-disable jasmine/no-expect-in-setup-teardown */

import { of, Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { Page, FieldSortDefinition, RequestRowsRange, FieldFilterDefinition, FieldFilterDefinitionSimple, FieldFilterDefinitionRange } from '../interfaces/datasource-endpoint.interface';

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
    dataSource.connect();

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

  it('should get datastore sizes for 3 pages from datasource', () => {
    const allEndpointParameters: pageRequest<User>[] = [
      { rowsRange:{ startRowIndex:0, numberOfRows:0 }, sorts:[], filters:[] },
      { rowsRange:{ startRowIndex:1, numberOfRows:2 }, sorts:[], filters:[] },
      { rowsRange:{ startRowIndex:5, numberOfRows:1 }, sorts:[], filters:[] },
      { rowsRange:{ startRowIndex:27, numberOfRows:3 }, sorts:[], filters:[] }
    ];

    // The spy also gets called by virtual scroller for getting the size of the datastore:
    // 1x from the constructor and 1x für every setting of 'sorts' and 'filters'.
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

      // Check calling parameters
      const callingParams = spy.calls.allArgs();
      expect(callingParams).toEqual(expectedSpyCallingParameters);
    });

    // Complete source
    dataSource.disconnect();
  });

  it('should get rendered data and preliminary data for 1 page from datasource', () => {
    // The spy also gets called by virtual scroller for getting the size of the datastore
    const expectedSpyCallingParameters = [
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':55,'numberOfRows':1 }, [], []]
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
      const sourceMarbles = '-1-|';
      const expectedMarbles = 'a (bc)';
      const expectedValues = {
        a: Array(0),
        b: Array(1),
        c: [{ id: 55, name: 'User0055' }]
      };

      const source = cold(sourceMarbles, {
        1: { rowsRange:{ startRowIndex:55, numberOfRows:1 }, sorts:[], filters:[] }
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

      /**
       * The endpoint is called 3 times:
       * 1. by the constructor of the dataSource
       * 2. by setSorts
       * 3. by setFilters
       */
      expect(spy).toHaveBeenCalledTimes(expectedSpyCallingParameters.length);

      // Check calling parameters
      const callingParams = spy.calls.allArgs();
      expect(callingParams).toEqual(expectedSpyCallingParameters);
    });

    // Complete source
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

  it('should get 3 pages from datasource with sorting', () => {
    const allEndpointParameters: pageRequest<User>[] = [
      { rowsRange:{ startRowIndex:0, numberOfRows:0 }, sorts:[], filters:[] },
      { rowsRange:{ startRowIndex:1, numberOfRows:2 }, sorts:[{ fieldName:'name', sortDirection:'desc' }], filters:[] },
      { rowsRange:{ startRowIndex:5, numberOfRows:1 }, sorts:[], filters:[] },
      { rowsRange:{ startRowIndex:27, numberOfRows:3 }, sorts:[{ fieldName:'id', sortDirection:'desc' }], filters:[] }
    ];

    // The spy also gets called by virtual scroller for getting the size of the datastore
    const expectedSpyCallingParameters = [
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [{ fieldName:'name', sortDirection:'desc' }], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [{ fieldName:'name', sortDirection:'desc' }], []],
      [{ 'startRowIndex':1,'numberOfRows':2 }, [{ fieldName:'name', sortDirection:'desc' }], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':5,'numberOfRows':1 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [{ fieldName:'id', sortDirection:'desc' }], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [{ fieldName:'id', sortDirection:'desc' }], []],
      [{ 'startRowIndex':27,'numberOfRows':3 }, [{ fieldName:'id', sortDirection:'desc' }], []]
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
        a: [{ id: 78, name: 'User0078' }, { id: 77, name: 'User0077' }],
        b: Array(1),
        c: [{ id: 5, name: 'User0005' }],
        d: Array(3),
        e: [{ id: 52, name: 'User0052' }, { id: 51, name: 'User0051' }, { id: 50, name: 'User0050' }]
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

  it('should get 3 pages from datasource with filtering', () => {
    const allEndpointParameters: pageRequest<User>[] = [
      { rowsRange:{ startRowIndex:0, numberOfRows:0 }, sorts:[], filters:[] },
      { rowsRange:{ startRowIndex:0, numberOfRows:1 }, sorts:[], filters:[{ fieldName:'name', value:'User0037' }] as FieldFilterDefinition<User>[] },
      { rowsRange:{ startRowIndex:0, numberOfRows:1 }, sorts:[], filters:[{ fieldName:'name', value:'User0028' }] as FieldFilterDefinition<User>[] },
      { rowsRange:{ startRowIndex:20, numberOfRows:3 }, sorts:[], filters:[{ fieldName:'name', valueFrom:'User0003', valueTo:'User0030' }] as FieldFilterDefinition<User>[] }
    ];

    // The spy also gets called by virtual scroller for getting the size of the datastore
    const expectedSpyCallingParameters = [
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [{ fieldName:'name', value:'User0037' }]],
      [{ 'startRowIndex':0,'numberOfRows':1 }, [], [{ fieldName:'name', value:'User0037' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [{ fieldName:'name', value:'User0037' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [{ fieldName:'name', value:'User0028' }]],
      [{ 'startRowIndex':0,'numberOfRows':1 }, [], [{ fieldName:'name', value:'User0028' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [{ fieldName:'name', value:'User0028' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [{ fieldName:'name', valueFrom:'User0003', valueTo:'User0030' }]],
      [{ 'startRowIndex':20,'numberOfRows':3 }, [], [{ fieldName:'name', valueFrom:'User0003', valueTo:'User0030' }]]
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
        a: [{ id: 37, name: 'User0037' }],
        b: [{ id: 37, name: 'User0037' }],
        c: [{ id: 28, name: 'User0028' }],
        d: Array(3),
        e: [{ id: 23, name: 'User0023' }, { id: 24, name: 'User0024' }, { id: 25, name: 'User0025' }]
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

  it('should get 3 pages from datasource with sorting and filtering', () => {
    const allEndpointParameters: pageRequest<User>[] = [
      { rowsRange:{ startRowIndex:0, numberOfRows:0 }, sorts:[], filters:[] },
      { rowsRange:{ startRowIndex:0, numberOfRows:1 }, sorts:[{ fieldName:'name', sortDirection:'desc' }], filters:[{ fieldName:'name', value:'User0037' }] as FieldFilterDefinitionSimple<User>[] },
      { rowsRange:{ startRowIndex:0, numberOfRows:2 }, sorts:[], filters:[{ fieldName:'name', valueFrom:'User0068', valueTo:'User0079' }] as FieldFilterDefinitionRange<User>[] },
      { rowsRange:{ startRowIndex:20, numberOfRows:3 }, sorts:[{ fieldName:'id', sortDirection:'desc' }], filters:[{ fieldName:'name', valueFrom:'User0003', valueTo:'User0030' }] as FieldFilterDefinitionRange<User>[] }
    ];

    // The spy also gets called by virtual scroller for getting the size of the datastore
    const expectedSpyCallingParameters = [
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [{ fieldName: 'name', sortDirection: 'desc' }], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [{ fieldName: 'name', sortDirection: 'desc' }], [{ fieldName:'name', value:'User0037' }]],
      [{ 'startRowIndex':0,'numberOfRows':1 }, [{ fieldName: 'name', sortDirection: 'desc' }], [{ fieldName:'name', value:'User0037' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [{ fieldName:'name', value:'User0037' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [{ fieldName:'name', valueFrom:'User0068', valueTo: 'User0079' }]],
      [{ 'startRowIndex':0,'numberOfRows':2 }, [], [{ fieldName:'name', valueFrom:'User0068', valueTo: 'User0079' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [{ fieldName: 'id', sortDirection: 'desc' }], [{ fieldName:'name', valueFrom:'User0068', valueTo: 'User0079' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [{ fieldName: 'id', sortDirection: 'desc' }], [{ fieldName:'name', valueFrom:'User0003', valueTo:'User0030' }]],
      [{ 'startRowIndex':20,'numberOfRows':3 }, [{ fieldName: 'id', sortDirection: 'desc' }], [{ fieldName:'name', valueFrom:'User0003', valueTo:'User0030' }]]
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
        a: [{ id: 37, name: 'User0037' }],
        b: [{ id: 37, name: 'User0037' }, undefined],
        c: [{ id: 68, name: 'User0068' }, { id: 69, name: 'User0069' }],
        d: Array(3),
        e: [{ id: 10, name: 'User0010' }, { id: 9, name: 'User0009' }, { id: 8, name: 'User0008' }]
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

  it('should indicate loading for 1 page', () => {
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

  it('should indicate loading for 3 pages', () => {
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

    let selectedDataset = structuredClone(this.fakeDataset) as User[];

    // Sort data - only the first entry of the definitions is used
    if ((sorts !== undefined) && Array.isArray(sorts) && (sorts.length > 0)) {
      selectedDataset = selectedDataset.sort((a: User, b: User) => {
        const isAsc = (sorts[0].sortDirection === 'asc');
        let result = 0;
        if (sorts[0].fieldName === 'id') {
          const aId = a.id;
          const bId = b.id;
          result = (aId === bId ? 0 : (aId < bId ? -1 : 1)) * (isAsc ? 1 : -1);
        } else if (sorts[0].fieldName === 'name') {
          const aName = a.name;
          const bName = b.name;
          result = (aName === bName ? 0 : (aName < bName ? -1 : 1)) * (isAsc ? 1 : -1);
        }

        return result;
      });
    }

    // Filter data
    if ((filters !== undefined) && Array.isArray(filters) && (filters.length > 0)) {
      selectedDataset = selectedDataset.filter((currentUser: User) => {
        return filters.reduce((isSelected: boolean, currentFilter: FieldFilterDefinition<User>) => {
          if (currentFilter.value !== undefined) {
            isSelected ||= currentUser[currentFilter.fieldName] === currentFilter.value;
          } else if ((currentFilter.valueFrom !== undefined) && (currentFilter.valueTo !== undefined)) {
            isSelected ||= (
              (currentUser[currentFilter.fieldName] >= currentFilter.valueFrom) &&
              (currentUser[currentFilter.fieldName] <= currentFilter.valueTo)
              );
          }
          return isSelected;
        }, false);
      });
    }

    if (rowsRange.numberOfRows > 0) {
      newPage.content = selectedDataset.slice(rowsRange.startRowIndex, rowsRange.startRowIndex + rowsRange.numberOfRows);
    }

    newPage.returnedElements = newPage.content.length;
    newPage.totalFilteredElements = selectedDataset.length;

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
