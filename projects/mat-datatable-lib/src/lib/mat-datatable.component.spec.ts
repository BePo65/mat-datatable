import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, ViewChild } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, first, of } from 'rxjs';

import { MatMultiSortHarness } from '../directives/datatable-sort/testing';
import { Page, RequestPageOfList, RequestSortDataList } from '../interfaces/datasource-endpoint.interface';
import { MatColumnDefinition } from '../interfaces/datatable-column-definition.interface';
import { MatSortDefinition } from '../interfaces/datatable-sort-definition.interface';

import { MatDatatableComponent, RowSelectionType } from './mat-datatable.component';
import { MatDatatableModule } from './mat-datatable.module';
import SINGLE_PAGE_DATA from './mocking-data/demo-table.mock.data.atoms';
import PAGABLE_DATA from './mocking-data/demo-table.mock.data.users';
import { MatDatatableHarness, MatHeaderRowHarness } from './testing';

describe('MatDatatableComponent', () => {
  describe('Table creation', () => {
    let fixture: ComponentFixture<DatatableTestComponent>;
    let loader: HarnessLoader;
    let component: DatatableTestComponent;
    const singlePageDataAsStrings = SINGLE_PAGE_DATA.map(entry => {
      const result: string[] = [];
      result.push(entry.position.toString());
      result.push(entry.name);
      result.push(entry.weight.toString());
      result.push(entry.symbol);
      return result;
    });

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
      const headerRow = await table.getHeaderRow();
      const header = await loader.getHarness(MatHeaderRowHarness);
      const headerContent = await header.getCellTextByIndex();

      expect(headerRow).toBeDefined();
      expect(headerContent.length).toEqual(4);
      expect(headerContent).toEqual(['No.', 'Name', 'Weight', 'Symbol']);
    });

    it('should create a table with correct data', async () => {
      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();
      const rowContent = await table.getCellTextByIndex();

      expect(rows.length).toBe(10);
      expect(rowContent).toEqual(singlePageDataAsStrings);
    });

    it('should create a table without data', async () => {
      const fixtureEmpty = TestBed.createComponent(DatatableEmptyTestComponent);
      fixtureEmpty.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixtureEmpty);

      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();

      expect(rows.length).toBe(0);
    });
  });

  describe('Table sorting', () => {
    let fixture: ComponentFixture<DatatableTestComponent>;
    let loader: HarnessLoader;
    let component: DatatableTestComponent;
    const singlePageDataAsStrings = SINGLE_PAGE_DATA.map(entry => {
      const result: string[] = [];
      result.push(entry.position.toString());
      result.push(entry.name);
      result.push(entry.weight.toString());
      result.push(entry.symbol);
      return result;
    });

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

    it('should not sort a table when clicking on a non sortable column', async () => {
      const sort = await loader.getHarness(MatMultiSortHarness);
      let headers = await sort.getSortHeaders({ sortDirection: '' });

      expect(headers).toHaveSize(4);

      await headers[0].click();
      headers = await sort.getSortHeaders({ sortDirection: 'asc' });

      expect(headers).toHaveSize(0);

      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();
      const rowContent = await table.getCellTextByIndex();

      expect(rows.length).toBe(10);
      expect(rowContent).toEqual(singlePageDataAsStrings);
    });

    it('should sort a table when clicking on a sortable column', async () => {
      const sort = await loader.getHarness(MatMultiSortHarness);
      let headers = await sort.getSortHeaders({ sortDirection: '' });

      expect(headers).toHaveSize(4);

      await headers[1].click();
      headers = await sort.getSortHeaders({ sortDirection: 'asc' });

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
      let headers = await sort.getSortHeaders({ sortDirection: '' });

      expect(headers).toHaveSize(4);

      await headers[1].click();
      await headers[2].click();
      headers = await sort.getSortHeaders({ sortDirection: 'asc' });

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
      let headers = await sort.getSortHeaders({ sortDirection: '' });

      expect(headers).toHaveSize(4);

      await headers[1].click();
      await headers[2].click();
      await headers[1].click();
      headers = await sort.getSortHeaders({ sortDirection: 'asc' });

      expect(headers).toHaveSize(1);

      headers = await sort.getSortHeaders({ sortDirection: 'desc' });

      expect(headers).toHaveSize(1);

      const sortDefinitions = component.matDataTable.sortDefinitions;

      expect(sortDefinitions.length).toBe(2);
      expect(sortDefinitions).toEqual([
        { columnId: 'name', direction: 'desc' },
        { columnId: 'weight', direction: 'asc' }
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
      let headers = await sort.getSortHeaders({ sortDirection: '' });

      component.matDataTable.sortDefinitions = [
        { columnId: 'name', direction: 'desc' },
        { columnId: 'weight', direction: 'asc' }
      ];

      expect(headers).toHaveSize(4);

      headers = await sort.getSortHeaders({ sortDirection: 'asc' });

      expect(headers).toHaveSize(1);

      headers = await sort.getSortHeaders({ sortDirection: 'desc' });

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
      component.matDataTable.sortDefinitions = [
        { columnId: 'name', direction: 'desc' },
        { columnId: 'weight', direction: 'asc' }
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

      component.matDataTable.sortDefinitions = [
        { columnId: 'weight', direction: 'asc' },
        { columnId: 'name', direction: 'asc' }
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

    it('should emit new sort order on change', () => {
      let currentSortDefinitions: MatSortDefinition[] | undefined;
      component.matDataTable.sortChange
        .pipe(
          first()
        )
        .subscribe((value: MatSortDefinition[]) => currentSortDefinitions = value);

      // change sort definitions
      const newSortDefinitions: MatSortDefinition[] = [
        { columnId: 'name', direction: 'desc' },
        { columnId: 'weight', direction: 'asc' }
      ];
      component.matDataTable.sortDefinitions = newSortDefinitions;
      fixture.detectChanges();

      expect(currentSortDefinitions).toEqual(newSortDefinitions);
    });
  });

  describe('Table row activation', () => {
    let fixture: ComponentFixture<DatatableTestComponent>;
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
    });

    it('should get/set active row of table', () => {
      expect(component.matDataTable.activatedRow).toBeUndefined();

      const activeRow = component.getRow(2);
      component.matDataTable.activatedRow = activeRow;

      expect(component.matDataTable.activatedRow).toBe(activeRow);
    });
  });

  describe('Table row selection', () => {
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

    it('should not be able to select rows when rowSelectionMode=none', async () => {
      component.matDataTable.rowSelectionMode = 'none';
      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();

      let selectedRows = component.matDataTable.selectedRows;

      expect(selectedRows.length).toBe(0);

      // Clicks the first row
      await rows[6].click();
      selectedRows = component.matDataTable.selectedRows;

      expect(selectedRows.length).toBe(0);
      expect(component.selectedRowsAsString).toBe('-');
    });

    it('should select 1 row by clicking A row (rowSelectionMode=single)', async () => {
      component.matDataTable.rowSelectionMode = 'single';
      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();

      let selectedRows = component.matDataTable.selectedRows;

      expect(selectedRows.length).toBe(0);

      // Clicks the first row
      await rows[6].click();
      selectedRows = component.matDataTable.selectedRows;

      expect(selectedRows.length).toBe(1);
      expect(component.lastClickedRowAsString).toBe('Nitrogen');
      expect(component.selectedRowsAsString).toBe('Nitrogen');

      // Clicks another row
      await rows[7].click();
      selectedRows = component.matDataTable.selectedRows;

      expect(selectedRows.length).toBe(1);
      expect(component.selectedRowsAsString).toBe('Oxygen');
    });

    it('should select 1 row by setting selectedRows (rowSelectionMode=single)', () => {
      component.matDataTable.rowSelectionMode = 'single';

      expect(component.matDataTable.selectedRows.length).toBe(0);

      // Select some rows
      const selectedRows = [component.getRow(3), component.getRow(4)];
      component.matDataTable.selectedRows = selectedRows;

      expect(component.matDataTable.selectedRows.length).toBe(1);
      expect(component.matDataTable.selectedRows[0]).toBe(selectedRows[0]);
      expect(component.selectedRowsAsString).toBe('Lithium');
    });

    it('should select several rows by clicking rows (rowSelectionMode=multi)', async () => {
      component.matDataTable.rowSelectionMode = 'multi';
      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();

      let selectedRows = component.matDataTable.selectedRows;

      expect(selectedRows.length).toBe(0);

      // Clicks the rows
      await rows[1].click();
      await rows[3].click();
      await rows[5].click();
      selectedRows = component.matDataTable.selectedRows;

      expect(selectedRows.length).toBe(3);

      expect(component.getRow(3)).not.toBeUndefined();
      expect(selectedRows[1]).toBe(component.getRow(3));
      expect(component.lastClickedRowAsString).toBe('Carbon');
      expect(component.selectedRowsAsString).toBe('Helium; Lithium; Carbon');
    });

    it('should select several rows by setting selectedRows (rowSelectionMode=multi)', () => {
      component.matDataTable.rowSelectionMode = 'multi';

      expect(component.matDataTable.selectedRows.length).toBe(0);

      // Select some rows
      const selectedRows = [component.getRow(3), component.getRow(4), component.getRow(5)];
      component.matDataTable.selectedRows = selectedRows;

      expect(component.matDataTable.selectedRows.length).toBe(3);
      expect(component.matDataTable.selectedRows).toBe(selectedRows);
      expect(component.selectedRowsAsString).toBe('Lithium; Beryllium; Carbon');
    });

    it('should reset selectedRows (rowSelectionMode=multi)', () => {
      component.matDataTable.rowSelectionMode = 'multi';

      expect(component.matDataTable.selectedRows.length).toBe(0);

      // Select some rows
      const selectedRows = [component.getRow(3), component.getRow(4), component.getRow(5)];
      component.matDataTable.selectedRows = selectedRows;

      expect(component.matDataTable.selectedRows.length).toBe(3);
      expect(component.matDataTable.selectedRows).toBe(selectedRows);
      expect(component.selectedRowsAsString).toBe('Lithium; Beryllium; Carbon');

      component.matDataTable.selectedRows = [];

      expect(component.matDataTable.selectedRows.length).toBe(0);
      expect(component.selectedRowsAsString).toBe('-');
    });
  });

  describe('Table row cells', () => {
    let fixture: ComponentFixture<DatatableTestComponent>;
    let loader: HarnessLoader;

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
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should check single line state of cells', async () => {
      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();
      const testRowCells = await rows[1].getCells();

      const resultNames = [];
      const resultSingleLines = [];
      for (let i = 0; i < testRowCells.length; i++) {
        resultNames.push(await testRowCells[i].getColumnName());
        resultSingleLines.push(await testRowCells[i].isSingleLine());
      }

      expect(resultNames).toEqual(['position', 'name', 'weight', 'symbol']);
      expect(resultSingleLines).toEqual([false, true, false, false]);
    });
  });

  describe('Table row harness', () => {
    let fixture: ComponentFixture<DatatableTestComponent>;
    let loader: HarnessLoader;

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
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should get array of MatRowCellHarness of selected in row - filter by isSingleLine true', async () => {
      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();
      const testRowCells = await rows[1].getCells({ isSingleLine: true });

      expect(testRowCells.length).toBe(1);
      expect(await testRowCells[0].getColumnName()).toBe('name');
      expect(await testRowCells[0].isSingleLine()).toBeTrue();
    });

    it('should get array of MatRowCellHarness of selected in row - filter by isSingleLine false', async () => {
      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();
      const testRowCells = await rows[1].getCells({ isSingleLine: false });

      const resultNames = [];
      const resultSingleLines = [];
      for (let i = 0; i < testRowCells.length; i++) {
        resultNames.push(await testRowCells[i].getColumnName());
        resultSingleLines.push(await testRowCells[i].isSingleLine());
      }

      expect(resultNames).toEqual(['position', 'weight', 'symbol']);
      expect(resultSingleLines).toEqual([false, false, false]);
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

      let headers1 = await sorts[0].getSortHeaders({ sortDirection: '' });
      let headers2 = await sorts[1].getSortHeaders({ sortDirection: '' });

      expect(headers1).toHaveSize(4);
      expect(headers2).toHaveSize(4);

      component.matDataTable1.sortDefinitions = [
        { columnId: 'name', direction: 'desc' },
        { columnId: 'weight', direction: 'asc' }
      ];

      headers1 = await sorts[0].getSortHeaders({ sortDirection: /(asc|desc)/ });
      headers2 = await sorts[1].getSortHeaders({ sortDirection: /(asc|desc)/ });

      expect(headers1).toHaveSize(2);
      expect(headers2).toHaveSize(0);

      headers1 = await sorts[0].getSortHeaders({ sortDirection: '' });
      headers2 = await sorts[1].getSortHeaders({ sortDirection: '' });

      expect(headers1).toHaveSize(2);
      expect(headers2).toHaveSize(4);
    });
  });

  describe('Pagable table', () => {
    let fixture: ComponentFixture<PagableTestComponent>;
    let loader: HarnessLoader;
    let component: PagableTestComponent;

    beforeEach(waitForAsync(() => {
      void TestBed.configureTestingModule({
        imports: [
          MatDatatableModule,
          NoopAnimationsModule
        ],
        declarations: [
          PagableTestComponent
        ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(PagableTestComponent);
      fixture.detectChanges();
      component = fixture.componentInstance;
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should get first page on load', async () => {
      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();
      const rowContent = await table.getCellTextByIndex();

      expect(rows.length).toBe(10);
      expect(rowContent).toEqual(PagableDataPage1);
    });

    it('should switch to second page', async () => {
      const table = await loader.getHarness(MatDatatableHarness);
      component.matDataTable.page = 1;
      const rows = await table.getRows();
      const rowContent = await table.getCellTextByIndex();

      expect(rows.length).toBe(10);
      expect(rowContent).toEqual(PagableDataPage2);
    });

    it('should switch to non existing page', async () => {
      const table = await loader.getHarness(MatDatatableHarness);
      component.matDataTable.page = 100;
      const rows = await table.getRows();
      const rowContent = await table.getCellTextByIndex();

      expect(rows.length).toBe(10);
      expect(rowContent).toEqual(PagableDataPage1);
    });

    it('should set and get page size', async () => {
      const table = await loader.getHarness(MatDatatableHarness);
      component.matDataTable.pageSize = 15;
      const rows = await table.getRows();

      expect(rows.length).toBe(15);
      expect(component.matDataTable.pageSize).toEqual(15);
    });

    it('should emit onPageSizeChange on changing pageSize', () => {
      let currentPageSize: number | undefined;
      component.matDataTable.pageSizeChange
        .pipe(
          first()
        )
        .subscribe((value: number) => currentPageSize = value);
      component.matDataTable.pageSize = 20;

      expect(currentPageSize).toEqual(20);
    });

    it('should stay on page when setting page size', async () => {
      const table = await loader.getHarness(MatDatatableHarness);
      component.matDataTable.page = 2;
      const rowContentOld = await table.getCellTextByIndex();
      const oldIdOfFirstRow = rowContentOld[0][0];
      const idOfElement20 = component.getRow(20).userId.toString();
      const idOfElement30 = component.getRow(30).userId.toString();

      expect(component.matDataTable.pageSize).toEqual(10);
      expect(component.matDataTable.paginator.pageIndex).toEqual(2);
      expect(oldIdOfFirstRow).toEqual(idOfElement20);

      component.matDataTable.pageSize = 15;

      expect(component.matDataTable.pageSize).toEqual(15);
      expect(component.matDataTable.paginator.pageIndex).toEqual(2);

      const rowContentNew = await table.getCellTextByIndex();
      const newIdOfFirstRow = rowContentNew[0][0];

      expect(rowContentOld.length).toBe(10);
      expect(rowContentNew.length).toBe(15);
      expect(newIdOfFirstRow).toEqual(idOfElement30);
    });
  });

  describe('Table columns resizing', () => {
    let fixture: ComponentFixture<DatatableTestComponent>;
    let loader: HarnessLoader;

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
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should get resizable columns', async () => {
      const headerRow = await loader.getHarness(MatHeaderRowHarness);
      const headerCells = await headerRow.getCells({ isResizable: true });

      expect(headerCells.length).toBe(2);
    });

    it('should resize a resizable column', async () => {
      const headerRow = await loader.getHarness(MatHeaderRowHarness);
      const headerCells = await headerRow.getCells({ isResizable: true });

      expect(headerCells).toHaveSize(2);

      const targetWidth = 400;
      await headerCells[1].resize(targetWidth);
      const newWidth = await headerCells[1].getColumnWidth();

      expect(Math.abs(newWidth - targetWidth)).toBeLessThan(10);
      expect(newWidth).toBe(targetWidth);
    });

    /* eslint-disable jasmine/new-line-before-expect */
    it('should not resize a non-resizable column', async () => {
      const headerRow = await loader.getHarness(MatHeaderRowHarness);
      const headerCells = await headerRow.getCells();

      expect(headerCells).toHaveSize(4);

      const originalWidth = await headerCells[0].getColumnWidth();
      expect(originalWidth).toBeGreaterThan(1);

      // Cell without resizer cannot resize
      await headerCells[0].resize(100);
      const newWidth = await headerCells[0].getColumnWidth();
      expect(newWidth).toBe(originalWidth);
    });
    /* eslint-enable jasmine/new-line-before-expect */
  });
});

