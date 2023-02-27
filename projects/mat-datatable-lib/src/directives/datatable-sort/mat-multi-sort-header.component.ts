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
interface C2MatSortHeaderColumnDef {
  name: string;
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[mat-multi-sort-header]',
  exportAs: 'matMultiSortHeader',
  templateUrl: './mat-multi-sort-header.component.html',
  styleUrls: ['./mat-multi-sort-header.component.scss'],
  host: {
    'class': 'mat-sort-header',
    '(click)': '_handleClick()',
    '(keydown)': '_handleKeydown($event)',
    '(mouseenter)': '_setIndicatorHintVisible(true)',
    '(mouseleave)': '_setIndicatorHintVisible(false)',
    '[class.mat-sort-header-disabled]': '_isDisabled()'
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
    @Optional()
    public override _columnDef: C2MatSortHeaderColumnDef,
    _focusMonitor: FocusMonitor,
    _elementRef: ElementRef<HTMLElement>,
    @Optional() _ariaDescriber?: AriaDescriber | null,
    @Optional()
    @Inject(MAT_SORT_DEFAULT_OPTIONS)
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

  // TODO @HostListener('longpress', ['true'])
  __setIndicatorHintVisible(visible: string | boolean) {
    super._setIndicatorHintVisible(visible as boolean);
  }

  override _handleClick() {
    super._handleClick();
  }

  override disabled!: boolean;

  override _isSorted() {
    return this._sort.actives.findIndex(activeId => activeId === this.id) > -1;
  }

  override _updateArrowDirection() {
    super._arrowDirection = this.getSortDirection();
  }

  override _isDisabled() {
    return this._sort.disabled || this.disabled;
  }

  override _renderArrow() {
    return !this._isDisabled() || this._isSorted();
  }

  getSortDirection(): SortDirection {
    const i = this._sort.actives.findIndex(activeIds => activeIds === this.id);
    const direction = this._sort.directions[i];
    return this._isSorted() ? direction : (this.start || this._sort.start);
  }

}
