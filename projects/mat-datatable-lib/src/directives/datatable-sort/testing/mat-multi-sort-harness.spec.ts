import { HarnessLoader, parallel } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MatMultiSort, MatMultiSortModule, Sort } from '../public-api';

import { MatMultiSortHarness } from './mat-multi-sort-harness';

describe('MatSortHarness', () => {
  let fixture: ComponentFixture<SortHarnessTestComponent>;
  let loader: HarnessLoader;
  let component: SortHarnessTestComponent;

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      imports: [
        MatMultiSortModule,
        NoopAnimationsModule
      ],
      declarations: [
        SortHarnessTestComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SortHarnessTestComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness for mat-multi-sort', async () => {
    const sorts = await loader.getAllHarnesses(MatMultiSortHarness);

    expect(sorts).toHaveSize(1);
  });

  it('should load the harnesses for all the headers in a mat-multi-sort', async () => {
    const sort = await loader.getHarness(MatMultiSortHarness);
    const headers = await sort.getSortHeaders();

    expect(headers).toHaveSize(5);
  });

  it('should be able to filter headers by their label text', async () => {
    const sort = await loader.getHarness(MatMultiSortHarness);
    const headers = await sort.getSortHeaders({label: 'Carbs'});

    expect(headers).toHaveSize(1);
    expect(await headers[0].getLabel()).toBe('Carbs');
  });

  it('should be able to filter headers by their labels via a regex', async () => {
    const sort = await loader.getHarness(MatMultiSortHarness);
    const headers = await sort.getSortHeaders({label: /^C/});
    const labels = await parallel(() => headers.map(header => header.getLabel()));

    expect(headers).toHaveSize(2);
    expect(labels).toEqual(['Calories', 'Carbs']);
  });

  it('should be able to filter headers by their sorted state for 1 sorted column', async () => {
    const sort = await loader.getHarness(MatMultiSortHarness);
    let headers = await sort.getSortHeaders({sortDirection: ''});

    expect(headers).toHaveSize(5);

    await headers[0].click();

    headers = await sort.getSortHeaders({sortDirection: 'asc'});

    expect(headers).toHaveSize(1);
  });

  it('should be able to filter headers by their sorted state for multiple sorted columns', async () => {
    const sort = await loader.getHarness(MatMultiSortHarness);
    let headers = await sort.getSortHeaders({sortDirection: ''});

    expect(headers).toHaveSize(5);

    const sortDefinitions: Sort[] = [
      { active:'protein', direction:'desc' },
      { active:'calories', direction:'asc' },
      { active:'name', direction:'asc' }
    ];
    component.matMultiSort.sortDefinitions = sortDefinitions;
    fixture.detectChanges();

    headers = await sort.getSortHeaders({sortDirection: 'asc'});

    expect(headers).toHaveSize(2);
  });

  it('should be able to filter headers by their sorted state for multiple columns', async () => {
    const matMultiSort = await loader.getHarness(MatMultiSortHarness);
    const headers = await matMultiSort.getSortHeaders({sortDirection: ''});

    const sortDefinitions: Sort[] = [
      { active:'protein', direction:'desc' },
      { active:'name', direction:'asc' }
    ];
    component.matMultiSort.sortDefinitions = sortDefinitions;
    fixture.detectChanges();

    const activeHeaders = await matMultiSort.getActiveHeaders();
    const activeIds = await parallel(() => activeHeaders.map(header => header.getId()));
    const activeLabels = await parallel(() => activeHeaders.map(header => header.getLabel()));
    const activeSortDirections = await parallel(() => activeHeaders.map(header => header.getSortDirection()));
    const activeSortPositions = await parallel(() => activeHeaders.map(header => header.getSortPosition()));

    expect(headers).toHaveSize(5);

    expect(activeHeaders).toBeTruthy();
    expect(activeHeaders).toHaveSize(2);
    expect(activeIds).toHaveSize(2);
    expect(activeLabels).toHaveSize(2);
    expect(activeSortDirections).toHaveSize(2);
    expect(activeSortPositions).toHaveSize(2);

    // activeHeaders, activeIds etc are sorted by column number not sorting order.
    expect(await activeHeaders[0].isActive()).toBeTruthy();
    expect(activeIds[0]).toBe('name');
    expect(activeLabels[0]).toBe('Dessert');
    expect(activeSortDirections[0]).toBe('asc');
    expect(activeSortPositions[0]).toBe(2);

    expect(await activeHeaders[1].isActive()).toBeTruthy();
    expect(activeIds[1]).toBe('protein');
    expect(activeLabels[1]).toBe('Protein');
    expect(activeSortDirections[1]).toBe('desc');
    expect(activeSortPositions[1]).toBe(1);
  });

  it('should be able to get header by the sorting position', async () => {
    const sort = await loader.getHarness(MatMultiSortHarness);
    const sortDefinitions: Sort[] = [
      { active:'protein', direction:'desc' },
      { active:'calories', direction:'asc' },
      { active:'name', direction:'asc' }
    ];
    component.matMultiSort.sortDefinitions = sortDefinitions;
    fixture.detectChanges();

    const headers = await sort.getSortHeaders({sortPosition: 3});

    expect(headers).toHaveSize(1);
    expect(await headers[0].getId()).toBe('name');
    expect(await headers[0].getLabel()).toBe('Dessert');
    expect(await headers[0].getSortDirection()).toBe('asc');
    expect(await headers[0].getSortPosition()).toBe(3);
  });

  it('should be able to get the label of a header', async () => {
    const sort = await loader.getHarness(MatMultiSortHarness);
    const headers = await sort.getSortHeaders();
    const labels = await parallel(() => headers.map(header => header.getLabel()));

    expect(labels).toEqual(['Dessert', 'Calories', 'Fat', 'Carbs', 'Protein']);
  });

  it('should get the disabled state of a header', async () => {
    const sort = await loader.getHarness(MatMultiSortHarness);
    const thirdHeader = (await sort.getSortHeaders())[2];

    expect(await thirdHeader.isDisabled()).toBe(false);

    fixture.componentInstance.disableThirdHeader = true;
    fixture.detectChanges();

    expect(await thirdHeader.isDisabled()).toBe(true);
  });

  it('should get the active state of a header', async () => {
    const sort = await loader.getHarness(MatMultiSortHarness);
    const secondHeader = (await sort.getSortHeaders())[1];

    expect(await secondHeader.isActive()).toBe(false);

    await secondHeader.click();

    expect(await secondHeader.isActive()).toBe(true);
  });

  it('should get the sort direction of a header', async () => {
    const sort = await loader.getHarness(MatMultiSortHarness);
    const secondHeader = (await sort.getSortHeaders())[1];

    expect(await secondHeader.getSortDirection()).toBe('');

    await secondHeader.click();

    expect(await secondHeader.getSortDirection()).toBe('asc');

    await secondHeader.click();

    expect(await secondHeader.getSortDirection()).toBe('desc');
  });

  it('should get the active header for 1 sorted column', async () => {
    const sort = await loader.getHarness(MatMultiSortHarness);
    const fifthHeader = (await sort.getSortHeaders())[4];
    let activeHeaders = await sort.getActiveHeaders();

    expect(activeHeaders).toBeTruthy();
    expect(activeHeaders).toHaveSize(0);

    await fifthHeader.click();

    activeHeaders = await sort.getActiveHeaders();

    expect(activeHeaders).toBeTruthy();
    expect(activeHeaders).toHaveSize(1);
    expect(await activeHeaders[0].getLabel()).toBe('Protein');
  });

  it('should get the active headers for multiple sorted columns', async () => {
    const matMultiSort = await loader.getHarness(MatMultiSortHarness);
    const headers = await matMultiSort.getSortHeaders({sortDirection: ''});

    const sortDefinitions: Sort[] = [
      { active:'protein', direction:'desc' },
      { active:'name', direction:'asc' }
    ];
    component.matMultiSort.sortDefinitions = sortDefinitions;
    fixture.detectChanges();

    const activeHeaders = await matMultiSort.getActiveHeaders();
    const activeIds = await parallel(() => activeHeaders.map(header => header.getId()));
    const activeLabels = await parallel(() => activeHeaders.map(header => header.getLabel()));
    const activeSortDirections = await parallel(() => activeHeaders.map(header => header.getSortDirection()));
    const activeSortPositions = await parallel(() => activeHeaders.map(header => header.getSortPosition()));

    expect(headers).toHaveSize(5);

    expect(activeHeaders).toBeTruthy();
    expect(activeHeaders).toHaveSize(2);
    expect(activeIds).toHaveSize(2);
    expect(activeLabels).toHaveSize(2);
    expect(activeSortDirections).toHaveSize(2);
    expect(activeSortPositions).toHaveSize(2);

    // activeHeaders, activeIds etc are sorted by column number not sorting order.
    expect(await activeHeaders[0].isActive()).toBeTruthy();
    expect(activeIds[0]).toBe('name');
    expect(activeLabels[0]).toBe('Dessert');
    expect(activeSortDirections[0]).toBe('asc');
    expect(activeSortPositions[0]).toBe(2);

    expect(await activeHeaders[1].isActive()).toBeTruthy();
    expect(activeIds[1]).toBe('protein');
    expect(activeLabels[1]).toBe('Protein');
    expect(activeSortDirections[1]).toBe('desc');
    expect(activeSortPositions[1]).toBe(1);
  });

  it('should get the label of a sorted header', async () => {
    const sort = await loader.getHarness(MatMultiSortHarness);
    const headers = await sort.getSortHeaders();

    const sortDefinitions: Sort[] = [
      { active:'name', direction:'asc' }
    ];
    component.matMultiSort.sortDefinitions = sortDefinitions;
    fixture.detectChanges();

    expect(headers).toHaveSize(5);

    expect(await headers[0].getLabel()).toBe('Dessert');
  });

  it('should get the label of a non sorted header', async () => {
    const sort = await loader.getHarness(MatMultiSortHarness);
    const headers = await sort.getSortHeaders();

    const sortDefinitions: Sort[] = [
      { active:'name', direction:'asc' }
    ];
    component.matMultiSort.sortDefinitions = sortDefinitions;
    fixture.detectChanges();

    expect(headers).toHaveSize(5);

    expect(await headers[1].getLabel()).toBe('Calories');
  });

  it('should get the sorting direction of a sorted header', async () => {
    const sort = await loader.getHarness(MatMultiSortHarness);
    const headers = await sort.getSortHeaders();

    const sortDefinitions: Sort[] = [
      { active:'calories', direction:'desc' }
    ];
    component.matMultiSort.sortDefinitions = sortDefinitions;
    fixture.detectChanges();

    expect(headers).toHaveSize(5);

    expect(await headers[1].getSortDirection()).toBe('desc');
  });

  it('should get the sorting direction of a non sorted header', async () => {
    const sort = await loader.getHarness(MatMultiSortHarness);
    const headers = await sort.getSortHeaders();

    const sortDefinitions: Sort[] = [
      { active:'name', direction:'asc' }
    ];
    component.matMultiSort.sortDefinitions = sortDefinitions;
    fixture.detectChanges();

    expect(headers).toHaveSize(5);

    expect(await headers[1].getSortDirection()).toBe('');
  });

  it('should get the sorting position of a sorted header', async () => {
    const sort = await loader.getHarness(MatMultiSortHarness);
    const headers = await sort.getSortHeaders();

    const sortDefinitions: Sort[] = [
      { active:'name', direction:'desc' }
    ];
    component.matMultiSort.sortDefinitions = sortDefinitions;
    fixture.detectChanges();

    expect(headers).toHaveSize(5);

    expect(await headers[0].getSortPosition()).toBe(1);
  });

  it('should get the sorting position of a non sorted header', async () => {
    const sort = await loader.getHarness(MatMultiSortHarness);
    const headers = await sort.getSortHeaders();

    const sortDefinitions: Sort[] = [
      { active:'name', direction:'asc' }
    ];
    component.matMultiSort.sortDefinitions = sortDefinitions;
    fixture.detectChanges();

    expect(headers).toHaveSize(5);

    expect(await headers[1].getSortPosition()).toBeNaN();
  });
});