class StaticTableDataStore<TRow, TFilter> {
  private data: TRow[];
  private currentSortingDefinitions: RequestSortDataList<TRow>[];
  private unsortedData: TRow[];

  constructor(testData: TRow[]) {
    this.unsortedData = structuredClone(testData) as TRow[];
    this.data = structuredClone(testData) as TRow[];
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
    sorts?: RequestSortDataList<TRow>[],
    filters?: TFilter // eslint-disable-line @typescript-eslint/no-unused-vars
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
    } as Page<TRow>;
    return of(result);
  }

  getRow(rowIndex: number, fromSortedRows = false) {
    let source: TRow[];

    if (fromSortedRows) {
      source = this.unsortedData;
    } else {
      source = this.data;
    }

    return source[rowIndex];
  }

  /**
   * Compare 2 sort definitions.
   * @param a - 1st sort definition
   * @param b - 2nd sort definition
   * @returns true= both definitions are equal
   */
  private areSortDefinitionsEqual(a: RequestSortDataList<TRow>[], b: RequestSortDataList<TRow>[]): boolean {
    return a.length === b.length &&
    a.every((element, index) => (element.fieldName === b[index].fieldName) &&
      element.order === b[index].order);
  }

  private getSortedData(): TRow[] {
    const baseData = structuredClone(this.unsortedData) as TRow[];
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
    width: '20em',
    resizable: true,
    showAsSingleLine: true,
    sortable: true
  },
  {
    columnId: 'weight',
    header: 'Weight',
    cell: (row: DatatableTestRow) => row.weight.toString(),
    headerAlignment: 'right',
    cellAlignment: 'right',
    width: '10em',
    resizable: true,
    sortable: true
  },
  {
    columnId: 'symbol',
    header: 'Symbol',
    cell: (row: DatatableTestRow) => row.symbol,
    headerAlignment: 'center',
    cellAlignment: 'center',
    tooltip: (row: DatatableTestRow) => `Hint: ${row.symbol}`,
    showAsMailtoLink: true
  }
];

