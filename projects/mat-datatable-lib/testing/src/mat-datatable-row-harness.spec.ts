import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, TrackByFunction, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { MatFooterRowHarness, MatHeaderRowHarness, MatRowHarness } from './mat-datatable-row-harness';

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

describe('MatRowHarness', () => {
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

  beforeEach( async () => {
    fixture = TestBed.createComponent(TableWithoutFooterHarnessTestComponent);
    fixture.autoDetectChanges();

    // await to virtual scroll render finish
    await fixture.whenStable();
    await fixture.whenRenderingDone();

    loader = TestbedHarnessEnvironment.loader(fixture);
  });

 it('should get array of MatRowCellHarness of cells in first row', async () => {
    const rowHarness = await loader.getHarness(MatRowHarness);
    const cellsHarnesses = await rowHarness.getCells();

    // 'getHarness' always gets the first row of a table
    expect(cellsHarnesses.length).toEqual(4);
    expect(cellsHarnesses[0].constructor.name).toEqual('MatRowCellHarness');
    expect(await cellsHarnesses[0].getText()).toEqual('1');
    expect(await cellsHarnesses[1].getText()).toEqual('Hydrogen');
    expect(await cellsHarnesses[2].getText()).toEqual('1.0079');
    expect(await cellsHarnesses[3].getText()).toEqual('H');
  });

  it('should get array of MatRowCellHarness of cells in another row', async () => {
    const rowHarnesses = await loader.getAllHarnesses(MatRowHarness);

    expect(rowHarnesses.length).toBe(10);

    const cellsHarnesses = await rowHarnesses[2].getCells();

    expect(cellsHarnesses.length).toEqual(4);
    expect(cellsHarnesses[0].constructor.name).toEqual('MatRowCellHarness');
    expect(await cellsHarnesses[0].getText()).toEqual('3');
    expect(await cellsHarnesses[1].getText()).toEqual('Lithium');
    expect(await cellsHarnesses[2].getText()).toEqual('6.941');
    expect(await cellsHarnesses[3].getText()).toEqual('Li');
  });

  it('should get array of MatRowCellHarness of selected cells in row - filter by element content', async () => {
    const rowHarness = await loader.getHarness(MatRowHarness);
    const rowCellsHarnesses = await rowHarness.getCells({ columnName: 'name' });

    expect(rowCellsHarnesses.length).toEqual(1);
    expect(rowCellsHarnesses[0].constructor.name).toEqual('MatRowCellHarness');
    expect(await rowCellsHarnesses[0].getText()).toEqual('Hydrogen');
  });

  it('should get array of MatRowCellHarness of selected cells in row - filter by isSingleLine', async () => {
    const rowHarness = await loader.getHarness(MatRowHarness);
    const rowCellsHarnesses = await rowHarness.getCells({ isSingleLine: true });

    expect(rowCellsHarnesses.length).toEqual(1);
    expect(rowCellsHarnesses[0].constructor.name).toEqual('MatRowCellHarness');
    expect(await rowCellsHarnesses[0].getText()).toEqual('Hydrogen');
  });

  it('should get array of content of cells in 1st row', async () => {
    const rowHarness = await loader.getHarness(MatRowHarness);
    const rowContent = await rowHarness.getCellTextByIndex();

    expect(rowContent.length).toEqual(4);
    expect(rowContent).toEqual(['1', 'Hydrogen', '1.0079', 'H']);
  });

  it('should get array of content of selected cells in 1st row - filter with regex', async () => {
    const rowHarness = await loader.getHarness(MatRowHarness);
  const rowContent = await rowHarness.getCellTextByIndex({ text: /H.*/ });

    expect(rowContent.length).toEqual(2);
    expect(rowContent).toEqual(['Hydrogen', 'H']);
  });

  it('should get array of content of selected cells in 1st row - filter by column name', async () => {
    const rowHarness = await loader.getHarness(MatRowHarness);
    const rowContent = await rowHarness.getCellTextByIndex({ columnName: 'name' });

    expect(rowContent.length).toEqual(1);
    expect(rowContent).toEqual(['Hydrogen']);
  });

  it('should get array of cells in 1st row as object', async () => {
    const rowHarness = await loader.getHarness(MatRowHarness);
    const rowContent = await rowHarness.getCellTextByColumnName();
    const columnNames = Object.getOwnPropertyNames(rowContent);
    const columnValues = Object.values(rowContent);

    expect(columnValues.length).toEqual(4);
    expect(columnNames).toEqual(['position', 'name', 'weight', 'symbol']);
    expect(columnValues).toEqual(['1', 'Hydrogen', '1.0079', 'H']);
  });

  it('should get array of MatRowHarness - filter by element content with string', async () => {
    const filteredRowHarnesses = await loader.getAllHarnesses(MatRowHarness.with(
      { rowCellsContent: {
        weight: '9.0122'
      }}
    ));

    expect(filteredRowHarnesses.length).toEqual(1);
  });

  it('should get array of MatRowHarness - filter by element content without match', async () => {
    const filteredRowHarnesses = await loader.getAllHarnesses(MatRowHarness.with(
      { rowCellsContent: {
        weight: '12'
      }}
    ));

    expect(filteredRowHarnesses.length).toEqual(0);
  });

  it('should get array of MatRowHarness - filter by element content with regexp', async () => {
    const filteredRowHarnesses = await loader.getAllHarnesses(MatRowHarness.with(
      { rowCellsContent: {
        name: /(H.+|Boron)/
      }}
    ));

    expect(filteredRowHarnesses.length).toEqual(3);
  });

  it('should get array of MatRowHarness - filter by element content with mixed filters', async () => {
    const filteredRowHarnesses = await loader.getAllHarnesses(MatRowHarness.with(
      { rowCellsContent: {
        name: /(H.+|Boron)/,
        weight: '4.0026'
      }}
    ));

    expect(filteredRowHarnesses.length).toEqual(1);

    const rowContent = await filteredRowHarnesses[0].getCellTextByIndex({ columnName: 'name' });

    expect(rowContent).toEqual(['Helium']);
  });

  it('should get array of MatRowHarness - filter by element content with illegal column name', async () => {
    const filteredRowHarnesses = await loader.getAllHarnesses(MatRowHarness.with(
      { rowCellsContent: {
        illegalCol: 'any value'
      }}
    ));

    expect(filteredRowHarnesses.length).toEqual(0);
  });

  it('should get width of a data cells', async () => {
    const dataRowHarness = await loader.getHarness(MatRowHarness);
    const rowCellsHarnesses = await dataRowHarness.getCells();

    expect(rowCellsHarnesses.length).toEqual(4);

    const widthCol1 = await rowCellsHarnesses[0].getColumnWidth();
    const widthCol2 = await rowCellsHarnesses[1].getColumnWidth();
    const widthCol3 = await rowCellsHarnesses[2].getColumnWidth();
    const widthCol4 = await rowCellsHarnesses[3].getColumnWidth();

    expect(widthCol1).toBeGreaterThan(0);
    expect(widthCol2).toBeCloseTo(widthCol1 * 2, 1);
    expect(widthCol3).toBeCloseTo(widthCol2, 1);
    expect(widthCol4).toBeCloseTo(widthCol2 * 2, 1);
  });
});

