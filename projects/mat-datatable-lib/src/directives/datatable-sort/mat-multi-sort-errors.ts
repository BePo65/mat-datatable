/* eslint-disable jsdoc/require-param */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable prefer-arrow/prefer-arrow-functions */

/**
 * Based on angular material sort-errors.ts
 */

/** Error - duplicate header column id */
export function getMultiSortDuplicateSortableIdError(id: string): Error {
  return Error(`Cannot have two MatSortables with the same id (${id}).`);
}

/** Error - header column not contained in a mat-multi-sort element */
export function getMultiSortHeaderNotContainedWithinMultiSortError(): Error {
  return Error('MatMultiSortHeader must be placed within a parent element with the MatMultiSort directive.');
}

/** Error - header column without id */
export function getMultiSortHeaderMissingIdError(): Error {
  return Error('MatMultiSortHeader must be provided with a unique id.');
}

/** Error - invalid sort direction */
export function getSortInvalidDirectionError(direction: string): Error {
  return Error(`${direction} is not a valid sort direction ('asc' or 'desc').`);
}