const datatableTestData: DatatableTestRow[] = SINGLE_PAGE_DATA;

type EmptyTestFilter = object;

@Component({
  template: `
  <mat-datatable #testTable
    [columnDefinitions]="columnDefinitions"
    [displayedColumns]="displayedColumns"
    [rowSelectionMode]="currentSelectionMode"
    [datastoreGetter]="getData"
    (rowClick)="onRowClick($event)"
    (rowSelectionChange)="onRowSelectionChange($event)"
    (sortChange)="onSortChanged($event)">
    No data to display.
  </mat-datatable>
  `
})
class DatatableTestComponent {
  @ViewChild('testTable') matDataTable!: MatDatatableComponent<DatatableTestRow, EmptyTestFilter>;
  lastClickedRowAsString = '-';
  selectedRowsAsString = '-';

  protected dataStore = new StaticTableDataStore(datatableTestData);
  protected columnDefinitions = datatableTestColumnDefinitions;
  protected displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  protected currentSorts: MatSortDefinition[] = [];
  protected readonly currentSorts$ = new BehaviorSubject<MatSortDefinition[]>([]);
  protected currentSelectionMode: RowSelectionType = 'none';

  getRow(rowIndex: number, fromSortedRows = false) {
    return this.dataStore.getRow(rowIndex, fromSortedRows);
  }

