/* eslint-disable @angular-eslint/no-host-metadata-property */

import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  Optional,
  ViewEncapsulation
} from '@angular/core';
import {
  matSortAnimations,
  MatSortDefaultOptions,
  MatSortHeader,
  MatSortHeaderIntl,
  MAT_SORT_DEFAULT_OPTIONS,
  SortDirection
} from '@angular/material/sort';

import { MatMultiSort } from './mat-multi-sort.directive';

interface CanDisable {
  /** Whether the component is disabled. */
  disabled: boolean;
}

/** Column definition associated with a `MatSortHeader`. */
interface MatSortHeaderColumnDef {
  name: string;
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[mat-multi-sort-header]',
  exportAs: 'matMultiSortHeader',
  templateUrl: './mat-multi-sort-header.component.html',
  styleUrls: ['./mat-multi-sort-header.component.scss'],
  host: {
    'class': 'mat-multi-sort-header'
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['disabled'],
  animations: [
    matSortAnimations.indicator,
    matSortAnimations.leftPointer,
    matSortAnimations.rightPointer,
    matSortAnimations.arrowOpacity,
    matSortAnimations.arrowPosition,
    matSortAnimations.allowChildren
  ]
})
export class MatMultiSortHeaderComponent extends MatSortHeader implements CanDisable {
  @Input('mat-multi-sort-header') override id!: string;

  constructor(
    public override _intl: MatSortHeaderIntl,
    changeDetectorRef: ChangeDetectorRef,
    @Optional() public override _sort: MatMultiSort,
    @Inject('MAT_SORT_HEADER_COLUMN_DEF')
    @Optional() public override _columnDef: MatSortHeaderColumnDef,
    _focusMonitor: FocusMonitor,
    _elementRef: ElementRef<HTMLElement>,
    @Optional() _ariaDescriber?: AriaDescriber | null,
    @Optional() @Inject(MAT_SORT_DEFAULT_OPTIONS)
    defaultOptions?: MatSortDefaultOptions) {
    super(
      _intl,
      changeDetectorRef,
      _sort,
      _columnDef,
      _focusMonitor,
      _elementRef,
      _ariaDescriber,
      defaultOptions
    );
  }

  // Whether this MatMultiSortHeader is currently sorted in either ascending or descending order.
  override _isSorted() {
    return this._sort.sortDefinitions.findIndex(sort => sort.active === this.id) > -1;
  }

  /**
   * Updates the direction the arrow should be pointing. If it is not sorted, the arrow should be
   * facing the start direction. Otherwise if it is sorted, the arrow should point in the currently
   * active sorted direction. The reason this is updated through a function is because the direction
   * should only be changed at specific times - when deactivated but the hint is displayed and when
   * the sort is active and the direction changes. Otherwise the arrow's direction should linger
   * in cases such as the sort becoming deactivated but we want to animate the arrow away while
   * preserving its direction, even though the next sort direction is actually different and should
   * only be changed once the arrow displays again (hint or activation).
   */
  override _updateArrowDirection() {
    super._arrowDirection = this.getSortDirection();
  }

  getSortDirection(): SortDirection {
    const i = this._sort.sortDefinitions.findIndex(sort => sort.active === this.id);
    return this._isSorted() ? this._sort.sortDefinitions[i].direction : (this.start || this._sort.start);
  }
}
