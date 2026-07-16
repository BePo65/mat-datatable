import { Pipe, PipeTransform } from "@angular/core";

export type ColumnAlignmentType = 'left' | 'center' | 'right';

/**
 * Interface for the definition of a single table column
 * @template TRowData - type / interface definition for data of a single row
 */
export type ColumnDisplayType = 'string' | 'mailtoLink' | 'image';
// Using CellValueBase as base type to enforce discriminated field
export interface CellValueBase { type: ColumnDisplayType }
export interface CellValueString extends CellValueBase { type: 'string'; text: string }
export interface CellValueMailTo extends CellValueBase { type: 'mailtoLink'; url: string, text: string }
export interface CellValueImage extends CellValueBase { type: 'image'; url: string, altText: string, title?: string }

export type CellContentValue = CellValueString | CellValueMailTo | CellValueImage;
export type CellContentDefType<TRowData> = (element: TRowData) => CellContentValue;

// TODO can be deleted for Angular > 17, when using @let + @switch
@Pipe({
  name: 'cast',
  standalone: true,
  pure: true
})
export class CastPipe implements PipeTransform {
  // Uses a generic type to coerce the type checking system
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  transform<T>(value: any, typeToken?: T): T {
    return value as T;
  }
}

export interface MatColumnDefinition<TRowData> {
  columnId: string;
  sortable?: boolean;
  resizable?: boolean;
  header: string;
  headerAlignment?: ColumnAlignmentType;
  cell: CellContentDefType<TRowData>; // type of cell with values for content
  cellAlignment?: ColumnAlignmentType;
  width?: string; // e.g. '8em'
  tooltip?: ((element: TRowData) => string);
  showAsSingleLine?: boolean;
  footer?: string;
  footerAlignment?: ColumnAlignmentType;
  footerColumnSpan?: number;
}