describe('MatHeaderRowHarness', () => {
  let fixture: ComponentFixture<TableWithoutFooterHarnessTestComponent>;
  let loader: HarnessLoader;
  let component: TableWithoutFooterHarnessTestComponent;

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
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should get array of MatRowCellHarness of cells in header row', async () => {
    const headerRowHarness = await loader.getHarness(MatHeaderRowHarness);
    const headerCellsHarnesses = await headerRowHarness.getCells();

    expect(headerCellsHarnesses.length).toEqual(4);
    expect(headerCellsHarnesses[0].constructor.name).toEqual('MatHeaderCellHarness');
  });

  it('should get array of MatRowCellHarness of selected cells in header row - filter by element content', async () => {
    const headerRowHarness = await loader.getHarness(MatHeaderRowHarness);
    const headerCellsHarnesses = await headerRowHarness.getCells({ columnName: 'name' });

    expect(headerCellsHarnesses.length).toEqual(1);
    expect(headerCellsHarnesses[0].constructor.name).toEqual('MatHeaderCellHarness');
    expect(await headerCellsHarnesses[0].getText()).toEqual('Name');
  });

  it('should get array of content of cells in header row', async () => {
    const headerRowHarness = await loader.getHarness(MatHeaderRowHarness);
    const headerContent = await headerRowHarness.getCellTextByIndex();

    expect(headerContent.length).toEqual(4);
    expect(headerContent).toEqual(['No.', 'Name', 'Weight', 'Symbol']);
  });

  // Sorting indicator should have no impact on 'getCellTextByIndex'
  it('should get array of content of cells in header row with sorted columns', async () => {
    component.matDataTable.sortDefinitions = [
      { columnId: 'name', direction: 'desc' },
      { columnId: 'weight', direction: 'asc' }
    ] as MatSortDefinition[];

    const headerRowHarness = await loader.getHarness(MatHeaderRowHarness);
    const headerContent = await headerRowHarness.getCellTextByIndex();

    expect(headerContent.length).toEqual(4);
    expect(headerContent).toEqual(['No.', 'Name', 'Weight', 'Symbol']);
  });

  it('should get array of content of selected cells in header row - filter with regex', async () => {
    const headerRowHarness = await loader.getHarness(MatHeaderRowHarness);
    const headerContent = await headerRowHarness.getCellTextByIndex({ text: /N.+/ });

    expect(headerContent.length).toEqual(2);
    expect(headerContent).toEqual(['No.', 'Name']);
  });

  it('should get array of content of selected cells in header as row - filter by column name', async () => {
    const headerRowHarness = await loader.getHarness(MatHeaderRowHarness);
    const headerContent = await headerRowHarness.getCellTextByIndex({ columnName: 'name' });

    expect(headerContent.length).toEqual(1);
    expect(headerContent).toEqual(['Name']);
  });

  it('should get array of cells in header row as object', async () => {
    const headerRowHarness = await loader.getHarness(MatHeaderRowHarness);
    const headerContent = await headerRowHarness.getCellTextByColumnName();
    const columnNames = Object.getOwnPropertyNames(headerContent);
    const columnValues = Object.values(headerContent);

    expect(columnValues.length).toEqual(4);
    expect(columnNames).toEqual(['position', 'name', 'weight', 'symbol']);
    expect(columnValues).toEqual(['No.', 'Name', 'Weight', 'Symbol']);
  });

  it('should get width of a header cells', async () => {
    const headerRowHarness = await loader.getHarness(MatHeaderRowHarness);
    const headerCellsHarnesses = await headerRowHarness.getCells();

    expect(headerCellsHarnesses.length).toEqual(4);

    const widthCol1 = await headerCellsHarnesses[0].getColumnWidth();
    const widthCol2 = await headerCellsHarnesses[1].getColumnWidth();
    const widthCol3 = await headerCellsHarnesses[2].getColumnWidth();
    const widthCol4 = await headerCellsHarnesses[3].getColumnWidth();

    expect(widthCol1).toBeGreaterThan(0);
    expect(widthCol2).toBeCloseTo(widthCol1 * 2, 1);
    expect(widthCol3).toBeCloseTo(widthCol2, 1);
    expect(widthCol4).toBeCloseTo(widthCol2 * 2, 1);
  });
});