  // arrow function is required to give dataStore.getPagedData the correct 'this'
  protected getData = (rowsRange: RequestPageOfList, sorts?: RequestSortDataList<DatatableTestRow>[], filters?: object) => {
    return this.dataStore.getPagedData(rowsRange, sorts, filters);
  };

  protected onRowClick($event: DatatableTestRow) {
    if ($event !== undefined) {
      this.lastClickedRowAsString = $event.name;
    } else {
      this.lastClickedRowAsString = '-';
    }
  }

  protected onSortChanged(currentSorts: MatSortDefinition[]) {
    this.currentSorts = currentSorts;
    this.currentSorts$.next(currentSorts);
  }

  protected onRowSelectionChange($event: DatatableTestRow[]) {
    let result = '-';
    if ($event.length > 0) {
      result = $event
        .sort((a: DatatableTestRow, b: DatatableTestRow) => a.position - b.position )
        .map(row => row.name)
        .join('; ') || '-';
    }
    this.selectedRowsAsString = result;
  }
}

@Component({
  template: `
  <mat-datatable
    [columnDefinitions]="columnDefinitions"
    [displayedColumns]="displayedColumns"
    [rowSelectionMode]="currentSelectionMode"
    [datastoreGetter]="getData"
    (rowClick)="onRowClick($event)"
    (sortChange)="onSortChanged($event)">
    No data to display.
  </mat-datatable>
  `
})
class DatatableEmptyTestComponent {
  dataStore = new StaticTableDataStore([] as DatatableTestRow[]);
  protected columnDefinitions = datatableTestColumnDefinitions;
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  protected currentSorts: MatSortDefinition[] = [];
  protected readonly currentSorts$ = new BehaviorSubject<MatSortDefinition[]>([]);
  protected currentSelectionMode: RowSelectionType = 'none';
  protected selectedRowsAsString = '-';

