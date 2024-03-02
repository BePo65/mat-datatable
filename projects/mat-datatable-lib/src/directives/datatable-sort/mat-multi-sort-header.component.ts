/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @angular-eslint/no-host-metadata-property */

import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  Optional,
  ViewEncapsulation,
  isDevMode
} from '@angular/core';
import {
  matSortAnimations,
  MatSortDefaultOptions,
  MatSortHeader,
  MatSortHeaderIntl,
  MAT_SORT_DEFAULT_OPTIONS,
  Sort,
  SortDirection
} from '@angular/material/sort';
import { Subject, takeUntil } from 'rxjs';

import { getMultiSortHeaderNotContainedWithinMultiSortError } from './mat-multi-sort-errors';
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
export class MatMultiSortHeader extends MatSortHeader implements AfterViewInit, CanDisable, OnDestroy {
  @Input('mat-multi-sort-header') override id!: string;

  sortingPosition = '';

  private readonly unsubscribe$ = new Subject<void>();

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
      if (!_sort && isDevMode()) {
        throw getMultiSortHeaderNotContainedWithinMultiSortError();
      }

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

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    this._sort.multiSortChange
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((sorts: Sort[]) => {
        const sortIndex = sorts.findIndex(sort => sort.active === this.id);
        if (sortIndex >= 0) {
          this.sortingPosition = (sortIndex + 1).toString();
        } else {
          this.sortingPosition = '';
        }
      });
  }

  override ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    super.ngOnDestroy();
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
    this._arrowDirection = this._getSortDirection();
  }

  /**
   * Gets the aria-sort attribute that should be applied to this sort header. If this header
   * is not sorted, returns null so that the attribute is removed from the host element. Aria spec
   * says that the aria-sort property should only be present on one header at a time, so removing
   * ensures this is true.
   * @returns string ('ascending' | 'descending') to be used as aria-sort content
   */
  override _getAriaSortAttribute() {
    if (!this._isSorted()) {
      return 'none';
    }

    const sortingDefinition = this._sort.sortDefinitions.find(sort => sort.active === this.id);
    return sortingDefinition?.direction == 'asc' ? 'ascending' : 'descending';
  }

  _getSortDirection(): SortDirection {
    const i = this._sort.sortDefinitions.findIndex(sort => sort.active === this.id);
    return this._isSorted() ? this._sort.sortDefinitions[i].direction : (this.start || this._sort.start);
  }
}