type Dessert = {
  name: string;
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
};

@Component({
  template: `
    <table matMultiSort (matMultiSortChange)="multiSortData($event)">
      <tr>
        <th mat-multi-sort-header="name">Dessert</th>
        <th mat-multi-sort-header="calories">Calories</th>
        <th mat-multi-sort-header="fat" [disabled]="disableThirdHeader">Fat</th>
        <th mat-multi-sort-header="carbs">Carbs</th>
        <th mat-multi-sort-header="protein">Protein</th>
      </tr>

      <tr *ngFor="let dessert of sortedData">
        <td>{{dessert.name}}</td>
        <td>{{dessert.calories}}</td>
        <td>{{dessert.fat}}</td>
        <td>{{dessert.carbs}}</td>
        <td>{{dessert.protein}}</td>
      </tr>
    </table>
  `
})
class SortHarnessTestComponent {
  disableThirdHeader = false;

  @ViewChild(MatMultiSort) matMultiSort!: MatMultiSort;

  desserts: Dessert[] = [
    { name: 'Frozen yogurt', calories: 159, fat: 6, carbs: 24, protein: 4 },
    { name: 'Ice cream sandwich', calories: 237, fat: 9, carbs: 37, protein: 4 },
    { name: 'Eclair', calories: 262, fat: 16, carbs: 24, protein: 6 },
    { name: 'Cupcake', calories: 305, fat: 4, carbs: 67, protein: 4 },
    { name: 'Gingerbread', calories: 356, fat: 16, carbs: 49, protein: 4 }
  ];

  sortedData = this.desserts.slice();

  multiSortData(sorts: Sort[]) {
    const data = this.desserts.slice();

    if (sorts.length === 0) {
      this.sortedData = data;
    } else {
      this.sortedData = data.sort((a, b) => {
        let result = 0;
        for (let i = 0; i < sorts.length; i++) {
          const fieldName = sorts[i].active;
          const isAsc = (sorts[i].direction === 'asc');
          const valueA = a[fieldName as keyof Dessert];
          const valueB = b[fieldName as keyof Dessert];
          result = compare(valueA, valueB, isAsc);
          if (result !== 0) {
            break;
          }
        }
        return result;
      });
    }
  }
}

/**
 * Simple sort comparator for string | number values.
 *
 * @param a - 1st parameter to compare
 * @param b - 2nd parameter to compare
 * @param isAsc - is this an ascending comparison
 * @returns comparison result
 */
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a === b ? 0 : (a < b ? -1 : 1)) * (isAsc ? 1 : -1);
}