  // arrow function is required to give dataStore.getPagedData the correct 'this'
  protected getData = (rowsRange: RequestPageOfList, sorts?: RequestSortDataList<DatatableTestRow>[], filters?: object) => {
    return this.dataStore.getPagedData(rowsRange, sorts, filters);
  };

  protected onRowClick($event: DatatableTestRow) {
    this.selectedRowsAsString = $event.name;
  }

  protected onSortChanged(currentSorts: MatSortDefinition[]) {
    this.currentSorts = currentSorts;
    this.currentSorts$.next(currentSorts);
  }
}

@Component({
  template: `
  <mat-datatable #testTable1
    [columnDefinitions]="columnDefinitions"
    [displayedColumns]="displayedColumns"
    [datastoreGetter]="getData1"
    (sortChange)="onSortChanged1($event)"
  >
    No data to display.
  </mat-datatable>
  <mat-datatable #testTable2
    [columnDefinitions]="columnDefinitions"
    [displayedColumns]="displayedColumns"
    [datastoreGetter]="getData2"
    (sortChange)="onSortChanged2($event)"
  >
    No data to display.
  </mat-datatable>
  `
})
class DatatableDoubleTestComponent {
  @ViewChild('testTable1') matDataTable1!: MatDatatableComponent<DatatableTestRow, EmptyTestFilter>;
  @ViewChild('testTable2') matDataTable2!: MatDatatableComponent<DatatableTestRow, EmptyTestFilter>;

