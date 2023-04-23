import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, ViewChild } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  BehaviorSubject,
  map,
  merge,
  Observable,
  of as observableOf,
  Subject
} from 'rxjs';

import { MatMultiSortHarness } from '../directives/datatable-sort/testing';
import { MatColumnDefinition } from '../interfaces/datatable-column-definition.interface';
import { MatDatatableDataSource } from '../interfaces/datatable-datasource.class';
import { MatSortDefinition, MatSortDefinitionPos } from '../interfaces/datatable-sort-definition.interface';

import { MatDatatableComponent, RowSelectionType } from './mat-datatable.component';
import { MatDatatableModule } from './mat-datatable.module';
import { MatDatatableHarness, MatHeaderRowHarness } from './testing';

// TODO how to set the paginator pageSize?

describe('MatDatatableComponent', () => {
  describe('single table', () => {
    let fixture: ComponentFixture<DatatableTestComponent>;
    let loader: HarnessLoader;
    let component: DatatableTestComponent;

    beforeEach(waitForAsync(() => {
      void TestBed.configureTestingModule({
        imports: [
          MatDatatableModule,
          NoopAnimationsModule
        ],
        declarations: [
          DatatableTestComponent,
          DatatableEmptyTestComponent
        ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(DatatableTestComponent);
      fixture.detectChanges();
      component = fixture.componentInstance;
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should create an instance of the mat-datatable component', () => {
      expect(component).toBeTruthy();
    });

    it('should create a mat-datatable harness', async () => {
      const tables = await loader.getAllHarnesses(MatDatatableHarness);

      expect(tables.length).toBe(1);
    });

    it('should create a table with correct header', async () => {
      const table = await loader.getHarness(MatDatatableHarness);
      const headerRows = await table.getHeaderRows();
      const header = await loader.getHarness(MatHeaderRowHarness);
      const headerContent = await header.getCellTextByIndex();

      expect(headerRows.length).toBe(1);
      expect(headerContent.length).toEqual(4);
      expect(headerContent).toEqual(['No.', 'Name', 'Weight', 'Symbol']);
    });

    it('should create a table with correct data', async () => {
      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();
      const rowContent = await table.getCellTextByIndex();

      expect(rows.length).toBe(10);
      expect(rowContent).toEqual([
        ['1', 'Hydrogen', '1.0079', 'H'],
        ['2', 'Helium', '6.1234', 'He'],
        ['3', 'Helium', '4.0026', 'He'],
        ['4', 'Lithium', '6.941', 'Li'],
        ['5', 'Beryllium', '9.0122', 'Be'],
        ['6', 'Carbon', '12.0107', 'C'],
        ['7', 'Nitrogen', '14.0067', 'N'],
        ['8', 'Oxygen', '15.9994', 'O'],
        ['9', 'Fluorine', '18.9984', 'F'],
        ['10', 'Neon', '20.1797', 'Ne']
      ]);
    });

    it('should create a table without data', async () => {
      const fixtureEmpty = TestBed.createComponent(DatatableEmptyTestComponent);
      fixtureEmpty.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixtureEmpty);

      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();

      expect(rows.length).toBe(0);
    });

    it('should not sort a table when clicking on a non sortable column', async () => {
      const sort = await loader.getHarness(MatMultiSortHarness);
      let headers = await sort.getSortHeaders({sortDirection: ''});

      expect(headers).toHaveSize(4);

      await headers[0].click();
      headers = await sort.getSortHeaders({sortDirection: 'asc'});

      expect(headers).toHaveSize(0);

      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();
      const rowContent = await table.getCellTextByIndex();

      expect(rows.length).toBe(10);
      expect(rowContent).toEqual([
        ['1', 'Hydrogen', '1.0079', 'H'],
        ['2', 'Helium', '6.1234', 'He'],
        ['3', 'Helium', '4.0026', 'He'],
        ['4', 'Lithium', '6.941', 'Li'],
        ['5', 'Beryllium', '9.0122', 'Be'],
        ['6', 'Carbon', '12.0107', 'C'],
        ['7', 'Nitrogen', '14.0067', 'N'],
        ['8', 'Oxygen', '15.9994', 'O'],
        ['9', 'Fluorine', '18.9984', 'F'],
        ['10', 'Neon', '20.1797', 'Ne']
      ]);
    });

    it('should sort a table when clicking on a sortable column', async () => {
      const sort = await loader.getHarness(MatMultiSortHarness);
      let headers = await sort.getSortHeaders({sortDirection: ''});

      expect(headers).toHaveSize(4);

      await headers[1].click();
      headers = await sort.getSortHeaders({sortDirection: 'asc'});

      expect(headers).toHaveSize(1);

      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();
      const rowContent = await table.getCellTextByIndex();

      expect(rows.length).toBe(10);
      expect(rowContent).toEqual([
        ['5', 'Beryllium', '9.0122', 'Be'],
        ['6', 'Carbon', '12.0107', 'C'],
        ['9', 'Fluorine', '18.9984', 'F'],
        ['2', 'Helium', '6.1234', 'He'],
        ['3', 'Helium', '4.0026', 'He'],
        ['1', 'Hydrogen', '1.0079', 'H'],
        ['4', 'Lithium', '6.941', 'Li'],
        ['10', 'Neon', '20.1797', 'Ne'],
        ['7', 'Nitrogen', '14.0067', 'N'],
        ['8', 'Oxygen', '15.9994', 'O']
      ]);
    });

    it('should extend sorting by clicking on another column', async () => {
      const sort = await loader.getHarness(MatMultiSortHarness);
      let headers = await sort.getSortHeaders({sortDirection: ''});

      expect(headers).toHaveSize(4);

      await headers[1].click();
      await headers[2].click();
      headers = await sort.getSortHeaders({sortDirection: 'asc'});

      expect(headers).toHaveSize(2);

      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();
      const rowContent = await table.getCellTextByIndex();

      expect(rows.length).toBe(10);
      expect(rowContent).toEqual([
        ['5', 'Beryllium', '9.0122', 'Be'],
        ['6', 'Carbon', '12.0107', 'C'],
        ['9', 'Fluorine', '18.9984', 'F'],
        ['3', 'Helium', '4.0026', 'He'],
        ['2', 'Helium', '6.1234','He'],
        ['1', 'Hydrogen', '1.0079', 'H'],
        ['4', 'Lithium', '6.941', 'Li'],
        ['10', 'Neon', '20.1797', 'Ne'],
        ['7', 'Nitrogen', '14.0067', 'N'],
        ['8', 'Oxygen', '15.9994', 'O']
      ]);
    });

    it('should change sorting by clicking on already sorted column', async () => {
      const sort = await loader.getHarness(MatMultiSortHarness);
      let headers = await sort.getSortHeaders({sortDirection: ''});

      expect(headers).toHaveSize(4);

      await headers[1].click();
      await headers[2].click();
      await headers[1].click();
      headers = await sort.getSortHeaders({sortDirection: 'asc'});

      expect(headers).toHaveSize(1);

      headers = await sort.getSortHeaders({sortDirection: 'desc'});

      expect(headers).toHaveSize(1);

      const sortDefinitions = component.matDataTable.sort.sortDefinitions;

      expect(sortDefinitions).toEqual([
        {active: 'name', direction: 'desc'},
        {active: 'weight', direction: 'asc'}
      ]);

      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();
      const rowContent = await table.getCellTextByIndex();

      expect(rows.length).toBe(10);
      expect(rowContent).toEqual([
        ['8', 'Oxygen', '15.9994', 'O'],
        ['7', 'Nitrogen', '14.0067', 'N'],
        ['10', 'Neon', '20.1797', 'Ne'],
        ['4', 'Lithium', '6.941', 'Li'],
        ['1', 'Hydrogen', '1.0079', 'H'],
        ['3', 'Helium', '4.0026', 'He'],
        ['2', 'Helium', '6.1234','He'],
        ['9', 'Fluorine', '18.9984', 'F'],
        ['6', 'Carbon', '12.0107', 'C'],
        ['5', 'Beryllium', '9.0122', 'Be']
      ]);
    });

    it('should sort table by setting the sort definitions', async () => {
      const sort = await loader.getHarness(MatMultiSortHarness);
      let headers = await sort.getSortHeaders({sortDirection: ''});

      component.matDataTable.sort.sortDefinitions = [
        {active: 'name', direction: 'desc'},
        {active: 'weight', direction: 'asc'}
      ];

      expect(headers).toHaveSize(4);

      headers = await sort.getSortHeaders({sortDirection: 'asc'});

      expect(headers).toHaveSize(1);

      headers = await sort.getSortHeaders({sortDirection: 'desc'});

      expect(headers).toHaveSize(1);

      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();
      const rowContent = await table.getCellTextByIndex();

      expect(rows.length).toBe(10);
      expect(rowContent).toEqual([
        ['8', 'Oxygen', '15.9994', 'O'],
        ['7', 'Nitrogen', '14.0067', 'N'],
        ['10', 'Neon', '20.1797', 'Ne'],
        ['4', 'Lithium', '6.941', 'Li'],
        ['1', 'Hydrogen', '1.0079', 'H'],
        ['3', 'Helium', '4.0026', 'He'],
        ['2', 'Helium', '6.1234','He'],
        ['9', 'Fluorine', '18.9984', 'F'],
        ['6', 'Carbon', '12.0107', 'C'],
        ['5', 'Beryllium', '9.0122', 'Be']
      ]);
    });

    it('should sort table by changing the sort definitions', async () => {
      const sort = await loader.getHarness(MatMultiSortHarness);
      component.matDataTable.sort.sortDefinitions = [
        {active: 'name', direction: 'desc'},
        {active: 'weight', direction: 'asc'}
      ];
      fixture.detectChanges();
      let headers = await sort.getActiveHeaders();

      expect(headers).toHaveSize(2);
      expect(await headers[0].getLabel()).toBe('Name');
      expect(await headers[0].getSortDirection()).toBe('desc');
      expect(await headers[0].getSortPosition()).toBe(1);
      expect(await headers[1].getLabel()).toBe('Weight');
      expect(await headers[1].getSortDirection()).toBe('asc');
      expect(await headers[1].getSortPosition()).toBe(2);

      component.matDataTable.sort.sortDefinitions = [
        {active: 'weight', direction: 'asc'},
        {active: 'name', direction: 'asc'}
      ];
      fixture.detectChanges();
      headers = await sort.getActiveHeaders();

      expect(headers).toHaveSize(2);
      expect(await headers[0].getLabel()).toBe('Name');
      expect(await headers[0].getSortDirection()).toBe('asc');
      expect(await headers[0].getSortPosition()).toBe(2);
      expect(await headers[1].getLabel()).toBe('Weight');
      expect(await headers[1].getSortDirection()).toBe('asc');
      expect(await headers[1].getSortPosition()).toBe(1);
    });

  });

  describe('2 tables', () => {
    let fixture: ComponentFixture<DatatableDoubleTestComponent>;
    let loader: HarnessLoader;
    let component: DatatableDoubleTestComponent;

    beforeEach(waitForAsync(() => {
      void TestBed.configureTestingModule({
        imports: [
          MatDatatableModule,
          NoopAnimationsModule
        ],
        declarations: [
          DatatableDoubleTestComponent
        ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(DatatableDoubleTestComponent);
      fixture.detectChanges();
      component = fixture.componentInstance;
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should sort 1st table by setting the sort definitions', async () => {
      const sorts = await loader.getAllHarnesses(MatMultiSortHarness);

      expect(sorts).toHaveSize(2);

      let headers1 = await sorts[0].getSortHeaders({sortDirection: ''});
      let headers2 = await sorts[1].getSortHeaders({sortDirection: ''});

      expect(headers1).toHaveSize(4);
      expect(headers2).toHaveSize(4);

      component.matDataTable1.sort.sortDefinitions = [
        {active: 'name', direction: 'desc'},
        {active: 'weight', direction: 'asc'}
      ];

      headers1 = await sorts[0].getSortHeaders({sortDirection: /(asc|desc)/});
      headers2 = await sorts[1].getSortHeaders({sortDirection: /(asc|desc)/});

      expect(headers1).toHaveSize(2);
      expect(headers2).toHaveSize(0);

      headers1 = await sorts[0].getSortHeaders({sortDirection: ''});
      headers2 = await sorts[1].getSortHeaders({sortDirection: ''});

      expect(headers1).toHaveSize(2);
      expect(headers2).toHaveSize(4);
    });

  });
});

type DatatableTestRow = {
  position: number;
  name: string;
  weight: number;
  symbol: string;
}

const datatableTestColumnDefinitions: MatColumnDefinition<DatatableTestRow>[] = [
  {
    columnId: 'position',
    header: 'No.',
    cell: (row: DatatableTestRow) => row.position.toString(),
    headerAlignment: 'right',
    cellAlignment: 'right',
    width: '5em'
  },
  {
    columnId: 'name',
    header: 'Name',
    cell: (row: DatatableTestRow) => row.name,
    headerAlignment: 'left',
    cellAlignment: 'left',
    width: '10em',
    sortable: true,
    resizable: true
  },
  {
    columnId: 'weight',
    header: 'Weight',
    cell: (row: DatatableTestRow) => row.weight.toString(),
    headerAlignment: 'right',
    cellAlignment: 'right',
    width: '10em',
    sortable: true
  },
  {
    columnId: 'symbol',
    header: 'Symbol',
    cell: (row: DatatableTestRow) => row.symbol,
    headerAlignment: 'center',
    cellAlignment: 'center',
    width: '20em',
    tooltip: (row: DatatableTestRow) => `Hint: ${row.symbol}`,
    showAsMailtoLink: true,
    resizable: true
  }
];

const datatableTestData:DatatableTestRow[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 6.1234, symbol: 'He'},
  {position: 3, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 4, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 5, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'}
];

@Component({
  template: `
  <mat-datatable #testTable
    [dataSource]="dataSource"
    [columnDefinitions]="columnDefinitions"
    [displayedColumns]="displayedColumns"
    [rowSelectionMode]="currentSelectionMode"
    (rowClick)="onRowClick($event)"
    (sortChange)="onSortChanged($event)">
    No data to display.
  </mat-datatable>
  `
})
class DatatableTestComponent {
  @ViewChild('testTable') matDataTable!: MatDatatableComponent<DatatableTestRow>;

  dataSource = new DatatableTestDataSource(datatableTestData);
  protected columnDefinitions = datatableTestColumnDefinitions;
  protected displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  protected currentSorts: MatSortDefinitionPos[] = [];
  protected currentSorts$ = new BehaviorSubject<MatSortDefinitionPos[]>([]);
  protected currentSelectionMode: RowSelectionType = 'none';
  protected selectedRowsAsString = '-';

  protected onRowClick($event: DatatableTestRow) {
    this.selectedRowsAsString = $event.name;
  }

  protected onSortChanged(currentSorts: MatSortDefinitionPos[]) {
    this.currentSorts = currentSorts;
    this.currentSorts$.next(currentSorts);
  }
}

@Component({
  template: `
  <mat-datatable
    [dataSource]="dataSource"
    [columnDefinitions]="columnDefinitions"
    [displayedColumns]="displayedColumns"
    [rowSelectionMode]="currentSelectionMode"
    (rowClick)="onRowClick($event)"
    (sortChange)="onSortChanged($event)">
    No data to display.
  </mat-datatable>
  `
})
class DatatableEmptyTestComponent {
  dataSource = new DatatableTestDataSource([] as DatatableTestRow[]);
  protected columnDefinitions = datatableTestColumnDefinitions;
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  protected currentSorts: MatSortDefinitionPos[] = [];
  protected currentSorts$ = new BehaviorSubject<MatSortDefinitionPos[]>([]);
  protected currentSelectionMode: RowSelectionType = 'none';
  protected selectedRowsAsString = '-';

  protected onRowClick($event: DatatableTestRow) {
    this.selectedRowsAsString = $event.name;
  }

  protected onSortChanged(currentSorts: MatSortDefinitionPos[]) {
    this.currentSorts = currentSorts;
    this.currentSorts$.next(currentSorts);
  }
}

@Component({
  template: `
  <mat-datatable #testTable1
    [dataSource]="dataSource1"
    [columnDefinitions]="columnDefinitions"
    [displayedColumns]="displayedColumns"
    (sortChange)="onSortChanged1($event)"
  >
    No data to display.
  </mat-datatable>
  <mat-datatable #testTable2
    [dataSource]="dataSource2"
    [columnDefinitions]="columnDefinitions"
    [displayedColumns]="displayedColumns"
    (sortChange)="onSortChanged2($event)"
  >
    No data to display.
  </mat-datatable>
  `
})
class DatatableDoubleTestComponent {
  @ViewChild('testTable1') matDataTable1!: MatDatatableComponent<DatatableTestRow>;
  @ViewChild('testTable2') matDataTable2!: MatDatatableComponent<DatatableTestRow>;

  dataSource1 = new DatatableTestDataSource(datatableTestData);
  dataSource2 = new DatatableTestDataSource(datatableTestData);
  protected columnDefinitions = datatableTestColumnDefinitions;
  protected displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  protected currentSorts1: MatSortDefinitionPos[] = [];
  protected currentSorts1$ = new BehaviorSubject<MatSortDefinitionPos[]>([]);
  protected currentSorts2: MatSortDefinitionPos[] = [];
  protected currentSorts2$ = new BehaviorSubject<MatSortDefinitionPos[]>([]);

  protected onSortChanged1(currentSorts: MatSortDefinitionPos[]) {
    this.currentSorts1 = currentSorts;
    this.currentSorts1$.next(currentSorts);
  }
  protected onSortChanged2(currentSorts: MatSortDefinitionPos[]) {
    this.currentSorts2 = currentSorts;
    this.currentSorts2$.next(currentSorts);
  }
}

class DatatableTestDataSource extends MatDatatableDataSource<DatatableTestRow> {
  private currentSortingDefinitions: MatSortDefinition[] = [];
  private unsortedData: DatatableTestRow[];
  private sortChanged = new Subject<void>();

  constructor(testData: DatatableTestRow[]) {
    super();
    this.unsortedData = structuredClone(testData) as DatatableTestRow[];
    this.data = structuredClone(testData) as DatatableTestRow[];
    this.currentSortingDefinitions = [];
  }

  /**
   * Connect this data source to the mat-datatable. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<DatatableTestRow[]> {
    if (this.paginator) {
      // Combine everything that affects the rendered data into one update
      // stream for the data-table to consume.
      return merge(observableOf(this.data), this.paginator.page, this.sortChanged)
        .pipe(map(() => {
          return this.getPagedData(this.getSortedData());
        }));
    } else {
      throw Error('Please set the paginator on the data source before connecting.');
    }
  }

  /**
   *  Called when the mat-datatable is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect(): void {}

  /**
   * Gets the sorting definition from the datasource.
   * @returns fields and directions that the datasource uses for sorting
   */
  getSort(): MatSortDefinition[] {
    return this.currentSortingDefinitions;
  }

  /**
   * Sort data according to sortDefinition.
   * @param sortDefinition - fields and direction that should be used for sorting
   */
  setSort(sortDefinition: MatSortDefinition[]): void {
    if (!this.areSortDefinitionsEqual(this.currentSortingDefinitions, sortDefinition)) {
      this.currentSortingDefinitions = sortDefinition;
      this.data = this.getSortedData();
      this.sortChanged.next();
    }
  }

  /**
   * Compare 2 sort definitions.
   * @param a - 1st sort definition
   * @param b - 2nd sort definition
   * @returns true= both definitions are equal
   */
  private areSortDefinitionsEqual(a: MatSortDefinition[], b: MatSortDefinition[]): boolean {
    return a.length === b.length &&
    a.every((element, index) => (element.columnId === b[index].columnId) &&
      element.direction === b[index].direction);
  }

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   * @param data - input data to be paginated
   * @returns data for the mat-datatable
   */
  private getPagedData(data: DatatableTestRow[]): DatatableTestRow[] {
    if (this.paginator) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      return data.splice(startIndex, this.paginator.pageSize);
    } else {
      return data;
    }
  }

  private getSortedData(): DatatableTestRow[] {
    const baseData = structuredClone(this.unsortedData) as DatatableTestRow[];
    if (!this.currentSortingDefinitions || this.currentSortingDefinitions.length === 0) {
      return baseData;
    }

    return baseData.sort((a, b) => {
      let result = 0;
      for (let i = 0; i < this.currentSortingDefinitions.length; i++) {
        const fieldName = this.currentSortingDefinitions[i].columnId;
        const isAsc = (this.currentSortingDefinitions[i].direction === 'asc');
        const valueA = a[fieldName as keyof DatatableTestRow];
        const valueB = b[fieldName as keyof DatatableTestRow];
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
