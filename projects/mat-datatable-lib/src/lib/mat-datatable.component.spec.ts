import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDatatableComponent } from './mat-datatable.component';

describe('MatDatatableComponent', () => {
  let component: MatDatatableComponent;
  let fixture: ComponentFixture<MatDatatableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatDatatableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
