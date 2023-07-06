import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of } from 'rxjs';

import { Page, RequestPageOfList, RequestSortDataList } from '../../interfaces/datasource-endpoint.interface';
import { MatColumnDefinition } from '../../interfaces/datatable-column-definition.interface';
import { MatSortDefinition } from '../../interfaces/datatable-sort-definition.interface';
import { MatDatatableComponent, RowSelectionType } from '../mat-datatable.component';
import { MatDatatableModule } from '../mat-datatable.module';

import { MatHeaderRowHarness, MatRowHarness } from './mat-datatable-row-harness';

describe('MatRowHarness', () => {
  let fixture: ComponentFixture<TableHarnessTestComponent>;
  let loader: HarnessLoader;

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      imports: [
        MatDatatableModule,
        NoopAnimationsModule
      ],
      declarations: [
        TableHarnessTestComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableHarnessTestComponent);
    fixture.detectChanges();
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
  let fixture: ComponentFixture<TableHarnessTestComponent>;
  let loader: HarnessLoader;
  let component: TableHarnessTestComponent;

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      imports: [
        MatDatatableModule,
        NoopAnimationsModule
      ],
      declarations: [
        TableHarnessTestComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableHarnessTestComponent);
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
    component.matDataTable.sort.sortDefinitions = [
      { active: 'name', direction: 'desc' },
      { active: 'weight', direction: 'asc' }
    ];

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

type TableHarnessTestRow = {
  position: number;
  name: string;
  weight: number;
  symbol: string;
}

type EmptyTestFilter = object;

@Component({
  template: `
  <mat-datatable #testTable
    [columnDefinitions]="columnDefinitions"
    [displayedColumns]="displayedColumns"
    [rowSelectionMode]="currentSelectionMode"
    [datastoreGetter]="getData"
    (rowClick)="onRowClick($event)"
    (sortChange)="onSortChanged($event)">
    loading...
  </mat-datatable>
  `
})
class TableHarnessTestComponent {
  @ViewChild('testTable') matDataTable!: MatDatatableComponent<TableHarnessTestRow, EmptyTestFilter>;

  dataStore = new TableHarnessTestDataStore<TableHarnessTestRow, EmptyTestFilter>([
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
      showAsSingleLine: true,
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

  // arrow function is required to give dataStore.getPagedData the correct 'this'
  protected getData = (rowsRange: RequestPageOfList, sorts?: RequestSortDataList<TableHarnessTestRow>[], filters?: object) => {
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

class TableHarnessTestDataStore<TableHarnessTestRow, TableHarnessTestFilter> {
  private data: TableHarnessTestRow[];
  private currentSortingDefinitions: RequestSortDataList<TableHarnessTestRow>[] = [];
  private unsortedData: TableHarnessTestRow[];

  constructor(testData: TableHarnessTestRow[]) {
    this.unsortedData = structuredClone(testData) as TableHarnessTestRow[];
    this.data = structuredClone(testData) as TableHarnessTestRow[];
    this.currentSortingDefinitions = [];
  }

  /**
   * Paginate the data.
   * @param rowsRange - data to be selected
   * @param sorts - optional array of objects with the sorting definition
   * @param filters - optional object with the filter definition
   * @returns observable for the data for the mat-datatable
   */
  getPagedData(
    rowsRange: RequestPageOfList,
    sorts?: RequestSortDataList<TableHarnessTestRow>[],
    filters?: TableHarnessTestFilter // eslint-disable-line @typescript-eslint/no-unused-vars
  )  {
    if ((sorts !== undefined) && !this.areSortDefinitionsEqual(this.currentSortingDefinitions, sorts)) {
      this.currentSortingDefinitions = sorts;
      this.data = this.getSortedData();
    }
    const startIndex = rowsRange.page * rowsRange.numberOfRows;
    const resultingData = this.data.slice(startIndex, startIndex + rowsRange.numberOfRows);
    const result = {
      content: resultingData,
      pageNumber: rowsRange.page,
      returnedElements: resultingData.length,
      totalElements: this.data.length
    } as Page<TableHarnessTestRow>;
    return of(result);
  }

  /**
   * Compare 2 sort definitions.
   * @param a - 1st sort definition
   * @param b - 2nd sort definition
   * @returns true= both definitions are equal
   */
  private areSortDefinitionsEqual(a: RequestSortDataList<TableHarnessTestRow>[], b: RequestSortDataList<TableHarnessTestRow>[]): boolean {
    return a.length === b.length &&
    a.every((element, index) => (element.fieldName === b[index].fieldName) &&
      element.order === b[index].order);
  }

  private getSortedData(): TableHarnessTestRow[] {
    const baseData = structuredClone(this.unsortedData) as TableHarnessTestRow[];
    if (!this.currentSortingDefinitions || this.currentSortingDefinitions.length === 0) {
      return baseData;
    }

    return baseData.sort((a, b) => {
      let result = 0;
      for (let i = 0; i < this.currentSortingDefinitions.length; i++) {
        const fieldName = this.currentSortingDefinitions[i].fieldName;
        const isAsc = (this.currentSortingDefinitions[i].order === 'asc');
        const valueA = a[fieldName] as string | number;
        const valueB = b[fieldName] as string | number;
        result = compare(valueA, valueB, isAsc);
        if (result !== 0) {
          break;
        }
      }
      return result;
    });
  }
}

/**
 * Simple sort comparator for string | number values.
 * @param a - 1st parameter to compare
 * @param b - 2nd parameter to compare
 * @param isAsc - is this an ascending comparison
 * @returns comparison result
 */
const compare = (a: string | number, b: string | number, isAsc: boolean): number => {
  return (a === b ? 0 : (a < b ? -1 : 1)) * (isAsc ? 1 : -1);
};
