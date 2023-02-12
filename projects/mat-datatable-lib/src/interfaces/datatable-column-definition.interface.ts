export type ColumnAlignmentType = 'left' | 'center' | 'right';

/**
 * Interface for the definition of a single table column
 *
 * @interface MatColumnDefinition
 * @template TRowData - type / interface definition for data of a single row
 */
export interface MatColumnDefinition<TRowData> {
  columnId: string;
  header: string;
  cell: (element: TRowData) => string;
  width?: string; // e.g. '8em'
  headerAlignment?: ColumnAlignmentType;
  cellAlignment?: ColumnAlignmentType;
  tooltip?: ((element: TRowData) => string);
  showAsMailtoLink?: boolean;
  showAsSingleLine?: boolean;
  isSortable?: boolean;
}
