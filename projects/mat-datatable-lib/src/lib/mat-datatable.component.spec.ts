import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, TrackByFunction, ViewChild } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BehaviorSubject, first, Observable, of } from 'rxjs';

import { MatDatatableHarness, MatHeaderRowHarness, MatFooterRowHarness, MatMultiSortHarness } from '../../testing/src';
import { Page, RequestRowsRange, FieldSortDefinition, FieldFilterDefinition, DataStoreProvider } from '../interfaces/datastore-provider.interface';
import { MatColumnDefinition } from '../interfaces/datatable-column-definition.interface';
import { MatSortDefinition } from '../interfaces/datatable-sort-definition.interface';

import { MatDatatableComponent, RowSelectionType } from './mat-datatable.component';
import SINGLE_PAGE_DATA from './mocking-data/mock-data.simple';

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
          DatatableEmptyTestComponent,
          DatatableTestComponent
        ],
        providers: [
          provideNoopAnimations()
        ]
      }).compileComponents();
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
      const headerRow = await table.getHeaderRows();
      const header = await loader.getHarness(MatHeaderRowHarness);
      const headerContent = await header.getCellTextByIndex();

      expect(headerRow).toBeDefined();
      expect(headerContent.length).toEqual(4);
      expect(headerContent).toEqual(['No.', 'Name', 'Weight', 'Symbol']);
    });

    it('should create a table with correct footer', async () => {
      const table = await loader.getHarness(MatDatatableHarness);
      const footerRow = await table.getFooterRows();
      const footerRowHarness = await loader.getHarness(MatFooterRowHarness);
      const footerContent = await footerRowHarness.getCellTextByIndex();

      expect(footerRow).toBeDefined();
      expect(footerContent.length).toEqual(3);
      expect(footerContent).toEqual(['f1', 'f2', 'f4']);
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
          DatatableEmptyTestComponent,
          DatatableTestComponent
        ],
        providers: [
          provideNoopAnimations()
        ]
      }).compileComponents();
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

  describe('Table filtering', () => {
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
          DatatableEmptyTestComponent,
          DatatableTestComponent
        ],
        providers: [
          provideNoopAnimations()
        ]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(DatatableTestComponent);
      fixture.detectChanges();
      component = fixture.componentInstance;
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should filter a table for a single string value', async() => {
      const currentFilter = { fieldName:'name', value:'Helium' };
      component.currentFilters = [currentFilter] as FieldFilterDefinition<DatatableTestRow>[];
      fixture.detectChanges();
      const expectedRows = singlePageDataAsStrings.filter(element => element[1] === currentFilter.value);

      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();
      const rowContent = await table.getCellTextByIndex();

      expect(rows.length).toBe(2);
      expect(rowContent).toEqual(expectedRows);
    });

    it('should filter a table for a range of numeric values', async() => {
      const currentFilter = { fieldName:'position', valueFrom:5, valueTo:7 };
      component.currentFilters = [currentFilter] as FieldFilterDefinition<DatatableTestRow>[];
      fixture.detectChanges();
      const expectedRows = singlePageDataAsStrings.filter(element => (parseInt(element[0]) >= currentFilter.valueFrom) &&
      (parseInt(element[0]) <= currentFilter.valueTo));

      const table = await loader.getHarness(MatDatatableHarness);
      const rows = await table.getRows();
      const rowContent = await table.getCellTextByIndex();

      expect(rows.length).toBe(3);
      expect(rowContent).toEqual(expectedRows);
    });
  });

  describe('Table row activation', () => {
    let fixture: ComponentFixture<DatatableTestComponent>;
    let component: DatatableTestComponent;

    beforeEach(waitForAsync(() => {
      void TestBed.configureTestingModule({
        imports: [
          DatatableEmptyTestComponent,
          DatatableTestComponent
        ],
        providers: [
          provideNoopAnimations()
        ]
      }).compileComponents();
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
          DatatableEmptyTestComponent,
          DatatableTestComponent
        ],
        providers: [
          provideNoopAnimations()
        ]
      }).compileComponents();
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
          DatatableEmptyTestComponent,
          DatatableTestComponent
        ],
        providers: [
          provideNoopAnimations()
        ]
      }).compileComponents();
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
          DatatableEmptyTestComponent,
          DatatableTestComponent
        ],
        providers: [
          provideNoopAnimations()
        ]
      }).compileComponents();
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
          DatatableDoubleTestComponent
        ],
        providers: [
          provideNoopAnimations()
        ]
      }).compileComponents();
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

  describe('Table columns resizing', () => {
    let fixture: ComponentFixture<DatatableTestComponent>;
    let loader: HarnessLoader;

    beforeEach(waitForAsync(() => {
      void TestBed.configureTestingModule({
        imports: [
          DatatableEmptyTestComponent,
          DatatableTestComponent
        ],
        providers: [
          provideNoopAnimations()
        ]
      }).compileComponents();
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

class StaticTableDataStore<TRow> implements DataStoreProvider<TRow> {
  private trackBy: TrackByFunction<TRow>;
  private data: TRow[];
  private currentSortingDefinitions: FieldSortDefinition<TRow>[];
  private unsortedData: TRow[];

  constructor(testData: TRow[], myTrackBy?: TrackByFunction<TRow>) {
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
    sorts?: FieldSortDefinition<TRow>[],
    filters?: FieldFilterDefinition<TRow>[]
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
    } as Page<TRow>;
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
    row: TRow,
    sorts?: FieldSortDefinition<TRow>[],
    filters?: FieldFilterDefinition<TRow>[]
  ): Observable<number> {
    const selectedDataset = this.getRawDataSortedFiltered(sorts, filters);
    return of(selectedDataset.findIndex(currentRow => this.trackBy(0, row) === this.trackBy(0, currentRow)));
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

  private getRawDataSortedFiltered(
    sorts?: FieldSortDefinition<TRow>[],
    filters?: FieldFilterDefinition<TRow>[]
  ) {
    let selectedDataset = structuredClone(this.unsortedData);

    // Filter data
    if ((filters !== undefined) && Array.isArray(filters) && (filters.length > 0)) {
      selectedDataset = selectedDataset.filter((row: TRow) => {
        return filters.reduce((isSelected: boolean, currentFilter: FieldFilterDefinition<TRow>) => {
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
  private defaultTrackBy(this: void, index: number, item: TRow): string {
    return JSON.stringify(item);
  }

  /**
   * Compare function for sorting the current dataset.
   * @param a - row to compare against
   * @param b - row to compare with parameter a
   * @returns 0:a===b; -1:a<b; 1:a>b
   */
  private compareFn = (a: TRow, b: TRow): number => {
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
    width: '5em',
    footer: 'f1',
    footerAlignment: 'right'
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
    sortable: true,
    footer: 'f2',
    footerColumnSpan: 2
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
    showAsMailtoLink: true,
    footer: 'f4'
  }
];

const datatableTestData: DatatableTestRow[] = SINGLE_PAGE_DATA;

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
    (rowSelectionChange)="onRowSelectionChange($event)"
    (sortChange)="onSortChanged($event)"
    >
    No data to display.
  </mat-datatable>
</div>
  `,
  styles: ['.content-table { height: 400px; }'],
  standalone: true,
  imports: [
    MatDatatableComponent
  ]
})
class DatatableTestComponent {
  @ViewChild('testTable') matDataTable!: MatDatatableComponent<DatatableTestRow>;
  public lastClickedRowAsString = '-';
  public selectedRowsAsString = '-';

  protected dataStore = new StaticTableDataStore<DatatableTestRow>(datatableTestData, this.trackBy);
  protected columnDefinitions = datatableTestColumnDefinitions;
  protected displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  protected currentSorts: MatSortDefinition[] = [];
  protected readonly currentSorts$ = new BehaviorSubject<MatSortDefinition[]>([]);
  protected currentSelectionMode: RowSelectionType = 'none';

  public get currentFilters() : FieldFilterDefinition<DatatableTestRow>[] {
    return this.matDataTable.filterDefinitions;
  }
  public set currentFilters(newFilters : FieldFilterDefinition<DatatableTestRow>[]) {
    if (newFilters && Array.isArray(newFilters)) {
      this.matDataTable.filterDefinitions = newFilters;
    }
  }

  getRow(rowIndex: number, fromSortedRows = false) {
    return this.dataStore.getRow(rowIndex, fromSortedRows);
  }

  protected trackBy(this: void, index: number, item: DatatableTestRow) {
    return item?.position ?? -1;
  }

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
<div class="content-table">
  <mat-datatable
    [columnDefinitions]="columnDefinitions"
    [displayedColumns]="displayedColumns"
    [rowSelectionMode]="currentSelectionMode"
    [withFooter]="true"
    [dataStoreProvider]="dataStore"
    [trackBy]="trackBy"
    (rowClick)="onRowClick($event)"
    (sortChange)="onSortChanged($event)"
    >
    No data to display.
  </mat-datatable>
</div>
  `,
  styles: ['.content-table { height: 400px; }'],
  standalone: true,
  imports: [
    MatDatatableComponent
  ]
})
class DatatableEmptyTestComponent {
  dataStore = new StaticTableDataStore<DatatableTestRow>([] as DatatableTestRow[], this.trackBy);
  protected columnDefinitions = datatableTestColumnDefinitions;
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  protected currentSorts: MatSortDefinition[] = [];
  protected readonly currentSorts$ = new BehaviorSubject<MatSortDefinition[]>([]);
  protected currentSelectionMode: RowSelectionType = 'none';
  protected selectedRowsAsString = '-';

  protected trackBy(this: void, index: number, item: DatatableTestRow) {
    return item?.position ?? -1;
  }

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
<div class="content-table">
  <mat-datatable #testTable1
    [columnDefinitions]="columnDefinitions"
    [displayedColumns]="displayedColumns"
    [withFooter]="true"
    [dataStoreProvider]="dataStore1"
    [trackBy]="trackBy"
    (sortChange)="onSortChanged1($event)"
    >
    No data to display.
  </mat-datatable>
  <mat-datatable #testTable2
    [columnDefinitions]="columnDefinitions"
    [displayedColumns]="displayedColumns"
    [withFooter]="true"
    [dataStoreProvider]="dataStore2"
    [trackBy]="trackBy"
    (sortChange)="onSortChanged2($event)"
    >
    No data to display.
  </mat-datatable>
</div>
  `,
  styles: ['.content-table { height: 400px; }'],
  standalone: true,
  imports: [
    MatDatatableComponent
  ]
})
class DatatableDoubleTestComponent {
  @ViewChild('testTable1') matDataTable1!: MatDatatableComponent<DatatableTestRow>;
  @ViewChild('testTable2') matDataTable2!: MatDatatableComponent<DatatableTestRow>;

  dataStore1 = new StaticTableDataStore<DatatableTestRow>(structuredClone(datatableTestData), this.trackBy);
  dataStore2 = new StaticTableDataStore<DatatableTestRow>(structuredClone(datatableTestData), this.trackBy);
  protected columnDefinitions = datatableTestColumnDefinitions;
  protected displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  protected currentSorts1: MatSortDefinition[] = [];
  protected readonly currentSorts1$ = new BehaviorSubject<MatSortDefinition[]>([]);
  protected currentSorts2: MatSortDefinition[] = [];
  protected readonly currentSorts2$ = new BehaviorSubject<MatSortDefinition[]>([]);

  protected trackBy(this: void, index: number, item: DatatableTestRow) {
    return item?.position ?? -1;
  }

  protected onSortChanged1(currentSorts: MatSortDefinition[]) {
    this.currentSorts1 = currentSorts;
    this.currentSorts1$.next(currentSorts);
  }
  protected onSortChanged2(currentSorts: MatSortDefinition[]) {
    this.currentSorts2 = currentSorts;
    this.currentSorts2$.next(currentSorts);
  }
}
