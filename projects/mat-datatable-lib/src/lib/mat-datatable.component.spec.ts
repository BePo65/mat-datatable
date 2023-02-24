import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MatDatatableComponent } from './mat-datatable.component';

interface TestTableItem {
  name: string;
  id: number;
}

describe('MatDatatableComponent', () => {
  let component: MatDatatableComponent<TestTableItem>;
  let fixture: ComponentFixture<MatDatatableComponent<TestTableItem>>;

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      declarations: [ MatDatatableComponent ],
      imports: [
        NoopAnimationsModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatDatatableComponent<TestTableItem>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });
});
