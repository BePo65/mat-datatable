/**
 * Interface for the definition of a single table column
 *
 * @interface MatColumnDefinition
 * @template TRowData - type / interface definition for data of a single row
 */
export interface MatColumnDefinition<TRowData> {
  columnId: string;
  header: string | ((element: TRowData) => string);
  cell: (element: TRowData) => string;
  width?: string; // e.g. '8em'
}