  dataStore1 = new StaticTableDataStore(datatableTestData);
  dataStore2 = new StaticTableDataStore(datatableTestData);
  protected columnDefinitions = datatableTestColumnDefinitions;
  protected displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  protected currentSorts1: MatSortDefinition[] = [];
  protected readonly currentSorts1$ = new BehaviorSubject<MatSortDefinition[]>([]);
  protected currentSorts2: MatSortDefinition[] = [];
  protected readonly currentSorts2$ = new BehaviorSubject<MatSortDefinition[]>([]);

  // arrow function is required to give dataStore.getPagedData the correct 'this'
  protected getData1 = (rowsRange: RequestPageOfList, sorts?: RequestSortDataList<DatatableTestRow>[], filters?: object) => {
    return this.dataStore1.getPagedData(rowsRange, sorts, filters);
  };

  // arrow function is required to give dataStore.getPagedData the correct 'this'
  protected getData2 = (rowsRange: RequestPageOfList, sorts?: RequestSortDataList<DatatableTestRow>[], filters?: object) => {
    return this.dataStore2.getPagedData(rowsRange, sorts, filters);
  };

  protected onSortChanged1(currentSorts: MatSortDefinition[]) {
    this.currentSorts1 = currentSorts;
    this.currentSorts1$.next(currentSorts);
  }
  protected onSortChanged2(currentSorts: MatSortDefinition[]) {
    this.currentSorts2 = currentSorts;
    this.currentSorts2$.next(currentSorts);
  }
}