describe('MatFooterRowHarness', () => {
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

  it('should get array of MatRowCellHarness of cells in footer row', async () => {
    const footerRowHarness = await loader.getHarness(MatFooterRowHarness);
    const footerCellsHarnesses = await footerRowHarness.getCells();

    expect(footerCellsHarnesses.length).toEqual(3);
    expect(footerCellsHarnesses[0].constructor.name).toEqual('MatFooterCellHarness');
  });

  it('should get array of MatRowCellHarness of selected cells in footer row - filter by element content', async () => {
    const footerRowHarness = await loader.getHarness(MatFooterRowHarness);
    const footerCellsHarnesses = await footerRowHarness.getCells({ columnName: 'name' });

    expect(footerCellsHarnesses.length).toEqual(1);
    expect(footerCellsHarnesses[0].constructor.name).toEqual('MatFooterCellHarness');
    expect(await footerCellsHarnesses[0].getText()).toEqual('f2');
  });

  it('should get array of content of cells in footer row', async () => {
    const footerRowHarness = await loader.getHarness(MatFooterRowHarness);
    const footerContent = await footerRowHarness.getCellTextByIndex();

    expect(footerContent.length).toEqual(3);
    expect(footerContent).toEqual(['f1', 'f2', 'f4']);
  });

  it('should get array of content of selected cells in footer row - filter with regex', async () => {
    const footerRowHarness = await loader.getHarness(MatFooterRowHarness);
    const footerContent = await footerRowHarness.getCellTextByIndex({ text: /.+[14]/ });

    expect(footerContent.length).toEqual(2);
    expect(footerContent).toEqual(['f1', 'f4']);
  });

  it('should get array of content of selected cells in footer as row - filter by column name', async () => {
    const footerRowHarness = await loader.getHarness(MatFooterRowHarness);
    const footerContent = await footerRowHarness.getCellTextByIndex({ columnName: 'name' });

    expect(footerContent.length).toEqual(1);
    expect(footerContent).toEqual(['f2']);
  });

  it('should get array of cells in footer row as object', async () => {
    const footerRowHarness = await loader.getHarness(MatFooterRowHarness);
    const footerContent = await footerRowHarness.getCellTextByColumnName();
    const columnNames = Object.getOwnPropertyNames(footerContent);
    const columnValues = Object.values(footerContent);

    expect(columnValues.length).toEqual(3);
    expect(columnNames).toEqual(['position', 'name', 'symbol']);
    expect(columnValues).toEqual(['f1', 'f2', 'f4']);
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
   * Paginate the data.
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
      width: '5em',
      footer: 'f1',
      footerAlignment: 'right'
    },
    {
      columnId: 'name',
      header: 'Name',
      cell: (row: TableHarnessTestRow) => row.name,
      headerAlignment: 'left',
      showAsSingleLine: true,
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

  protected trackBy(this: void, index: number, item: TableHarnessTestRow) {
    return item?.position ?? -1;
  }

  protected onRowClick($event: TableHarnessTestRow) {
    this.selectedRowsAsString = $event.name;
  }

  protected onSortChanged(currentSorts: MatSortDefinition[]) {
    this.currentSorts = currentSorts;
    this.currentSorts$.next(currentSorts);
  }
}
