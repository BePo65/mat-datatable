import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDatatableLibComponent } from './mat-datatable-lib.component';

describe('MatDatatableLibComponent', () => {
  let component: MatDatatableLibComponent;
  let fixture: ComponentFixture<MatDatatableLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatDatatableLibComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatDatatableLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
