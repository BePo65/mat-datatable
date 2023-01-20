/* eslint-disable @typescript-eslint/no-explicit-any */

export interface MatColumnDefinition {
  columnId: string;
  header: string | ((element: any) => string);
  cell: (element: any) => string;
}
