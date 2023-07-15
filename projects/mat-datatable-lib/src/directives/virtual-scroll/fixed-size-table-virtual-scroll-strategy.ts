/**
 * Based on https://github.com/diprokon/ng-table-virtual-scroll.
 * Adapted for use with mat-datatable project.
 */

import { ListRange } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export interface TableVirtualScrollStrategyConfigs {
  rowHeight: number;
  headerHeight: number;
  footerHeight: number;
  bufferMultiplier: number;
}

@Injectable()
export class FixedSizeTableVirtualScrollStrategy implements VirtualScrollStrategy {
  private rowHeight!: number;
  private headerHeight!: number;
  private footerHeight!: number;
  private bufferMultiplier!: number;
  private indexChange = new BehaviorSubject<number>(0);
  private visibleRows = new BehaviorSubject<number>(0);

  public renderedRangeStream = new BehaviorSubject<ListRange>({ start: 0, end: 0 });
  public scrolledIndexChange = this.indexChange.pipe(distinctUntilChanged());
  public visibleRowsChange = this.visibleRows.pipe(distinctUntilChanged());

  // must be public to enable access by table-item-size-directive
  public stickyChange = new Subject<number>();
  public viewport!: CdkVirtualScrollViewport;

  get dataLength(): number {
    return this._dataLength;
  }
  set dataLength(value: number) {
    this._dataLength = value;
    this.onDataLengthChanged();
  }
  private _dataLength = 0;

  public attach(viewport: CdkVirtualScrollViewport): void {
    this.viewport = viewport;
    this.viewport.renderedRangeStream.subscribe(this.renderedRangeStream);
    this.onDataLengthChanged();
  }

  public detach(): void {
    this.indexChange.complete();
    this.stickyChange.complete();
    this.renderedRangeStream.complete();
  }

  public onDataLengthChanged(): void {
    if (this.viewport) {
      const contentSize = this.dataLength * this.rowHeight + this.headerHeight + this.footerHeight;
      this.viewport.setTotalContentSize(contentSize);
      const viewportSize = this.viewport.getViewportSize();

      // prevent that we scrolled beyond the end, when new dataLength is smaller than old one
      if (this.viewport.measureScrollOffset() + viewportSize >= contentSize) {
        this.viewport.scrollToOffset(contentSize - viewportSize);
      }
    }
    this.updateContent();
  }

  public onContentRendered(): void {
    // As we do not manually set new rendered items range or new offset,
    // there is no action required.
  }

  public onRenderedOffsetChanged(): void {
    // As we do not manually set new rendered items range or new offset,
    // there is no action required.
  }

  public onContentScrolled(): void {
    this.updateContent();
  }

  public scrollToIndex(index: number, behavior?: ScrollBehavior): void {
    if (!this.viewport || !this.rowHeight) {
      return;
    }
    this.viewport.scrollToOffset((index - 1 ) * this.rowHeight + this.headerHeight, behavior);
  }

  public setConfig(configs: TableVirtualScrollStrategyConfigs) {
    const { rowHeight, headerHeight, footerHeight, bufferMultiplier } = configs;
    if (
      this.rowHeight === rowHeight
      && this.headerHeight === headerHeight
      && this.footerHeight === footerHeight
      && this.bufferMultiplier === bufferMultiplier
    ) {
      return;
    }
    this.rowHeight = +rowHeight;
    this.headerHeight = +headerHeight;
    this.footerHeight = +footerHeight;
    this.bufferMultiplier = +bufferMultiplier;
    this.onDataLengthChanged();
  }

  private updateContent() {
    if (!this.viewport || !this.rowHeight) {
      return;
    }

    const renderedOffset = this.viewport.getOffsetToRenderedContentStart() || 0;
    const viewportSizeForRows = this.viewport.getViewportSize() - this.headerHeight - this.footerHeight;
    const itemsDisplayed = Math.ceil(viewportSizeForRows / this.rowHeight);
    const bufferItems = Math.ceil(itemsDisplayed * this.bufferMultiplier);
    const start = Math.floor(renderedOffset / this.rowHeight);
    const end = start + itemsDisplayed + 2 * bufferItems;

    const bufferOffset = renderedOffset + bufferItems * this.rowHeight;
    const scrollOffset = this.viewport.measureScrollOffset();

    // How far the scroll offset is from the lower buffer, which is usually where items start being displayed
    const relativeScrollOffset = scrollOffset - bufferOffset;
    const rowsScrolled = relativeScrollOffset / this.rowHeight;

    // Emit index of first visible row
    this.indexChange.next(Math.floor(scrollOffset / this.rowHeight));

    // Emit number of visible rows
    this.visibleRows.next(Math.ceil(viewportSizeForRows / this.rowHeight));

    // Only bother updating the displayed information if we've scrolled more than a row
    const rowSensitivity = 1.0;
    if (Math.abs(rowsScrolled) < rowSensitivity) {
      this.viewport.setRenderedContentOffset(renderedOffset);
      this.viewport.setRenderedRange({ start, end });
      return;
    }

    // Special case for the start of the table.
    // At the top of the table, the first few rows are first rendered because they're visible,
    // and then still rendered because they move into the buffer.
    // So we only need to change what's rendered once the user scrolls far enough down.
    if (renderedOffset === 0 && rowsScrolled < 0) {
      this.viewport.setRenderedContentOffset(renderedOffset);
      this.viewport.setRenderedRange({ start, end });
      return;
    }

    // The user scrolled far enough down.
    const rowsToMove = Math.sign(rowsScrolled) * Math.floor(Math.abs(rowsScrolled));
    const adjustedRenderedOffset = Math.max(0, renderedOffset + rowsToMove * this.rowHeight);
    this.viewport.setRenderedContentOffset(adjustedRenderedOffset);

    const adjustedStart = Math.max(0, start + rowsToMove);
    const adjustedEnd = adjustedStart + itemsDisplayed + 2 * bufferItems;
    this.viewport.setRenderedRange({ start: adjustedStart, end: adjustedEnd });

    this.stickyChange.next(adjustedRenderedOffset);
  }
}
