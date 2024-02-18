/* eslint-disable jasmine/new-line-before-expect */
/* eslint-disable jasmine/no-expect-in-setup-teardown */

import { TrackByFunction } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import {
  Page,
  FieldSortDefinition,
  RequestRowsRange,
  FieldFilterDefinition,
  FieldFilterDefinitionSimple,
  FieldFilterDefinitionRange,
  DataStoreProvider
} from '../interfaces/datastore-provider.interface';

import { TableVirtualScrollDataSource, TableVirtualScrollDataStoreSizes } from './data-source.class';

type pageRequest<T> = {
  rowsRange: RequestRowsRange,
  sorts?: FieldSortDefinition<T>[],
  filters?: FieldFilterDefinition<T>[]
}

interface User {
  id: number;
  name: string;
}

interface Atom {
  id: number;
  name: string;
  weight: number;
  symbol: string;
}

const sortableDataset = [
  { id: 5, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { id: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { id: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { id: 2, name: 'Helium', weight: 6.1234, symbol: 'He' },
  { id: 3, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { id: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { id: 4, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { id: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
  { id: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { id: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' }
] as Atom[];

describe('TableVirtualScrollDataSource', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) =>
      expect(actual).toEqual(expected)
    );
  });

  it('should emit datastore sizes once on connect', () => {
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

    const fakeDataStore = new FakeUserDataStore<User>(undefined, 80);
    const spyOnEndpoint = spyOn(fakeDataStore, 'getPagedData').and.callThrough();
    const dataSource = new TableVirtualScrollDataSource<User>(fakeDataStore);
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
      [{ 'startRowIndex':0, 'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0, 'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0, 'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':1, 'numberOfRows':2 }, [], []],
      [{ 'startRowIndex':0, 'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0, 'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':5, 'numberOfRows':1 }, [], []],
      [{ 'startRowIndex':0, 'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0, 'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':27, 'numberOfRows':3 }, [], []]
    ] as [ RequestRowsRange, FieldSortDefinition<User>[], FieldFilterDefinition<User>[] ][];

    const defaultSorts: FieldSortDefinition<User>[] = [];
    const defaultFilters: FieldFilterDefinition<User>[] = [];

    const fakeDataStore = new FakeUserDataStore<User>(undefined, 80);
    const spyOnEndpoint = spyOn(fakeDataStore, 'getPagedData').and.callThrough();
    const dataSource = new TableVirtualScrollDataSource<User>(fakeDataStore);
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

      expect(spyOnEndpoint).toHaveBeenCalledTimes(expectedSpyCallingParameters.length);

      // Check calling parameters
      const callingParams = spyOnEndpoint.calls.allArgs();
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
    ] as [ RequestRowsRange, FieldSortDefinition<User>[], FieldFilterDefinition<User>[] ][];

    const defaultSorts: FieldSortDefinition<User>[] = [];
    const defaultFilters: FieldFilterDefinition<User>[] = [];

    const fakeDataStore = new FakeUserDataStore<User>(undefined, 80);
    const spyOnEndpoint = spyOn(fakeDataStore, 'getPagedData').and.callThrough();
    const dataSource = new TableVirtualScrollDataSource<User>(fakeDataStore);
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
      expect(spyOnEndpoint).toHaveBeenCalledTimes(expectedSpyCallingParameters.length);

      // Check calling parameters
      const callingParams = spyOnEndpoint.calls.allArgs();
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
    ] as [ RequestRowsRange, FieldSortDefinition<User>[], FieldFilterDefinition<User>[] ][];

    const defaultSorts: FieldSortDefinition<User>[] = [];
    const defaultFilters: FieldFilterDefinition<User>[] = [];

    const fakeDataStore = new FakeUserDataStore<User>(undefined, 80);
    const spyOnEndpoint = spyOn(fakeDataStore, 'getPagedData').and.callThrough();
    const dataSource = new TableVirtualScrollDataSource<User>(fakeDataStore);
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

      expect(spyOnEndpoint).toHaveBeenCalledTimes(expectedSpyCallingParameters.length);

      // Check calling parameters
      const callingParams = spyOnEndpoint.calls.allArgs();
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
    ] as [ RequestRowsRange, FieldSortDefinition<User>[], FieldFilterDefinition<User>[] ][];

    const defaultSorts: FieldSortDefinition<User>[] = [];
    const defaultFilters: FieldFilterDefinition<User>[] = [];

    const fakeDataStore = new FakeUserDataStore<User>(undefined, 80);
    const spyOnEndpoint = spyOn(fakeDataStore, 'getPagedData').and.callThrough();
    const dataSource = new TableVirtualScrollDataSource<User>(fakeDataStore);
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

      expect(spyOnEndpoint).toHaveBeenCalledTimes(expectedSpyCallingParameters.length);

      // Check calling parameters
      const callingParams = spyOnEndpoint.calls.allArgs();
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
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [] as FieldFilterDefinition<User>[]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [{ fieldName:'name', value:'User0037' }]],
      [{ 'startRowIndex':0,'numberOfRows':1 }, [], [{ fieldName:'name', value:'User0037' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [{ fieldName:'name', value:'User0037' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [{ fieldName:'name', value:'User0028' }]],
      [{ 'startRowIndex':0,'numberOfRows':1 }, [], [{ fieldName:'name', value:'User0028' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [{ fieldName:'name', value:'User0028' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [{ fieldName:'name', valueFrom:'User0003', valueTo:'User0030' }]],
      [{ 'startRowIndex':20,'numberOfRows':3 }, [], [{ fieldName:'name', valueFrom:'User0003', valueTo:'User0030' }]]
    ] as [ RequestRowsRange, FieldSortDefinition<User>[], FieldFilterDefinition<User>[] ][];

    const defaultSorts: FieldSortDefinition<User>[] = [];
    const defaultFilters: FieldFilterDefinition<User>[] = [];

    const fakeDataStore = new FakeUserDataStore<User>(undefined, 80);
    const spyOnEndpoint = spyOn(fakeDataStore, 'getPagedData').and.callThrough();
    const dataSource = new TableVirtualScrollDataSource<User>(fakeDataStore);
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

      expect(spyOnEndpoint).toHaveBeenCalledTimes(expectedSpyCallingParameters.length);

      // Check calling parameters
      const callingParams = spyOnEndpoint.calls.allArgs();
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
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [] as FieldFilterDefinition<User>[]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [{ fieldName: 'name', sortDirection: 'desc' }], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [{ fieldName: 'name', sortDirection: 'desc' }], [{ fieldName:'name', value:'User0037' }]],
      [{ 'startRowIndex':0,'numberOfRows':1 }, [{ fieldName: 'name', sortDirection: 'desc' }], [{ fieldName:'name', value:'User0037' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [{ fieldName:'name', value:'User0037' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [{ fieldName:'name', valueFrom:'User0068', valueTo: 'User0079' }]],
      [{ 'startRowIndex':0,'numberOfRows':2 }, [], [{ fieldName:'name', valueFrom:'User0068', valueTo: 'User0079' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [{ fieldName: 'id', sortDirection: 'desc' }], [{ fieldName:'name', valueFrom:'User0068', valueTo: 'User0079' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [{ fieldName: 'id', sortDirection: 'desc' }], [{ fieldName:'name', valueFrom:'User0003', valueTo:'User0030' }]],
      [{ 'startRowIndex':20,'numberOfRows':3 }, [{ fieldName: 'id', sortDirection: 'desc' }], [{ fieldName:'name', valueFrom:'User0003', valueTo:'User0030' }]]
    ] as [ RequestRowsRange, FieldSortDefinition<User>[], FieldFilterDefinition<User>[] ][];

    const defaultSorts: FieldSortDefinition<User>[] = [];
    const defaultFilters: FieldFilterDefinition<User>[] = [];

    const fakeDataStore = new FakeUserDataStore<User>(undefined, 80);
    const spyOnEndpoint = spyOn(fakeDataStore, 'getPagedData').and.callThrough();
    const dataSource = new TableVirtualScrollDataSource<User>(fakeDataStore);
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

      expect(spyOnEndpoint).toHaveBeenCalledTimes(expectedSpyCallingParameters.length);

      // Check calling parameters
      const callingParams = spyOnEndpoint.calls.allArgs();
      expect(callingParams).toEqual(expectedSpyCallingParameters);
    });

    // Complete source
    dataSource.disconnect();
  });

  it('should get 3 pages from datasource with sorting, filtering and trackBy', () => {
    const allEndpointParameters: pageRequest<User>[] = [
      { rowsRange:{ startRowIndex:0, numberOfRows:0 }, sorts:[], filters:[] },
      { rowsRange:{ startRowIndex:0, numberOfRows:1 }, sorts:[{ fieldName:'name', sortDirection:'desc' }], filters:[{ fieldName:'name', value:'User0037' }] as FieldFilterDefinitionSimple<User>[] },
      { rowsRange:{ startRowIndex:0, numberOfRows:2 }, sorts:[], filters:[{ fieldName:'name', valueFrom:'User0068', valueTo:'User0079' }] as FieldFilterDefinitionRange<User>[] },
      { rowsRange:{ startRowIndex:20, numberOfRows:3 }, sorts:[{ fieldName:'id', sortDirection:'desc' }], filters:[{ fieldName:'name', valueFrom:'User0003', valueTo:'User0030' }] as FieldFilterDefinitionRange<User>[] }
    ];

    // The spy also gets called by virtual scroller for getting the size of the datastore
    const expectedSpyCallingParameters = [
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [] as FieldFilterDefinition<User>[]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [{ fieldName: 'name', sortDirection: 'desc' }], []],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [{ fieldName: 'name', sortDirection: 'desc' }], [{ fieldName:'name', value:'User0037' }]],
      [{ 'startRowIndex':0,'numberOfRows':1 }, [{ fieldName: 'name', sortDirection: 'desc' }], [{ fieldName:'name', value:'User0037' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [{ fieldName:'name', value:'User0037' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [], [{ fieldName:'name', valueFrom:'User0068', valueTo: 'User0079' }]],
      [{ 'startRowIndex':0,'numberOfRows':2 }, [], [{ fieldName:'name', valueFrom:'User0068', valueTo: 'User0079' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [{ fieldName: 'id', sortDirection: 'desc' }], [{ fieldName:'name', valueFrom:'User0068', valueTo: 'User0079' }]],
      [{ 'startRowIndex':0,'numberOfRows':0 }, [{ fieldName: 'id', sortDirection: 'desc' }], [{ fieldName:'name', valueFrom:'User0003', valueTo:'User0030' }]],
      [{ 'startRowIndex':20,'numberOfRows':3 }, [{ fieldName: 'id', sortDirection: 'desc' }], [{ fieldName:'name', valueFrom:'User0003', valueTo:'User0030' }]]
    ] as [ RequestRowsRange, FieldSortDefinition<User>[], FieldFilterDefinition<User>[] ][];

    const defaultSorts: FieldSortDefinition<User>[] = [];
    const defaultFilters: FieldFilterDefinition<User>[] = [];

    const trackByUserId: TrackByFunction<User> =  (index: number, item: User) => item.id;
    const fakeDataStore = new FakeUserDataStore<User>(trackByUserId, 80);
    const spyOnEndpoint = spyOn(fakeDataStore, 'getPagedData').and.callThrough();
    const dataSource = new TableVirtualScrollDataSource<User>(fakeDataStore);
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

      expect(spyOnEndpoint).toHaveBeenCalledTimes(expectedSpyCallingParameters.length);

      // Check calling parameters
      const callingParams = spyOnEndpoint.calls.allArgs();
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
    ] as [ RequestRowsRange, FieldSortDefinition<User>[], FieldFilterDefinition<User>[] ][];

    const defaultSorts: FieldSortDefinition<User>[] = [];
    const defaultFilters: FieldFilterDefinition<User>[] = [];

    const fakeDataStore = new FakeUserDataStore<User>(undefined, 80);
    const spyOnEndpoint = spyOn(fakeDataStore, 'getPagedData').and.callThrough();
    const dataSource = new TableVirtualScrollDataSource<User>(fakeDataStore);
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

      expect(spyOnEndpoint).toHaveBeenCalledTimes(expectedSpyCallingParameters.length);

      // Check calling parameters
      const callingParams = spyOnEndpoint.calls.allArgs();
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
    ] as [ RequestRowsRange, FieldSortDefinition<User>[], FieldFilterDefinition<User>[] ][];

    const defaultSorts: FieldSortDefinition<User>[] = [];
    const defaultFilters: FieldFilterDefinition<User>[] = [];

    const fakeDataStore = new FakeUserDataStore<User>(undefined, 80);
    const spyOnEndpoint = spyOn(fakeDataStore, 'getPagedData').and.callThrough();
    const dataSource = new TableVirtualScrollDataSource<User>(fakeDataStore);
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

      expect(spyOnEndpoint).toHaveBeenCalledTimes(expectedSpyCallingParameters.length);

      // Check calling parameters
      const callingParams = spyOnEndpoint.calls.allArgs();
      expect(callingParams).toEqual(expectedSpyCallingParameters);
    });

    // Complete source
    dataSource.disconnect();
  });

  it('should get index of row in datasource', done => {
    const fakeDataStore = new FakeUserDataStore<User>(undefined, 80);
    const dataSource = new TableVirtualScrollDataSource<User>(fakeDataStore);

    const rowToGetIndexFor = { id: 55, name: 'User0055' } as User;
    dataSource.rowToIndex(rowToGetIndexFor)
      .subscribe(index => {
        expect(index).toBe(55);
        done();
      });
  });

  it('should get index of row in datasource with sorting', done => {
    const fakeDataStore = new FakeUserDataStore<Atom>();
    fakeDataStore.dataSet = sortableDataset;
    const dataSource = new TableVirtualScrollDataSource<Atom>(fakeDataStore);
    const sorts = [{ fieldName:'name', sortDirection:'desc' }] as FieldSortDefinition<Atom>[];
    dataSource.sorts = sorts;

    const rowToGetIndexFor = { id: 4, name: 'Lithium', weight: 6.941, symbol: 'Li' } as Atom;
    dataSource.rowToIndex(rowToGetIndexFor)
      .subscribe(index => {
        expect(index).toBe(3);
        done();
      });
  });

  it('should get index of row in datastore with filtering', done => {
    const fakeDataStore = new FakeUserDataStore<Atom>();
    fakeDataStore.dataSet = sortableDataset;
    const dataSource = new TableVirtualScrollDataSource<Atom>(fakeDataStore);
    const filters = [{ fieldName:'name', value:'Helium' }] as FieldFilterDefinition<Atom>[];
    dataSource.filters = filters;

    const rowToGetIndexFor = { id: 3, name: 'Helium', weight: 4.0026, symbol: 'He' } as Atom;
    dataSource.rowToIndex(rowToGetIndexFor)
      .subscribe(index => {
        expect(index).toBe(1);
        done();
      });
  });

  it('should get index of row in datastore with sorting and filtering', done => {
    const fakeDataStore = new FakeUserDataStore<Atom>();
    fakeDataStore.dataSet = sortableDataset;
    const dataSource = new TableVirtualScrollDataSource<Atom>(fakeDataStore);
    const sorts = [{ fieldName:'name', sortDirection:'desc' }, { fieldName:'id', sortDirection:'desc' }] as FieldSortDefinition<Atom>[];
    dataSource.sorts = sorts;
    const filters = [{ fieldName:'name', value:'Helium' }] as FieldFilterDefinition<Atom>[];
    dataSource.filters = filters;

    const rowToGetIndexFor = { id: 3, name: 'Helium', weight: 4.0026, symbol: 'He' } as Atom;
    dataSource.rowToIndex(rowToGetIndexFor)
      .subscribe(index => {
        expect(index).toBe(0);
        done();
      });
  });

  it('should get index of not existing row in datastore with sorting and filtering', done => {
    const fakeDataStore = new FakeUserDataStore<Atom>();
    fakeDataStore.dataSet = sortableDataset;
    const dataSource = new TableVirtualScrollDataSource<Atom>(fakeDataStore);
    const sorts = [{ fieldName:'name', sortDirection:'desc' }] as FieldSortDefinition<Atom>[];
    dataSource.sorts = sorts;
    const filters = [{ fieldName:'name', value:'Helium' }] as FieldFilterDefinition<Atom>[];
    dataSource.filters = filters;

    const rowToGetIndexFor = { id: 4, name: 'Lithium', weight: 6.941, symbol: 'Li' } as Atom;
    dataSource.rowToIndex(rowToGetIndexFor)
      .subscribe(index => {
        expect(index).toBe(-1);
        done();
      });
  });

  it('should indicate loading when getting index of row in datastore', () => {
    const fakeDataStore = new FakeUserDataStore<User>(undefined, 80);
    const dataSource = new TableVirtualScrollDataSource<User>(fakeDataStore);

    const rangeToDisplay = new Subject<RequestRowsRange>;
    dataSource.attachVirtualScroller(rangeToDisplay);
    dataSource.connect();
    let numberOfCalls = 0;

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
        1: { id: 55, name: 'User0055' } as User
      });

      // Use source to make dataSource emit values
      source.subscribe(
        row => {
          if (row !== undefined) {
            dataSource.rowToIndex(row)
             .subscribe(() => numberOfCalls++);
          }
        }
      );

      expectObservable(dataSource.loading$).toBe(expectedMarbles, expectedValues);

      flush();

      expect(numberOfCalls).toBe(1);
    });

    // Complete source
    dataSource.disconnect();
  });
});

class FakeUserDataStore<DatatableItem> implements DataStoreProvider<DatatableItem> {
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

  private trackBy: TrackByFunction<DatatableItem>;
  private fakeDataset: DatatableItem[] = [];
  private currentSortingDefinitions: FieldSortDefinition<DatatableItem>[] = [];

  constructor(myTrackBy?: TrackByFunction<DatatableItem>, defaultDatastoreSize = 0) {
    this._datastoreSize = defaultDatastoreSize;
    this.createDataset();
    this.trackBy = myTrackBy ?? this.defaultTrackBy;
  }

  getPagedData(
    rowsRange: RequestRowsRange,
    sorts?: FieldSortDefinition<DatatableItem>[],
    filters?: FieldFilterDefinition<DatatableItem>[]
  ): Observable<Page<DatatableItem>> {
    const selectedDataset = this.getRawDataSortedFiltered(sorts, filters);
    const startIndex = rowsRange.startRowIndex;
    const resultingData = selectedDataset.slice(startIndex, startIndex + rowsRange.numberOfRows);

    const newPage = {
      content: resultingData,
      startRowIndex: startIndex,
      returnedElements: resultingData.length,
      totalElements: this.datastoreSize,
      totalFilteredElements: selectedDataset.length
    } as Page<DatatableItem>;

    return of(newPage);
  }

  /**
   * Get the relative index of a row in the datastore (0..n) respecting
   * sorting and filtering.
   * @param row - row to get the index for
   * @param sorts - optional array of objects with the sorting definition
   * @param filters - optional array of objects with the filter definition
   * @returns index of the row in the datastore (0..n-1) or -1=row not in data store
   */
  indexOfRow(
    row: DatatableItem,
    sorts?: FieldSortDefinition<DatatableItem>[],
    filters?: FieldFilterDefinition<DatatableItem>[]
  ): Observable<number> {
    const selectedDataset = this.getRawDataSortedFiltered(sorts, filters);
    return of(selectedDataset.findIndex(currentRow => this.trackBy(0, row) === this.trackBy(0, currentRow)));
  }

  public set dataSet(newDataset : DatatableItem[]) {
    if (newDataset && Array.isArray(newDataset)) {
      this.fakeDataset = newDataset;
      this._datastoreSize = newDataset.length;
    }
  }

  private getRawDataSortedFiltered(
    sorts?: FieldSortDefinition<DatatableItem>[],
    filters?: FieldFilterDefinition<DatatableItem>[]
  ) {
    let selectedDataset = structuredClone(this.fakeDataset) as DatatableItem[];

    // Filter data
    if ((filters !== undefined) && Array.isArray(filters) && (filters.length > 0)) {
      selectedDataset = selectedDataset.filter((row: DatatableItem) => {
        return filters.reduce((isSelected: boolean, currentFilter: FieldFilterDefinition<DatatableItem>) => {
          if (currentFilter.value !== undefined) {
            isSelected ||= row[currentFilter.fieldName] === currentFilter.value;
          } else if ((currentFilter.valueFrom !== undefined) && (currentFilter.valueTo !== undefined)) {
            isSelected ||= (
              (row[currentFilter.fieldName] >= currentFilter.valueFrom) &&
              (row[currentFilter.fieldName] <= currentFilter.valueTo)
            );
          }
          return isSelected;
        }, false);
      });
    }

    // Sort data - only the first entry of the definitions is used
    if ((sorts !== undefined) && Array.isArray(sorts) && (sorts.length > 0)) {
      this.currentSortingDefinitions = sorts;
      selectedDataset.sort(this.compareFn);
    }

    return selectedDataset;
  }

  private createDataset() {
    this.fakeDataset = Array.from({ length: this.datastoreSize }, (v: unknown, k: number) => {
      const index = k;
      const newUser = { id: index, name: `User${index.toString().padStart(4, '0')}` } as DatatableItem;
      return newUser;
    });
  }

  /**
   * Default implementation of trackBy function.
   * This function is required, as in strict mode 'trackBy'
   * must not be undefined.
   * @param this - required by @typescript-eslint/unbound-method
   * @param index - index of the row
   * @param item - object with the row data
   * @returns stringified content of the item
   */
  private defaultTrackBy(this: void, index: number, item: DatatableItem): string {
    return JSON.stringify(item);
  }

  /**
   * Compare function for sorting the current dataset.
   * @param a - row to compare against
   * @param b - row to compare with parameter a
   * @returns 0:a===b; -1:a<b; 1:a>b
   */
  private compareFn = (a: DatatableItem, b: DatatableItem): number => {
    let result = 0;
    for (let i = 0; i < this.currentSortingDefinitions.length; i++) {
      const fieldName = this.currentSortingDefinitions[i].fieldName;
      const isAsc = (this.currentSortingDefinitions[i].sortDirection === 'asc');
      const valueA = a[fieldName] as string | number;
      const valueB = b[fieldName] as string | number;
      result = this.compare(valueA, valueB, isAsc);
      if (result !== 0) {
        break;
      }
    }
    return result;
  };

  /**
   * Simple sort comparator for string | number values.
   * @param a - 1st parameter to compare
   * @param b - 2nd parameter to compare
   * @param isAsc - is this an ascending comparison
   * @returns comparison result (0:a===b; -1:a<b; 1:a>b)
   */
  private compare(a: string | number, b: string | number, isAsc: boolean): number {
    return (a === b ? 0 : (a < b ? -1 : 1)) * (isAsc ? 1 : -1);
  }
}
