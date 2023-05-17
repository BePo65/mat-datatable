/* eslint-disable @angular-eslint/component-class-suffix */

import { HarnessLoader, parallel } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of as observableOf  } from 'rxjs';

import { Page, RequestPageOfList, RequestSortDataList } from '../../interfaces/datasource-endpoint.interface';
import { MatColumnDefinition } from '../../interfaces/datatable-column-definition.interface';
import { MatSortDefinitionPos } from '../../interfaces/datatable-sort-definition.interface';
import { RowSelectionType } from '../mat-datatable.component';
import { MatDatatableModule } from '../mat-datatable.module';

import { MatHeaderRowHarness } from './mat-datatable-row-harness';
import { MatDatatableHarness } from './mat-datatable-table-harness';

describe('MatDatatableHarness', () => {
  let fixture: ComponentFixture<TableHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      imports: [
        MatDatatableModule,
        NoopAnimationsModule
      ],
      declarations: [
        TableHarnessTest
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableHarnessTest);
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
    const rows = await table.getRows();

    // TODO datasource is called 2x, but table harness does only get empty table
    expect(headerRows.length).toBe(1);
    expect(rows.length).toBe(10);
  });

  it('should get cells inside a header row', async () => {
    const header = await loader.getHarness(MatHeaderRowHarness);
    const headerContent = await header.getCellTextByIndex();

    expect(headerContent.length).toEqual(4);
    expect(headerContent).toEqual(['No.', 'Name', 'Weight', 'Symbol']);
  });

  it('should get cells inside a row', async () => {
    const table = await loader.getHarness(MatDatatableHarness);
    const headerRows = await table.getHeaderRows();
    const rows = await table.getRows();

    const headerCells = await parallel(() => headerRows.map(row => row.getCellTextByIndex()));

    expect(headerCells.length).toEqual(1);
    expect(headerCells[0].length).toEqual(4);
    expect(headerCells[0]).toEqual(['No.', 'Name', 'Weight', 'Symbol']);

    const cells = (await parallel(() => rows.map(row => row.getCells()))).map(row => row.length);

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
        headerText: ['No.'],
        text: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
      },
      name: {
        headerText: ['Name'],
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
        ]
      },
      weight: {
        headerText: ['Weight'],
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
        ]
      },
      symbol: {
        headerText: ['Symbol'],
        text: ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne']
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
});

type TableHarnessTestRow = {
  position: number;
  name: string;
  weight: number;
  symbol: string;
}

@Component({
  template: `
  <mat-datatable
    [datastoreGetter]="getData"
    [columnDefinitions]="columnDefinitions"
    [displayedColumns]="displayedColumns"
    [rowSelectionMode]="currentSelectionMode"
    (rowClick)="onRowClick($event)"
    (sortChange)="onSortChanged($event)">
    loading...
  </mat-datatable>
  `
})
class TableHarnessTest {
  dataStore = new TableHarnessTestDataStore([
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
  protected currentSorts: MatSortDefinitionPos[] = [];
  protected readonly currentSorts$ = new BehaviorSubject<MatSortDefinitionPos[]>([]);
  protected currentSelectionMode: RowSelectionType = 'none';
  protected selectedRowsAsString = '-';

  // arrow function is required to give dataStore.getPagedData the correct 'this'
  protected getData = (rowsRange: RequestPageOfList, filters?: object, sorts?: RequestSortDataList<TableHarnessTestRow>[]) => {
    return this.dataStore.getPagedData(rowsRange, filters, sorts);
  };

  protected onRowClick($event: TableHarnessTestRow) {
    this.selectedRowsAsString = $event.name;
  }

  protected onSortChanged(currentSorts: MatSortDefinitionPos[]) {
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
   * @param filters - optional object with the filter definition
   * @param sorts - optional array of objects with the sorting definition
   * @returns observable for the data for the mat-datatable
   */
  getPagedData(
    rowsRange: RequestPageOfList,
    filters?: TableHarnessTestFilter,
    sorts?: RequestSortDataList<TableHarnessTestRow>[]
  )  {
    if ((sorts !== undefined) && !this.areSortDefinitionsEqual(this.currentSortingDefinitions, sorts)) {
      this.currentSortingDefinitions = sorts;
      this.data = this.getSortedData();
    }
    const startIndex = rowsRange.page * rowsRange.numberOfRows;
    const resultingData = this.data.splice(startIndex, rowsRange.numberOfRows);
    const result = {
      content: resultingData,
      pageNumber: rowsRange.page,
      returnedElements: resultingData.length,
      totalElements: this.data.length
    } as Page<TableHarnessTestRow>;
    return observableOf(result);
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