type DatatablePagableTestRow = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  birthday: Date;
  description: string;
}

const datatablePagableTestColumnDefinitions: MatColumnDefinition<DatatablePagableTestRow>[] = [
  {
    columnId: 'userId',
    header: 'ID',
    cell: (row: DatatablePagableTestRow) => row.userId.toString(),
    headerAlignment: 'right',
    cellAlignment: 'right',
    width: '5em'
  },
  {
    columnId: 'firstName',
    header: 'First Name',
    cell: (row: DatatablePagableTestRow) => row.firstName,
    headerAlignment: 'left',
    cellAlignment: 'left',
    width: '10em',
    sortable: true,
    resizable: true
  },
  {
    columnId: 'lastName',
    header: 'Last Name',
    cell: (row: DatatablePagableTestRow) => row.lastName,
    headerAlignment: 'left',
    cellAlignment: 'left',
    width: '10em',
    sortable: true,
    resizable: true
  },
  {
    columnId: 'email',
    header: 'Email',
    cell: (row: DatatablePagableTestRow) => row.email,
    headerAlignment: 'left',
    cellAlignment: 'left',
    width: '10em',
    sortable: true,
    resizable: true
  },
  {
    columnId: 'birthday',
    header: 'Birthday',
    cell: (row: DatatablePagableTestRow) => row.birthday.toUTCString(),
    headerAlignment: 'right',
    cellAlignment: 'right',
    width: '10em',
    sortable: true
  },
  {
    columnId: 'description',
    header: 'Description',
    cell: (row: DatatablePagableTestRow) => row.description,
    headerAlignment: 'center',
    cellAlignment: 'center',
    width: '20em',
    tooltip: (row: DatatablePagableTestRow) => `Hint: ${row.description}`,
    showAsMailtoLink: true,
    resizable: true
  }
];

@Component({
  template: `
  <mat-datatable #testTable
    [columnDefinitions]="columnDefinitions"
    [displayedColumns]="displayedColumns"
    [rowSelectionMode]="currentSelectionMode"
    [datastoreGetter]="getData"
    (rowClick)="onRowClick($event)"
    (sortChange)="onSortChanged($event)">
    No data to display.
  </mat-datatable>
  `
})
class PagableTestComponent {
  @ViewChild('testTable') matDataTable!: MatDatatableComponent<DatatablePagableTestRow, EmptyTestFilter>;

  protected dataStore = new StaticTableDataStore<DatatablePagableTestRow, EmptyTestFilter>(PAGABLE_DATA);
  protected columnDefinitions = datatablePagableTestColumnDefinitions;
  protected displayedColumns: string[] = ['userId', 'firstName', 'lastName', 'email', 'birthday', 'description'];
  protected currentSorts: MatSortDefinition[] = [];
  protected readonly currentSorts$ = new BehaviorSubject<MatSortDefinition[]>([]);
  protected currentSelectionMode: RowSelectionType = 'none';
  protected selectedRowsAsString = '-';

  getRow(rowIndex: number, fromSortedRows = false) {
    return this.dataStore.getRow(rowIndex, fromSortedRows);
  }

  // arrow function is required to give dataStore.getPagedData the correct 'this'
  protected getData = (rowsRange: RequestPageOfList, sorts?: RequestSortDataList<DatatablePagableTestRow>[], filters?: object) => {
    return this.dataStore.getPagedData(rowsRange, sorts, filters);
  };

  protected onRowClick($event: DatatablePagableTestRow) {
    this.selectedRowsAsString = $event.lastName;
  }

  protected onSortChanged(currentSorts: MatSortDefinition[]) {
    this.currentSorts = currentSorts;
    this.currentSorts$.next(currentSorts);
  }
}

