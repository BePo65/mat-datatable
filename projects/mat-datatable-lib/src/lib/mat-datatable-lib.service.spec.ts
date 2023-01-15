import { TestBed } from '@angular/core/testing';

import { MatDatatableLibService } from './mat-datatable-lib.service';

describe('MatDatatableLibService', () => {
  let service: MatDatatableLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatDatatableLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
