/**
 * Based on https://github.com/diprokon/ng-table-virtual-scroll.
 * Adapted for use with mat-datatable project.
 */

import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { CanStick, CdkTable } from '@angular/cdk/table';
import {
  AfterContentInit,
  ContentChild,
  Directive,
  HostListener,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output
} from '@angular/core';
import { MatTable } from '@angular/material/table';
import { BehaviorSubject, combineLatest, from, ReplaySubject, Subject } from 'rxjs';
import {
  delay,
  delayWhen,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap
} from 'rxjs/operators';

import { isTVSDataSource, TableVirtualScrollDataSource } from '../../components/data-source.class';
import { RequestRowsRange } from '../../interfaces/datasource-endpoint.interface';

import { FixedSizeTableVirtualScrollStrategy } from './fixed-size-table-virtual-scroll-strategy';

type SwitchDataSource<T> = (dataSource: TableVirtualScrollDataSource<T>) => void;

/**
 * Make one selector out of an array of css selector arrays.
 * Used to identify e.g. all header rows or al footer rows of a material table.
 * The inner array contains css selectors that are combined to be use as 'and'.
 * These strings are then combined with a ',' to an 'or' selector.
 * @param pairs - rxjs selectors to combine
 * @returns combined selectors
 */
const combineSelectors = (...pairs: string[][]): string =>
  pairs.map(selectors => `${selectors.join(' ')}, ${selectors.join('')}`).join(', ');

const stickyHeaderSelector = combineSelectors(
  ['.mat-mdc-header-row', '.mat-mdc-table-sticky'],
  ['.mat-header-row', '.mat-table-sticky']
);

const stickyFooterSelector = combineSelectors(
  ['.mat-mdc-footer-row', '.mat-mdc-table-sticky'],
  ['.mat-footer-row', '.mat-table-sticky']
);

/**
 * Is the table an angular material table?
 * @param table - object under inspection
 * @returns true, if table is an angular material table
 */
const isMatTable = <T>(table: unknown): table is MatTable<T> =>
  table instanceof CdkTable && table['stickyCssClass'].includes('mat');

