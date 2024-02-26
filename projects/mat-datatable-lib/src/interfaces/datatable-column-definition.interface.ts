export type ColumnAlignmentType = 'left' | 'center' | 'right';

/**
 * Interface for the definition of a single table column
 * @template TRowData - type / interface definition for data of a single row
 */
export interface MatColumnDefinition<TRowData> {
  columnId: string;
  sortable?: boolean;
  resizable?: boolean;
  header: string;
  headerAlignment?: ColumnAlignmentType;
  cell: (element: TRowData) => string;
  cellAlignment?: ColumnAlignmentType;
  width?: string; // e.g. '8em'
  tooltip?: ((element: TRowData) => string);
  showAsMailtoLink?: boolean;
  showAsSingleLine?: boolean;
  footer?: string;
  footerAlignment?: ColumnAlignmentType;
  footerColumnSpan?: number;
}
