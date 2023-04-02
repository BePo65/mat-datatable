/* eslint-disable jsdoc/check-tag-names */
/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable prefer-arrow/prefer-arrow-functions */

/**
 * Based on angular material sort-errors.ts
 */

/** @docs-private */
export function getMultiSortDuplicateSortableIdError(id: string): Error {
  return Error(`Cannot have two MatSortables with the same id (${id}).`);
}

/** @docs-private */
export function getMultiSortHeaderNotContainedWithinMultiSortError(): Error {
  return Error('MatMultiSortHeader must be placed within a parent element with the MatMultiSort directive.');
}

/** @docs-private */
export function getMultiSortHeaderMissingIdError(): Error {
  return Error('MatMultiSortHeader must be provided with a unique id.');
}

/** @docs-private */
export function getSortInvalidDirectionError(direction: string): Error {
  return Error(`${direction} is not a valid sort direction ('asc' or 'desc').`);
}
