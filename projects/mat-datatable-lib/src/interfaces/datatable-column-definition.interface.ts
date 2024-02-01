export type ColumnAlignmentType = 'left' | 'center' | 'right';

export type FooterWithContent = {
  content: string | number | Date
  columnSpan: never
}
export type FooterWithColumnSpan = {
  content: never
  columnSpan: number
}
export type Footer = FooterWithContent | FooterWithColumnSpan | string

/**
 * Interface for the definition of a single table column
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
  sortable?: boolean;
  resizable?: boolean;
  footer?: Footer;
}
