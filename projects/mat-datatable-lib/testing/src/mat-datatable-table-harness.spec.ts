import { HarnessLoader, parallel } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, TrackByFunction, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { MatDatatableHarness } from './mat-datatable-table-harness';

import {
  DataStoreProvider,
  FieldFilterDefinition,
  FieldSortDefinition,
  MatColumnDefinition,
  MatDatatableComponent,
  MatDatatableModule,
  MatSortDefinition,
  Page,
  RequestRowsRange,
  RowSelectionType
} from 'mat-datatable';

describe('MatDatatableHarness without footer', () => {
  let fixture: ComponentFixture<TableWithoutFooterHarnessTestComponent>;
  let loader: HarnessLoader;

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      imports: [
        MatDatatableModule,
        NoopAnimationsModule
      ],
      declarations: [
        TableWithoutFooterHarnessTestComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableWithoutFooterHarnessTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness for a mat-datatable', async () => {
    const tables = await loader.getAllHarnesses(MatDatatableHarness);

    expect(tables.length).toBe(1);
  });

  it('should get the different kinds of rows in the mat-datatable', async () => {
    const table = await loader.getHarness(MatDatatableHarness);
    const headerRows = await table.getHeaderRows();
    const footerRows = await table.getFooterRows();
    const rows = await table.getRows();

    expect(headerRows).toBeDefined();
    expect(headerRows.length).toBe(1);
    expect(footerRows).toBeDefined();
    expect(footerRows.length).toBe(0);
    expect(rows.length).toBe(10);
  });

  it('should get cells inside a row', async () => {
    const table = await loader.getHarness(MatDatatableHarness);
    const headerRows = await table.getHeaderRows();
    const rows = await table.getRows();

    const headerCells = await headerRows[0].getCellTextByIndex();
    const cells = (await parallel(() => rows.map(row => row.getCells()))).map(row => row.length);

    expect(headerCells.length).toEqual(4);
    expect(headerCells).toEqual(['No.', 'Name', 'Weight', 'Symbol']);

    expect(cells).toEqual([4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
  });

  it('should be able to get the text of a cell', async () => {
    const table = await loader.getHarness(MatDatatableHarness);
    const secondRow = (await table.getRows())[1];
    const cells = await secondRow.getCells();
    const cellTexts = await parallel(() => cells.map(cell => cell.getText()));

    expect(cellTexts).toEqual(['2', 'Helium', '4.0026', 'He']);
  });

  it('should be able to get the column name of a cell', async () => {
    const table = await loader.getHarness(MatDatatableHarness);
    const fifthRow = (await table.getRows())[1];
    const cells = await fifthRow.getCells();
    const cellColumnNames = await parallel(() => cells.map(cell => cell.getColumnName()));

    expect(cellColumnNames).toEqual(['position', 'name', 'weight', 'symbol']);
  });

  it('should be able to filter cells by text', async () => {
    const table = await loader.getHarness(MatDatatableHarness);
    const firstRow = (await table.getRows())[0];
    const cells = await firstRow.getCells({ text: '1.0079' });
    const cellTexts = await parallel(() => cells.map(cell => cell.getText()));

    expect(cellTexts).toEqual(['1.0079']);
  });

  it('should be able to filter cells by column name', async () => {
    const table = await loader.getHarness(MatDatatableHarness);
    const firstRow = (await table.getRows())[0];
    const cells = await firstRow.getCells({ columnName: 'symbol' });
    const cellTexts = await parallel(() => cells.map(cell => cell.getText()));

    expect(cellTexts).toEqual(['H']);
  });

  it('should be able to filter cells by regex', async () => {
    const table = await loader.getHarness(MatDatatableHarness);
    const firstRow = (await table.getRows())[0];
    const cells = await firstRow.getCells({ text: /^H/ });
    const cellTexts = await parallel(() => cells.map(cell => cell.getText()));

    expect(cellTexts).toEqual(['Hydrogen', 'H']);
  });

  it('should be able to get the mat-datatable text organized by columns', async () => {
    const table = await loader.getHarness(MatDatatableHarness);
    const text = await table.getCellTextByColumnName();

    expect(text).toEqual({
      position: {
        headerText: 'No.',
        text: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        footerText: undefined
      },
      name: {
        headerText: 'Name',
        text: [
          'Hydrogen',
          'Helium',
          'Lithium',
          'Beryllium',
          'Boron',
          'Carbon',
          'Nitrogen',
          'Oxygen',
          'Fluorine',
          'Neon'
        ],
        footerText: undefined
      },
      weight: {
        headerText: 'Weight',
        text: [
          '1.0079',
          '4.0026',
          '6.941',
          '9.0122',
          '10.811',
          '12.0107',
          '14.0067',
          '15.9994',
          '18.9984',
          '20.1797'
        ],
        footerText: undefined
      },
      symbol: {
        headerText: 'Symbol',
        text: ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'],
        footerText: undefined
      }
    });
  });

  it('should be able to get the mat-datatable text organized by rows', async () => {
    const table = await loader.getHarness(MatDatatableHarness);
    const text = await table.getCellTextByIndex();

    expect(text).toEqual([
      ['1', 'Hydrogen', '1.0079', 'H'],
      ['2', 'Helium', '4.0026', 'He'],
      ['3', 'Lithium', '6.941', 'Li'],
      ['4', 'Beryllium', '9.0122', 'Be'],
      ['5', 'Boron', '10.811', 'B'],
      ['6', 'Carbon', '12.0107', 'C'],
      ['7', 'Nitrogen', '14.0067', 'N'],
      ['8', 'Oxygen', '15.9994', 'O'],
      ['9', 'Fluorine', '18.9984', 'F'],
      ['10', 'Neon', '20.1797', 'Ne']
    ]);
  });

  it('should be able to get the cell text in a row organized by index', async () => {
    const table = await loader.getHarness(MatDatatableHarness);
    const rows = await table.getRows();

    expect(rows.length).toBeGreaterThan(0);
    expect(await rows[0].getCellTextByIndex()).toEqual(['1', 'Hydrogen', '1.0079', 'H']);
  });

  it('should be able to get the cell text in a row organized by columns', async () => {
    const table = await loader.getHarness(MatDatatableHarness);
    const rows = await table.getRows();

    expect(rows.length).toBeGreaterThan(0);
    expect(await rows[0].getCellTextByColumnName()).toEqual({
      position: '1',
      name: 'Hydrogen',
      weight: '1.0079',
      symbol: 'H'
    });
  });

  it('should rows of an empty table', async () => {
    const component = fixture.componentInstance;
    component.removeAllData();

    const table = await loader.getHarness(MatDatatableHarness);
    const headerRows = await table.getHeaderRows();
    const footerRows = await table.getFooterRows();
    const rows = await table.getRows();

    expect(headerRows).toBeDefined();
    expect(headerRows.length).toBe(1);
    expect(footerRows).toBeDefined();
    expect(footerRows.length).toBe(0);
    expect(rows.length).toBe(0);
  });
});

describe('MatDatatableHarness with footer', () => {
  let fixture: ComponentFixture<TableWithFooterHarnessTestComponent>;
  let loader: HarnessLoader;

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      imports: [
        MatDatatableModule,
        NoopAnimationsModule
      ],
      declarations: [
        TableWithFooterHarnessTestComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableWithFooterHarnessTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should get the different kinds of rows in the mat-datatable with footer', async () => {
    const table = await loader.getHarness(MatDatatableHarness);
    const headerRows = await table.getHeaderRows();
    const rows = await table.getRows();
    const footerRows = await table.getFooterRows();

    expect(headerRows).toBeDefined();
    expect(headerRows.length).toBe(1);
    expect(footerRows).toBeDefined();
    expect(footerRows.length).toBe(1);
    expect(rows.length).toBe(10);
  });

  it('should get cells inside a row with footer', async () => {
    const table = await loader.getHarness(MatDatatableHarness);
    const headerRows = await table.getHeaderRows();
    const footerRows = await table.getFooterRows();
    const rows = await table.getRows();

    const headerCells = await headerRows[0].getCellTextByIndex();
    const footerCells = await footerRows[0].getCellTextByIndex();
    const cells = (await parallel(() => rows.map(row => row.getCells()))).map(row => row.length);

    expect(headerCells.length).toEqual(4);
    expect(headerCells).toEqual(['No.', 'Name', 'Weight', 'Symbol']);

    expect(footerCells.length).toEqual(3);
    expect(footerCells).toEqual(['f1', 'f2', 'f4']);

    expect(cells).toEqual([4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
  });

  it('should be able to get the mat-datatable text organized by columns with footer', async () => {
    const table = await loader.getHarness(MatDatatableHarness);
    const text = await table.getCellTextByColumnName();

    expect(text).toEqual({
      position: {
        headerText: 'No.',
        text: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        footerText: 'f1'
      },
      name: {
        headerText: 'Name',
        text: [
          'Hydrogen',
          'Helium',
          'Lithium',
          'Beryllium',
          'Boron',
          'Carbon',
          'Nitrogen',
          'Oxygen',
          'Fluorine',
          'Neon'
        ],
        footerText: 'f2'
      },
      weight: {
        headerText: 'Weight',
        text: [
          '1.0079',
          '4.0026',
          '6.941',
          '9.0122',
          '10.811',
          '12.0107',
          '14.0067',
          '15.9994',
          '18.9984',
          '20.1797'
        ],
        footerText: undefined
      },
      symbol: {
        headerText: 'Symbol',
        text: ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'],
        footerText: 'f4'
      }
    });
  });
});

type TableHarnessTestRow = {
  position: number;
  name: string;
  weight: number;
  symbol: string;
}

class TableHarnessTestDataStore<DatatableItem> implements DataStoreProvider<DatatableItem> {
  private trackBy: TrackByFunction<DatatableItem>;
  private data: DatatableItem[];
  private currentSortingDefinitions: FieldSortDefinition<DatatableItem>[] = [];
  private unsortedData: DatatableItem[];

  constructor(testData: DatatableItem[], myTrackBy?: TrackByFunction<DatatableItem>) {
    this.unsortedData = structuredClone(testData);
    this.data = structuredClone(testData);
    this.currentSortingDefinitions = [];
    this.trackBy = myTrackBy ?? this.defaultTrackBy;
  }

  /**
   * Get a page of data from the datastore.
   * @param rowsRange - data to be selected
   * @param sorts - optional array of objects with the sorting definition
   * @param filters - optional array of objects with the filter definition
   * @returns observable for the data for the mat-datatable
   */
  getPagedData(
    rowsRange: RequestRowsRange,
    sorts?: FieldSortDefinition<DatatableItem>[],
    filters?: FieldFilterDefinition<DatatableItem>[]
  ) {
    const selectedDataset = this.getRawDataSortedFiltered(sorts, filters);

    // Save sorted and filtered data for later use
    this.data = selectedDataset;

    const startIndex = rowsRange.startRowIndex;
    const resultingData = this.data.slice(startIndex, startIndex + rowsRange.numberOfRows);
    const result = {
      content: resultingData,
      startRowIndex: startIndex,
      returnedElements: resultingData.length,
      totalElements: this.unsortedData.length,
      totalFilteredElements: selectedDataset.length
    } as Page<DatatableItem>;
    return of(result);
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

  /**
   * Remove all data from the datastore.
   */
  removeAllData() {
    this.unsortedData = [] as DatatableItem[];
    this.data = [] as DatatableItem[];
    this.currentSortingDefinitions = [];
  }

  private getRawDataSortedFiltered(
    sorts?: FieldSortDefinition<DatatableItem>[],
    filters?: FieldFilterDefinition<DatatableItem>[]
  ) {
    let selectedDataset = structuredClone(this.unsortedData);

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
    if ((sorts !== undefined) && Array.isArray(sorts)) {
      this.currentSortingDefinitions = sorts;
      if ((sorts.length > 0)) {
        selectedDataset.sort(this.compareFn);
      }
    }

    return selectedDataset;
  }

  /**
   * Default implementation of trackBy function.
   * This function is required, as in strict mode 'trackBy'
   * must not be undefined.
   * @param this - required by eslint rule "typescript-eslint/unbound-method"
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

// HTML for mat-datatable requires surrounding div with height set
@Component({
  template: `
  <div class="content-table">
    <mat-datatable #testTable
      [columnDefinitions]="columnDefinitions"
      [displayedColumns]="displayedColumns"
      [rowSelectionMode]="currentSelectionMode"
      [dataStoreProvider]="dataStore"
      [trackBy]="trackBy"
      (rowClick)="onRowClick($event)"
      (sortChange)="onSortChanged($event)"
      >
      loading...
    </mat-datatable>
  </div>
  `,
  styles: ['.content-table { height: 400px; }']
})
class TableWithoutFooterHarnessTestComponent {
  @ViewChild('testTable') matDataTable!: MatDatatableComponent<TableHarnessTestRow>;

  dataStore = new TableHarnessTestDataStore<TableHarnessTestRow>([
    { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
    { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
    { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
    { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
    { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
    { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
    { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
    { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
    { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
    { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' }
  ] as TableHarnessTestRow[]);
  protected columnDefinitions: MatColumnDefinition<TableHarnessTestRow>[] = [
    {
      columnId: 'position',
      header: 'No.',
      cell: (row: TableHarnessTestRow) => row.position.toString(),
      headerAlignment: 'right',
      cellAlignment: 'right',
      width: '5em'
    },
    {
      columnId: 'name',
      header: 'Name',
      cell: (row: TableHarnessTestRow) => row.name,
      headerAlignment: 'left',
      cellAlignment: 'left',
      width: '10em',
      sortable: true,
      resizable: true
    },
    {
      columnId: 'weight',
      header: 'Weight',
      cell: (row: TableHarnessTestRow) => row.weight.toString(),
      headerAlignment: 'right',
      cellAlignment: 'right',
      width: '10em',
      sortable: true
    },
    {
      columnId: 'symbol',
      header: 'Symbol',
      cell: (row: TableHarnessTestRow) => row.symbol,
      width: '20em',
      tooltip: (row: TableHarnessTestRow) => `Hint: ${row.symbol}`,
      showAsMailtoLink: true,
      resizable: true
    }
  ];
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  protected currentSorts: MatSortDefinition[] = [];
  protected readonly currentSorts$ = new BehaviorSubject<MatSortDefinition[]>([]);
  protected currentSelectionMode: RowSelectionType = 'none';
  protected selectedRowsAsString = '-';

  public removeAllData() {
    this.dataStore.removeAllData();
    this.currentSorts = [];
  }

  // arrow function is required to give dataStore.getPagedData the correct 'this'
  protected getData = (rowsRange: RequestRowsRange, sorts?: FieldSortDefinition<TableHarnessTestRow>[], filters?: FieldFilterDefinition<TableHarnessTestRow>[]) => {
    return this.dataStore.getPagedData(rowsRange, sorts, filters);
  };

  protected onRowClick($event: TableHarnessTestRow) {
    this.selectedRowsAsString = $event.name;
  }

  protected onSortChanged(currentSorts: MatSortDefinition[]) {
    this.currentSorts = currentSorts;
    this.currentSorts$.next(currentSorts);
  }
}

// HTML for mat-datatable requires surrounding div with height set
@Component({
  template: `
  <div class="content-table">
    <mat-datatable #testTable
      [columnDefinitions]="columnDefinitions"
      [displayedColumns]="displayedColumns"
      [rowSelectionMode]="currentSelectionMode"
      [withFooter]="true"
      [dataStoreProvider]="dataStore"
      [trackBy]="trackBy"
      (rowClick)="onRowClick($event)"
      (sortChange)="onSortChanged($event)"
      >
      loading...
    </mat-datatable>
  </div>
  `,
  styles: ['.content-table { height: 400px; }']
})
class TableWithFooterHarnessTestComponent {
  @ViewChild('testTable') matDataTable!: MatDatatableComponent<TableHarnessTestRow>;

  dataStore = new TableHarnessTestDataStore<TableHarnessTestRow>([
    { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
    { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
    { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
    { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
    { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
    { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
    { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
    { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
    { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
    { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' }
  ] as TableHarnessTestRow[]);
  protected columnDefinitions: MatColumnDefinition<TableHarnessTestRow>[] = [
    {
      columnId: 'position',
      header: 'No.',
      cell: (row: TableHarnessTestRow) => row.position.toString(),
      headerAlignment: 'right',
      cellAlignment: 'right',
      width: '5em',
      footer: 'f1',
      footerAlignment: 'right'
    },
    {
      columnId: 'name',
      header: 'Name',
      cell: (row: TableHarnessTestRow) => row.name,
      headerAlignment: 'left',
      cellAlignment: 'left',
      width: '10em',
      sortable: true,
      resizable: true,
      footer: 'f2',
      footerColumnSpan: 2
    },
    {
      columnId: 'weight',
      header: 'Weight',
      cell: (row: TableHarnessTestRow) => row.weight.toString(),
      headerAlignment: 'right',
      cellAlignment: 'right',
      width: '10em',
      sortable: true
    },
    {
      columnId: 'symbol',
      header: 'Symbol',
      cell: (row: TableHarnessTestRow) => row.symbol,
      width: '20em',
      tooltip: (row: TableHarnessTestRow) => `Hint: ${row.symbol}`,
      showAsMailtoLink: true,
      resizable: true,
      footer: 'f4'
    }
  ];
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  protected currentSorts: MatSortDefinition[] = [];
  protected readonly currentSorts$ = new BehaviorSubject<MatSortDefinition[]>([]);
  protected currentSelectionMode: RowSelectionType = 'none';
  protected selectedRowsAsString = '-';

  // arrow function is required to give dataStore.getPagedData the correct 'this'
  protected getData = (rowsRange: RequestRowsRange, sorts?: FieldSortDefinition<TableHarnessTestRow>[], filters?: FieldFilterDefinition<TableHarnessTestRow>[]) => {
    return this.dataStore.getPagedData(rowsRange, sorts, filters);
  };

  protected onRowClick($event: TableHarnessTestRow) {
    this.selectedRowsAsString = $event.name;
  }

  protected onSortChanged(currentSorts: MatSortDefinition[]) {
    this.currentSorts = currentSorts;
    this.currentSorts$.next(currentSorts);
  }
}