const defaults = {
  rowHeight: 52,
  headerHeight: 56,
  headerEnabled: true,
  footerHeight: 52,
  footerEnabled: false,
  bufferMultiplier: 1.5
};

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'cdk-virtual-scroll-viewport[tvsItemSize]',
  exportAs: 'table-virtual-scroll',
  providers: [{
    provide: VIRTUAL_SCROLL_STRATEGY,
    useFactory: () => new FixedSizeTableVirtualScrollStrategy()
  }]
})
export class TableItemSizeDirective<T = unknown> implements OnChanges, AfterContentInit, OnDestroy {
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        this.scrollToIndex(this.firstVisibleIndexChanged$.value + 1);
        break;
      case 'ArrowUp':
        this.scrollToIndex(Math.max(this.firstVisibleIndexChanged$.value - 1, 0));
        break;
      case 'PageDown':
        // show the 'old' last line as 'new' first line
        this.scrollToIndex((this.firstVisibleIndexChanged$.value + this.visibleRowsChanged$.value - 1));
        break;
      case 'PageUp':
        // show the 'old' first line as 'new' last line
        this.scrollToIndex(Math.max(this.firstVisibleIndexChanged$.value - this.visibleRowsChanged$.value + 1, 0));
        break;
      case 'End':
        this.scrollToIndex(this.scrollStrategy.dataLength - 1);
        break;
      case 'Home':
        this.scrollToIndex(0);
        break;
    }
  }

  @Input('tvsItemSize')
  rowHeight: string | number = defaults.rowHeight;

  @Input()
  headerEnabled: boolean = defaults.headerEnabled;

  @Input()
  headerHeight: string | number = defaults.headerHeight;

  @Input()
  footerEnabled: boolean = defaults.footerEnabled;

  @Input()
  footerHeight: string | number = defaults.footerHeight;

  /**
   * Used to calculate the number of items buffered before the first and after the last displayed item;
   * NumberOfBufferedItems = displayed items * bufferMultiplier
   */
  @Input()
  bufferMultiplier: string | number = defaults.bufferMultiplier;

  private readonly firstVisibleIndexChanged$ = new BehaviorSubject<number>(0);
  @Output()
  firstVisibleIndexChanged = this.firstVisibleIndexChanged$.asObservable();

  private readonly visibleRowsChanged$ = new BehaviorSubject<number>(0);
  @Output()
  visibleRowsChanged = this.visibleRowsChanged$.asObservable();

  private readonly totalRowsChanged$ = new BehaviorSubject<number>(0);
  @Output()
  totalRowsChanged = this.totalRowsChanged$.asObservable();

  private readonly filteredRowsChanged$ = new BehaviorSubject<number>(0);
  @Output()
  filteredRowsChanged = this.filteredRowsChanged$.asObservable();

  @ContentChild(CdkTable, { static: false })
  protected table!: CdkTable<T>;

  protected scrollStrategy: FixedSizeTableVirtualScrollStrategy;

  // Stream that emits range of rows requested by the virtual scroller
  private readonly rangeToDisplay$ = new ReplaySubject<RequestRowsRange>(1);

  // Stream that emits when the data source gets changed and needs to be reattached
  private readonly dataSourceChanges$ = new Subject<void>();

  // Stream that emits when this TableItemSizeDirective gets destroyed; used to terminate all streams
  private readonly unsubscribe$ = new Subject<void>();

  private stickyPositions!: Map<HTMLElement, number> | null;
  private resetStickyPositions = new Subject<void>();
  private stickyEnabled = {
    header: false,
    footer: false
  };

  constructor(
    private ngZone: NgZone,
    @Inject(VIRTUAL_SCROLL_STRATEGY)
    virtualScrollStrategy: FixedSizeTableVirtualScrollStrategy
  ) {
    this.scrollStrategy = virtualScrollStrategy;

    virtualScrollStrategy.scrolledIndexChange
      .pipe(
        takeUntil(this.unsubscribe$),
        // used to avoid "ExpressionChangedAfterItHasBeenCheckedError"
        delay(0)
      )
      .subscribe(index =>
        /**
         * In order to avoid hitting change detection for every scroll event, all of the events
         * emitted from the scrolledIndexChange stream will be run outside the Angular zone.
         * To update any data bindings as a result of such an event, you have to run the callback
         * using 'NgZone.run'.
         */
        this.ngZone.run(() => this.firstVisibleIndexChanged$.next(index))
      );

    virtualScrollStrategy.visibleRowsChange
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(visibleRows =>
        setTimeout(() => this.visibleRowsChanged$.next(visibleRows), 0)
      );
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.dataSourceChanges$.complete();
  }

  ngAfterContentInit() {
    // When property 'dataSource' of table is set, reconnect dataSource here too
    const switchDataSourceOrigin = this.table['_switchDataSource'] as SwitchDataSource<T>;
    this.table['_switchDataSource'] = (dataSource: TableVirtualScrollDataSource<T>) => {
      switchDataSourceOrigin.call(this.table, dataSource);
      this.connectDataSource(dataSource);
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const updateStickyColumnStylesOrigin = this.table.updateStickyColumnStyles;
    this.table.updateStickyColumnStyles = () => {
      const stickyColumnStylesNeedReset = this.table['_stickyColumnStylesNeedReset'] as boolean;
      updateStickyColumnStylesOrigin.call(this.table);
      if (stickyColumnStylesNeedReset) {
        this.resetStickyPositions.next();
      }
    };

    this.connectDataSource(this.table.dataSource as TableVirtualScrollDataSource<T>);

    // Handle changes to sticky rows
    combineLatest([
      this.scrollStrategy.stickyChange,
      this.resetStickyPositions
        .pipe(
          startWith(void 0),
          delayWhen(() => this.getScheduleObservable()),
          tap(() => this.stickyPositions = null)
        )
    ])
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([stickyOffset]) => {
        if (!this.stickyPositions) {
          this.initStickyPositions();
        }
        if (this.stickyEnabled.header) {
          this.setStickyHeader(stickyOffset);
        }
        if (this.stickyEnabled.footer) {
          this.setStickyFooter(stickyOffset);
        }
      });
  }

  ngOnChanges() {
    const config = {
      rowHeight: +this.rowHeight || defaults.rowHeight,
      headerHeight: this.headerEnabled ? +this.headerHeight || defaults.headerHeight : 0,
      footerHeight: this.footerEnabled ? +this.footerHeight || defaults.footerHeight : 0,
      bufferMultiplier: +this.bufferMultiplier || defaults.bufferMultiplier
    };
    this.scrollStrategy.setConfig(config);
  }

  /**
   * Get the length of the data bound to this table (in number of items).
   * @returns number of entries in the datastore
   */
  getDataLength(): number {
    return this.scrollStrategy.dataLength;
  }

  /**
   * Scroll table so that entry with given index is the first visible one.
   * The index is limited to available ones (0... dataLength - 1) by the virtual scroller.
   * @param index - index of entry to scroll to (zero based)
   */
  scrollToIndex(index: number) {
    this.scrollStrategy.scrollToIndex(index, 'smooth');
  }

  /**
   * Scroll table so that entry with given index is in the center of the visible rows.
   * The index is limited to available ones (0... dataLength - 1) by the virtual scroller.
   * @param index - index of entry to scroll to (zero based)
   */
  scrollToIndexCentered(index: number) {
    const rowsBefore = Math.floor(Math.max(((this.visibleRowsChanged$.value + 1) / 2) - 1, 0));
    this.scrollStrategy.scrollToIndex(index - rowsBefore, 'smooth');
  }

  /**
   * Attach this virtual scroller to the dataSource of the table.
   * @param dataSource - DataSource to connect this virtual scroller to.
   */
  private connectDataSource(dataSource: TableVirtualScrollDataSource<T>) {
    if (!isTVSDataSource(dataSource)) {
      throw new Error('[tvsItemSize] requires TableVirtualScrollDataSource be set as [dataSource] of the table');
    }
    if (!isMatTable(this.table)) {
      throw new Error('[tvsItemSize] requires the table to be an angular material table');
    }

    // Terminate existing subscriptions to the data source
    this.dataSourceChanges$.next();

    // Emit new row range, when base data changes e.g. on sorting or filtering the data
    dataSource.attachVirtualScroller(this.rangeToDisplay$)
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.dataSourceChanges$),
        takeUntil(this.unsubscribe$),
        tap(sizes => {
          this.scrollStrategy.dataLength = sizes.totalFilteredElements;
          this.totalRowsChanged$.next(sizes.totalElements);
          this.filteredRowsChanged$.next(sizes.totalFilteredElements);
        }),
        switchMap(sizes => this.scrollStrategy.renderedRangeStream
          .pipe(
            // Reduce data array to range defined by virtual scroll viewport
            map(({ start, end }) => {
              const result = {
                startRowIndex: start,
                numberOfRows: end - start
              } as RequestRowsRange;

              if (typeof start !== 'number' || typeof end !== 'number') {
                result.startRowIndex = 0;
                result.numberOfRows = sizes.totalFilteredElements;
              }

              return result;
            })
          )
        )
      )
      .subscribe(range => {
        // Emit range of data requested by virtual scroll viewport
        this.ngZone.run(() => this.rangeToDisplay$.next(range));
      });
  }

  private setStickyEnabled() {
    if (!this.scrollStrategy.viewport) {
      this.stickyEnabled = {
        header: false,
        footer: false
      };
      return;
    }

    const isEnabled = (rowDefs: CanStick[]) => rowDefs
      .map(def => def.sticky)
      .reduce((prevState, state) => prevState && state, true);

    this.stickyEnabled = {
      header: isEnabled(this.table['_headerRowDefs'] as CanStick[]),
      footer: isEnabled(this.table['_footerRowDefs'] as CanStick[])
    };
  }

  private setStickyHeader(offset: number) {
    this.scrollStrategy.viewport.elementRef.nativeElement.querySelectorAll(stickyHeaderSelector)
      .forEach((el: Element) => {
        const parent = el.parentElement;
        let baseOffset = 0;
        if ((this.stickyPositions !== null) && (parent !== null) && this.stickyPositions.has(parent)) {
          baseOffset = this.stickyPositions.get(parent) || 0;
        }
        (el as HTMLElement).style.top = `${baseOffset - offset}px`;
      });
  }

  private setStickyFooter(offset: number) {
    this.scrollStrategy.viewport.elementRef.nativeElement.querySelectorAll(stickyFooterSelector)
      .forEach((el: Element) => {
        const parent = el.parentElement;
        let baseOffset = 0;
        if ((this.stickyPositions !== null) && (parent !== null) && this.stickyPositions.has(parent)) {
          baseOffset = this.stickyPositions.get(parent) || 0;
        }
        (el as HTMLElement).style.bottom = `${-baseOffset + offset}px`;
      });
  }

  private initStickyPositions() {
    this.stickyPositions = new Map<HTMLElement, number>();
    this.setStickyEnabled();

    if (this.stickyEnabled.header) {
      this.scrollStrategy.viewport.elementRef.nativeElement.querySelectorAll(stickyHeaderSelector)
        .forEach((el: Element) => {
          const parent = el.parentElement;
          if ((this.stickyPositions !== null) && (parent !== null) && !this.stickyPositions.has(parent)) {
            this.stickyPositions.set(parent, parent.offsetTop);
          }
        });
    }

    if (this.stickyEnabled.footer) {
      this.scrollStrategy.viewport.elementRef.nativeElement.querySelectorAll(stickyFooterSelector)
        .forEach((el: Element) => {
          const parent = el.parentElement;
          if ((this.stickyPositions !== null) && (parent !== null) && !this.stickyPositions.has(parent)) {
            this.stickyPositions.set(parent, -parent.offsetTop);
          }
        });
    }
  }

  /**
   * Detect stable context when sticky rows change.
   * @returns stream that emits 1 value when the context is stable
   */
  private getScheduleObservable() {
    // Use onStable when in the context of an ongoing change detection cycle so that we
    // do not accidentally trigger additional cycles.
    return this.ngZone.isStable
      ? from(Promise.resolve(undefined))
      : this.ngZone.onStable.pipe(take(1));
  }
}