/* spellchecker: disable */
const PagableDataPage1 = [
  [
    '1', 'Rashawn', 'Goyette', 'Alexa1@gmail.com', 'Tue, 21 Nov 2000 06:55:38 GMT', 'Provident numquam possimus harum maxime repellat repellat optio quas.'
  ],
  [
    '2', 'Jesse', 'Littel', 'Lura_Predovic@hotmail.com', 'Fri, 18 Jul 1980 09:14:13 GMT', 'Odit quibusdam tempora sapiente.'
  ],
  [
    '3', 'Mazie', 'Bradtke', 'Concepcion25@yahoo.com', 'Wed, 25 Dec 1996 12:38:46 GMT', 'Ipsam temporibus exercitationem ipsum architecto.'
  ],
  [
    '4', 'Gabrielle', 'Predovic', 'Emory.Schamberger@yahoo.com', 'Wed, 08 Jan 1975 09:45:13 GMT', 'Excepturi hic sint velit molestias enim aliquid voluptas cumque consequatur.'
  ],
  [
    '5', 'Lily', 'Rolfson', 'Webster.Quigley67@yahoo.com', 'Sun, 04 Jul 1948 02:09:40 GMT', 'Nihil aliquam qui libero error modi pariatur quis voluptate possimus.'
  ],
  [
    '6', 'Adah', 'Hauck', 'Vincenzo_Runte14@yahoo.com', 'Fri, 11 Feb 1966 06:49:26 GMT', 'Vero autem blanditiis omnis.'
  ],
  [
    '7', 'Jessie', 'Kuvalis', 'Madelyn5@gmail.com', 'Mon, 15 Mar 1976 21:41:16 GMT', 'Veritatis beatae maxime molestias accusantium beatae.'
  ],
  [
    '8', 'Alene', 'D\'Amore', 'Lura.Stokes@yahoo.com', 'Thu, 15 Oct 1992 00:54:04 GMT', 'Saepe quo doloribus minus quia error.'
  ],
  [
    '9', 'Lea', 'Keeling', 'Dallin_OConner@gmail.com', 'Tue, 09 Sep 1980 12:17:11 GMT', 'Similique veniam debitis voluptate laudantium doloribus.'
  ],
  [
    '10', 'Orrin', 'Orn', 'Dan_Torp23@yahoo.com', 'Sun, 25 Jan 1953 02:11:42 GMT', 'Totam inventore placeat magnam doloremque.'
  ]
];

const PagableDataPage2 = [
  [
    '11', 'Cleveland', 'Koelpin', 'Barrett69@hotmail.com', 'Tue, 21 Feb 1995 19:45:18 GMT', 'Facilis eligendi sed animi iusto repellendus quas ab quos facilis.'
  ],
  [
    '12', 'Carol', 'Braun', 'Krystal_Upton@gmail.com', 'Fri, 04 May 1962 00:45:00 GMT', 'Accusamus vero repellat quae modi officiis molestias harum dignissimos distinctio.'
  ],
  [
    '13', 'Dena', 'Goodwin', 'Rico34@yahoo.com', 'Sat, 03 Nov 1979 11:50:10 GMT', 'Necessitatibus eum dolores alias maiores est.'
  ],
  [
    '14', 'Shad', 'Kerluke', 'Julien.Spencer37@hotmail.com', 'Sat, 15 Sep 1990 13:32:19 GMT', 'Numquam accusantium reiciendis cumque unde.'
  ],
  [
    '15', 'Tina', 'Lowe', 'Miller_Kling@hotmail.com', 'Mon, 25 Nov 1968 17:32:53 GMT', 'Eum sit excepturi nesciunt doloribus doloribus neque tempora eum molestias.'
  ],
  [
    '16', 'Novella', 'Schmidt', 'Josiane78@yahoo.com', 'Sun, 06 Mar 1983 20:36:10 GMT', 'Quod maiores vel.'
  ],
  [
    '17', 'Reid', 'Rolfson', 'Berry_Sanford72@hotmail.com', 'Tue, 17 Mar 1953 01:23:24 GMT', 'Aut velit autem necessitatibus eaque.'
  ],
  [
    '18', 'Cynthia', 'Reichert', 'Earnestine_Leannon98@gmail.com', 'Fri, 26 Nov 1971 00:38:55 GMT', 'Aut totam cupiditate illum.'
  ],
  [
    '19', 'Jamar', 'Hauck', 'Mariela_Batz93@gmail.com', 'Mon, 22 Sep 1969 06:02:27 GMT', 'Perferendis quam officiis.'
  ],
  [
    '20', 'Ada', 'Ernser', 'Rosendo_Breitenberg47@hotmail.com', 'Mon, 27 Feb 1984 07:45:35 GMT', 'Facilis debitis animi assumenda eveniet error.'
  ]
];
/* spellchecker: enable */

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
