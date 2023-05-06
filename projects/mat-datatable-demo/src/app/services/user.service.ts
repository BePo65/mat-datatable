import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { DemoTableItem } from '../shared/demo-table-item.interface';

import EXAMPLE_DATA from './demo-table.mock.data';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly _dataStream = new BehaviorSubject<(DemoTableItem[])>([]);

  constructor() {
    // TODO add injected elements
  }

  getUser(): Observable<DemoTableItem[]> {
    this._dataStream.next(EXAMPLE_DATA);
    return this._dataStream.asObservable();
  }
}
