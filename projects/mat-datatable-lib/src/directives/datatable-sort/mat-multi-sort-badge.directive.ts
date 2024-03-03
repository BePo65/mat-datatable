/* eslint-disable @angular-eslint/no-host-metadata-property */
/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable @angular-eslint/no-inputs-metadata-property */
/* eslint-disable jsdoc/require-returns */

import { AriaDescriber } from '@angular/cdk/a11y';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  Directive,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Optional,
  Renderer2
} from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';

import { MatBadgePosition, SortDirectionAscDesc } from './mat-multi-sort.interface';

let nextId = 0;

const BADGE_CONTENT_CLASS = 'mat-multi-sort-badge-content';

/** Directive to display a text badge. */
@Directive({
    selector: '[matMultiSortBadge]',
    inputs: ['disabled: matMultiSortBadgeDisabled'],
    host: {
        'class': 'mat-multi-sort-badge',
        '[class.mat-multi-sort-badge-above]': '!isAscending()',
        '[class.mat-multi-sort-badge-below]': 'isAscending()',
        '[class.mat-multi-sort-badge-before]': '!isAfter()',
        '[class.mat-multi-sort-badge-after]': 'isAfter()',
        '[class.mat-multi-sort-badge-hidden]': 'hidden || !content',
        '[class.mat-multi-sort-badge-disabled]': 'disabled'
    },
    standalone: true
})
export class MatMultiSortBadgeDirective implements OnInit, OnDestroy {
  /**
   * Sorting order defining the vertical position the badge should reside.
   */
  @Input('matMultiSortBadgeArrowDirection') sortOrder: SortDirectionAscDesc = 'asc';

  /**
   * Horizontal position the badge should reside relative to the arrow.
   */
  @Input('matMultiSortBadgePosition') position: MatBadgePosition = 'after';

  /** The content for the badge */
  @Input('matMultiSortBadge')
  get content(): string | number | undefined | null {
    return this._content;
  }
  set content(newContent: string | number | undefined | null) {
    this._updateRenderedContent(newContent);
  }
  private _content: string | number | undefined | null;

  /** Message used to describe the decorated element via aria-describedby */
  @Input('matMultiSortBadgeDescription')
  get description(): string {
    return this._description;
  }
  set description(newDescription: string) {
    this._updateHostAriaDescription(newDescription);
  }
  private _description!: string;

  /** Whether the badge is hidden. */
  @Input('matMultiSortBadgeHidden')
  get hidden(): boolean {
    return this._hidden;
  }
  set hidden(val: BooleanInput) {
    this._hidden = coerceBooleanProperty(val);
  }
  private _hidden!: boolean;

  /** Unique id for the badge */
  _id: number = nextId++;

  /** Visible badge element. */
  private _badgeElement: HTMLElement | undefined;

  /** Whether the OnInit lifecycle hook has run yet */
  private _isInitialized = false;

  constructor(
    private _ngZone: NgZone,
    private _elementRef: ElementRef<HTMLElement>,
    private _ariaDescriber: AriaDescriber,
    private _renderer: Renderer2,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) private _animationMode?: string
  ) { }

  /** Whether the badge is for an ascending arrow or not */
  isAscending(): boolean {
    return this.sortOrder.indexOf('asc') !== -1;
  }

  /** Whether the badge is after the host or not */
  isAfter(): boolean {
    let positionAfter = true;
    if (typeof this.position === 'string') {
      positionAfter = this.position.indexOf('before') === -1;
    }
    return positionAfter;
  }

  /**
   * Gets the element into which the badge's content is being rendered. Undefined if the element
   * hasn't been created (e.g. if the badge doesn't have content).
   */
  getBadgeElement(): HTMLElement | undefined {
    return this._badgeElement;
  }

  ngOnInit() {
    // We may have server-side rendered badge that we need to clear.
    // We need to do this in ngOnInit because the full content of the component
    // on which the badge is attached won't necessarily be in the DOM until this point.
    this._clearExistingBadges();

    if (this.content && !this._badgeElement) {
      this._badgeElement = this._createBadgeElement();
      this._updateRenderedContent(this.content);
    }

    this._isInitialized = true;
  }

  ngOnDestroy() {
    // ViewEngine only: when creating a badge through the Renderer, Angular remembers its index.
    // We have to destroy it ourselves, otherwise it'll be retained in memory.
    if (this._renderer.destroyNode) {
      this._renderer.destroyNode(this._badgeElement);
    }

    this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this.description);
  }

  /** Creates the badge element */
  private _createBadgeElement(): HTMLElement {
    const badgeElement = this._renderer.createElement('span') as HTMLElement;
    const activeClass = 'mat-multi-sort-badge-active';

    badgeElement.setAttribute('id', `mat-multi-sort-badge-content-${this._id}`);

    // The badge is aria-hidden because we don't want it to appear in the page's navigation
    // flow. Instead, we use the badge to describe the decorated element with aria-describedby.
    badgeElement.setAttribute('aria-hidden', 'true');
    badgeElement.classList.add(BADGE_CONTENT_CLASS);

    if (this._animationMode === 'NoopAnimations') {
      badgeElement.classList.add('_mat-animation-noopable');
    }

    this._elementRef.nativeElement.appendChild(badgeElement);

    // animate in after insertion
    if (typeof requestAnimationFrame === 'function' && this._animationMode !== 'NoopAnimations') {
      this._ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => {
          badgeElement.classList.add(activeClass);
        });
      });
    } else {
      badgeElement.classList.add(activeClass);
    }

    return badgeElement;
  }

  // Update the text content of the badge element in the DOM, creating the element if necessary.
  private _updateRenderedContent(newContent: string | number | undefined | null): void {
    const newContentNormalized: string = `${newContent ?? ''}`.trim();

    // Don't create the badge element if the directive isn't initialized because we want to
    // append the badge element to the *end* of the host element's content for backwards
    // compatibility.
    if (this._isInitialized && newContentNormalized && !this._badgeElement) {
      this._badgeElement = this._createBadgeElement();
    }

    if (this._badgeElement) {
      this._badgeElement.textContent = newContentNormalized;
    }

    this._content = newContentNormalized;
  }

  // Updates the host element's aria description via AriaDescriber.
  private _updateHostAriaDescription(newDescription: string): void {
    this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this.description);
    if (newDescription) {
      this._ariaDescriber.describe(this._elementRef.nativeElement, newDescription);
    }
    this._description = newDescription;
  }

  // Clears any existing badges that might be left over from server-side rendering.
  private _clearExistingBadges() {
    // Only check direct children of this host element in order to avoid deleting
    // any badges that might exist in descendant elements.
    const badges = this._elementRef.nativeElement.querySelectorAll(
      `:scope > .${BADGE_CONTENT_CLASS}`
    );
    for (const badgeElement of Array.from(badges)) {
      if (badgeElement !== this._badgeElement) {
        badgeElement.remove();
      }
    }
  }
}
