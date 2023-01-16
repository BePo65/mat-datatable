import { TestBed } from '@angular/core/testing';

import { MatDatatableService } from './mat-datatable.service';

describe('MatDatatableService', () => {
  let service: MatDatatableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatDatatableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
