<a name="top"></a>

# Mat-Datatable

A simple data table with virtual scrolling using Angular Material.

[![Version](https://img.shields.io/badge/version-17.2.13-blue.svg?cacheSeconds=86400)](https://github.com/BePo65/mat-datatable/blob/main/CHANGELOG.md)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?cacheSeconds=86400)](https://github.com/BePo65/mat-datatable/blob/main/LICENSE)
[![Angular version](https://img.shields.io/github/package-json/dependency-version/bepo65/mat-datatable/@angular/core?color=red&label=Angular&logo=angular&logoColor=red)](https://angular.dev/overview)
[![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/bepo65/mat-datatable/@angular/material?color=red&label=Angular-Material&logo=angular&logoColor=red)](https://v17.material.angular.dev/components/categories)

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#embed-mat-datatable-in-your-project">Embed Mat-Datatable In Your Project</a></li>
      </ul>
    </li>
    <li><a href="#used-assets">Used Assets</a></li>
    <li><a href="#mat-datatable-demo">Mat-Datatable Demo</a></li>
    <li>
      <a href="#api-reference">API Reference</a>
      <ul>
        <li><a href="#classes-api">Classes</a></li>
        <li><a href="#interfaces-api">Interfaces</a></li>
        <li><a href="#type-aliases-api">Type Aliases</a></li>
      </ul>
    </li>
    <li>
      <a href="#api-testing-harnesses">API Testing Harnesses</a>
      <ul>
        <li><a href="#classes-api-testing">Classes</a></li>
        <li><a href="#interfaces-api-testing">Interfaces</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#hints-on-possible-extensions">Hints On Possible Extensions</a></li>
    <li>
      <a href="#contributing">Contributing</a>
      <ul>
        <li><a href="#changelog">Changelog</a></li>
      </ul>
    </li>
    <li><a href="#license">License</a></li>
    <li><a href="#hints">Hints</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

This project extends 'angular material table' so that it can be used as a replacement for [ngx-datatable](https://github.com/swimlane/ngx-datatable) in one of my projects. Unluckily ngx-datatable seems to be dead as it is still on angular v12 and an update to a more recent angular version is not in sight.

Mat-Datatable implements a table with virtual scrolling, sorting and filtering. Only a minimal set of the functionality of ngx-datatable is implemented.

![Screenshot](assets/screenshot.jpg 'Screenshot of the demo page')

Try out the [live demo](https://bepo65.github.io/mat-datatable/).

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

To use this package in your project just follow these simple steps.

### Prerequisites

The package can be used in Angular apps with Angular Material installed.

### Installation

Install the package from npmjs:

```sh
npm install mat-datatable
```

### Embed Mat-Datatable In Your Project

Use the component as a standalone Angular component. Some properties of mat-datatable must be configured in the component class (for example in app.component.ts):

```ts
import { Component } from '@angular/core';
import { MatDatatableComponent, MatColumnDefinition } from 'mat-datatable';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatDatatableComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  protected dataStore = new MyTableDataStore<MyTableItem>();

  protected columnDefinitions: MatColumnDefinition<MyTableItem>[] = [
    {
      columnId: 'id',
      header: 'ID',
      cell: (row) => ({ type: 'string', text: row.id.toString() })
    },
    {
      columnId: 'name',
      sortable: true,
      resizable: true,
      header: 'Name',
      cell: (row) => ({ type: 'string', text: row.name })
    }
  ];

  protected displayedColumns: string[] = ['id', 'name'];
}
```

The `cell` callback returns a typed content descriptor, so you can render plain strings, mailto links or images without changing the table API:

```ts
cell: (row) => ({ type: 'mailtoLink', text: row.email, url: `mailto:${row.email}` });
```

Add Mat-Datatable to your HTML file (for example app.component.html):

```html
<div class="content-table">
  <mat-datatable
    [columnDefinitions]="columnDefinitions"
    [displayedColumns]="displayedColumns"
    [dataStoreProvider]="dataStore"
    [trackBy]="trackBy"
    [withFooter]="true"
  >
    Loading...
  </mat-datatable>
</div>
```

The height of the element containing the mat-datatable must be set explicitly (for example app.component.scss):

```css
.content-table {
  height: 400px;
  margin: 0 1em;
  overflow: auto;
}
```

The `cell` callback returns a typed content descriptor, so you can render plain strings, mailto links or images without changing the table API:

```ts
cell: (row) => ({ type: 'mailtoLink', text: row.email, url: `mailto:${row.email}` });
```

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USED ASSETS -->

## Used Assets

The component is based on Angular Material and uses [Google Fonts](https://fonts.google.com/specimen/Roboto) and the [Google Material Icons](https://google.github.io/material-design-icons/#icon-font-for-the-web) font.
Both fonts are part of the project and not fetched via https.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- MAT-DATATABLE DEMO -->

## Mat-Datatable Demo

Demo project to show all features of Mat-Datatable.

```
git clone git@github.com:BePo65/mat-datatable.git
cd mat-datatable
npm start
```

Navigate to http://localhost:4200

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- API REFERENCE -->

## API Reference

```ts
import {
  MatDatatableComponent,
  MatColumnDefinition,
  CellValueString,
  CellValueImage,
  CellValueMailTo,
  MatSortDefinition,
  DataStoreProvider,
  FieldFilterDefinition,
  RowSelectionType
} from 'mat-datatable';
```

<a id="classes-api"></a>

### Classes

#### MatDatatableComponent

Standalone Angular component for rendering a virtualized Material table. The component is generic so the row type can be provided with the template parameter.

##### Inputs

| Name                                          | Description                                                                                                     |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `columnDefinitions: MatColumnDefinition<T>[]` | Column definitions for the table. The order of the definitions does not need to match the visible column order. |
| `displayedColumns: string[]`                  | List of visible column IDs in the order they should be rendered.                                                |
| `rowSelectionMode: RowSelectionType`          | Controls row selection behaviour. Supported values are `none`, `single` and `multi`.                            |
| `dataStoreProvider: DataStoreProvider<T>`     | Data source implementation for the table.                                                                       |
| `trackBy: TrackByFunction<T>`                 | Optional row identity function.                                                                                 |
| `withFooter: boolean`                         | Enables the footer row.                                                                                         |

##### Outputs

| Name                                            | Description                                      |
| ----------------------------------------------- | ------------------------------------------------ |
| `rowClick: EventEmitter<T>`                     | Emitted when a row is clicked.                   |
| `rowSelectionChange: EventEmitter<T[]>`         | Emitted when the current selection changes.      |
| `sortChange: EventEmitter<MatSortDefinition[]>` | Emitted when the active sort definition changes. |

##### Properties

| Name                                            | Description                                      |
| ----------------------------------------------- | ------------------------------------------------ |
| `activatedRow: T \| undefined`                  | Marks a row as active.                           |
| `selectedRows: T[]`                             | Contains the current selection.                  |
| `sortDefinitions: MatSortDefinition[]`          | Gets or sets the current sort definition.        |
| `filterDefinitions: FieldFilterDefinition<T>[]` | Gets or sets the active filter definition.       |
| `firstVisibleIndexChanged: Observable<number>`  | Emits the index of the first visible row.        |
| `totalRowsChanged: Observable<number>`          | Emits the total number of rows in the datastore. |
| `filteredRowsChanged: Observable<number>`       | Emits the number of rows after filtering.        |

##### Methods

| Name                  | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `scrollToRow(row: T)` | Scrolls the viewport so the given row becomes visible. |
| `reloadTable()`       | Reloads the table from its datastore.                  |

<a id="interfaces-api"></a>

### Interfaces

#### DataStoreProvider

Interface for a component that fetches data from the datastore while respecting sorting and filtering.

##### Methods

| Name                                      | Description                         |
| ----------------------------------------- | ----------------------------------- |
| `getPagedData(rowsRange, sorts, filters)` | Fetches the requested page of data. |

| **Parameters**                      |                                |
| ----------------------------------- | ------------------------------ |
| rowsRange: RequestRowsRange         | The range of rows to fetch.    |
| sorts: FieldSortDefinition<T>[]     | The sort definitions to use.   |
| filters: FieldFilterDefinition<T>[] | The filter definitions to use. |

| **Return value**    |                                           |
| ------------------- | ----------------------------------------- |
| Observable<Page<T>> | Emitting fetched data from the datastore. |

#### MatColumnDefinition

Interface for the definition of a single table column.

##### Properties

| Name                                            | Description                                            |
| ----------------------------------------------- | ------------------------------------------------------ |
| `columnId: string`                              | The unique ID of the column.                           |
| `sortable?: boolean`                            | Enables sorting for the column.                        |
| `resizable?: boolean`                           | Enables resizing of the column.                        |
| `header: string`                                | The text shown in the header row.                      |
| `headerAlignment?: ColumnAlignmentType`         | Header alignment.                                      |
| `cell: (element: TRowData) => CellContentValue` | Returns the rendered cell content for the current row. |
| `cellAlignment?: ColumnAlignmentType`           | Alignment of the cell content.                         |
| `width?: string`                                | Optional column width, for example `8em`.              |
| `tooltip?: (element: TRowData) => string`       | Optional tooltip callback.                             |
| `showAsSingleLine?: boolean`                    | Truncates the content to a single line.                |
| `footer?: string`                               | Optional footer text.                                  |
| `footerAlignment?: ColumnAlignmentType`         | Footer alignment.                                      |
| `footerColumnSpan?: number`                     | Optional number of columns the footer should span.     |

#### MatSortDefinition

Interface for the definition of sorting for one column.

##### Properties

| Name                       | Description                           |
| -------------------------- | ------------------------------------- |
| `columnId: string`         | The `columnId` of the column to sort. |
| `direction: SortDirection` | The sort direction.                   |

#### RequestRowsRange

Interface defining the properties of a request for a range of rows.

##### Properties

| Name                    | Description                           |
| ----------------------- | ------------------------------------- |
| `startRowIndex: number` | The index of the first row to return. |
| `numberOfRows: number`  | The number of rows to return.         |

#### Page

Interface defining the properties of a page of rows returned from the datastore.

##### Properties

| Name                            | Description                                     |
| ------------------------------- | ----------------------------------------------- |
| `content: T[]`                  | The array of requested rows.                    |
| `startRowIndex: number`         | The index of the first row returned.            |
| `returnedElements: number`      | The number of rows in `content`.                |
| `totalElements: number`         | The number of rows in the unfiltered datastore. |
| `totalFilteredElements: number` | The number of rows after filtering.             |

<a id="type-aliases-api"></a>

### Type Aliases

#### ColumnAlignmentType

```ts
type ColumnAlignmentType = 'left' | 'center' | 'right';
```

#### ColumnDisplayType

How the column should be rendered (as text, mail-to link or as image).

```ts
type ColumnDisplayType = 'string' | 'mailtoLink' | 'image';
```

#### CellValueString

Type for a literal object containing the values to be used to render a cell as plain text.

```ts
interface CellValueString extends CellValueBase {
  type: 'string';
  text: string;
}
```

##### Properties

| Name             | Description                                    |
| ---------------- | ---------------------------------------------- |
| `type: 'string'` | Indicates that the cell content is plain text. |
| `text: string`   | The text displayed in the cell.                |

#### CellValueMailTo

Type for a literal object containing the values to be used to render a cell as a mail-to link.

```ts
interface CellValueMailTo extends CellValueBase {
  type: 'mailtoLink';
  url: string;
  text: string;
}
```

##### Properties

| Name                 | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `type: 'mailtoLink'` | Indicates that the cell content is rendered as a link. |
| `url: string`        | The mail address or URL used for the link target.      |
| `text: string`       | The visible text shown for the link.                   |

#### CellValueImage

Type for a literal object containing the values to be used to render a cell as an image.

```ts
interface CellValueImage extends CellValueBase {
  type: 'image';
  url: string;
  altText: string;
  title?: string;
}
```

##### Properties

| Name              | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `type: 'image'`   | Indicates that the cell content is rendered as an image. |
| `url: string`     | The URL of the image to display.                         |
| `altText: string` | The alternative text for the image.                      |
| `title?: string`  | An optional title shown for the image.                   |

#### CellContentValue

Type of the literal object returned by the function of type CellContentDefType.

```ts
type CellContentValue = CellValueString | CellValueMailTo | CellValueImage;
```

#### CellContentDefType

Type of the function of the field `cell` of the MatColumnDefinition.

```ts
type CellContentDefType<TRowData> = (element: TRowData) => CellContentValue;
```

#### FieldFilterDefinition

The definition of a parameter for filtering the displayed data using the column identified by the given 'fieldName'.

```ts
type FieldFilterDefinition<T> = StrictUnion<
  FieldFilterDefinitionSimple<T> | FieldFilterDefinitionRange<T>
>;
```

#### FieldFilterDefinitionRange

```ts
type FieldFilterDefinitionRange<T> = {
  fieldName: keyof T;
  valueFrom: string | number | Date;
  valueTo: string | number | Date;
};
```

#### FieldFilterDefinitionSimple

```ts
type FieldFilterDefinitionSimple<T> = {
  fieldName: keyof T;
  value: string | number | Date;
};
```

#### FieldSortDefinition

```ts
type FieldSortDefinition<T> = {
  fieldName: keyof T;
  sortDirection: SortDirectionAscDesc;
};
```

#### RowSelectionType

```ts
type RowSelectionType = 'none' | 'single' | 'multi';
```

#### SortDirectionAscDesc

```ts
type SortDirectionAscDesc = 'asc' | 'desc';
```

<!-- API TESTING REFERENCE -->

## API Testing Harnesses

`import { MatDatatableHarness } from '@bepo65/mat-datatable/testing';`

<a id="classes-api-testing"></a>

### Classes

<a id="_matrowcellharnessbase"></a>

#### **\_MatRowCellHarnessBase** extends [ContentContainerComponentHarness\<string>](https://material.angular.io/cdk/test-harnesses/api#ContentContainerComponentHarness)

##### **Methods**

|                                                     |                                                                                                         |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `static async booleanMatches`                       | Checks if the specified nullable boolean value matches the given value.                                 |
| **Parameters**                                      |
| value: boolean \| null \| Promise\<boolean \| null> | The nullable boolean value to check, or a Promise resolving to the nullable boolean value.              |
| pattern: boolean \| null                            | The boolean the value is expected to match. If 'pattern' is 'null', the value is expected to be 'null'. |
| **Returns**                                         |
| Promise\<boolean>                                   | Whether the value matches the pattern.                                                                  |
|                                                     |                                                                                                         |

|                       |                                                       |
| --------------------- | ----------------------------------------------------- |
| `async getColumnName` | Gets the name of the column that the cell belongs to. |
| **Returns**           |
| Promise\<string>      | The name of the column that the cell belongs to.      |
|                       |                                                       |

|                        |                                               |
| ---------------------- | --------------------------------------------- |
| `async getColumnWidth` | Gets the cell's width in 'px' (with padding). |
| **Returns**            |
| Promise\<number>       | The cell's width.                             |
|                        |                                               |

|                  |                       |
| ---------------- | --------------------- |
| `async getText`  | Gets the cell's text. |
| **Returns**      |
| Promise\<string> | The cell's text.      |
|                  |                       |

<a id="_matrowharnessbase"></a>

#### **\_MatRowHarnessBase** extends [ComponentHarness](https://material.angular.io/cdk/test-harnesses/api#ComponentHarness)

Abstract class used as base for harnesses that interact with a mat-datatable row.

##### **Methods**

|                                 |                                                                                                                |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `async getCells`                | Gets a list of 'MatRowCellHarness', 'MatHeaderCellHarness' or 'MatFooterCellHarness' for all cells in the row. |
| filter: CellHarnessFilters = {} | A set of criteria that can be used to filter a list of cell harness instances.                                 |
| **Returns**                     |
| Promise\<Cell[]>                | A filtered list of MatRowCellHarness for the cells in the row.                                                 |
|                                 |                                                                                                                |

|                                    |                                                    |
| ---------------------------------- | -------------------------------------------------- |
| `async getCellTextByColumnName`    | Gets the text inside the row organized by columns. |
| **Returns**                        |
| Promise\<MatRowHarnessColumnsText> | The text inside the row organized by columns.      |
|                                    |                                                    |

|                                 |                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `async getCellTextByIndex`      | Gets the text of the cells in the row.                                         |
| **Parameters**                  |
| filter: CellHarnessFilters = {} | A set of criteria that can be used to filter a list of cell harness instances. |
| **Returns**                     |
| Promise\<string[]>              | The text of the cells in the row.                                              |
|                                 |                                                                                |

|                                                                              |                                                                                                                                                                 |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `static async rowCellsContentMatch`                                          | Checks if the values of the table row columns given in the 'value' parameter, match the given column values. Only columns defined in the pattern are inspected. |
| **Parameters**                                                               |
| value: MatRowHarnessColumnsText \| Promise<MatRowHarnessColumnsText> \| null | The nullable object defining all columns of a row and their values used for the checks. Alternatively a Promise resolving to the nullable object.               |
| pattern: Record<string, string \| RegExp> \| null                            | Object defining the columns and the values or RegExp expected to match. If 'pattern' is 'null', the value is expected to be 'null'.                             |
| **Returns**                                                                  |
| Promise\<boolean>                                                            | Whether the value matches the pattern.                                                                                                                          |
|                                                                              |                                                                                                                                                                 |

<a id="matdatatableharness"></a>

#### **MatDatatableHarness** extends [ContentContainerComponentHarness\<string>](https://material.angular.io/cdk/test-harnesses/api#ContentContainerComponentHarness)

Harness for interacting with a mat-datatable in tests.

##### **Properties**

| Name                                    | Description                                                   |
| --------------------------------------- | ------------------------------------------------------------- |
| `static hostSelector: '.mat-datatable'` | The selector for the host element of a 'MatDatatableHarness'. |
|                                         |                                                               |

##### **Methods**

|                            |                                            |
| -------------------------- | ------------------------------------------ |
| `async getAllChildLoaders` | Gets an array of HarnessLoader instances.  |
| **Parameters**             |
| selector: string           | A string used for selecting the instances. |
| **Returns**                |
| Promise\<HarnessLoader[]>  | An array of HarnessLoader instances.       |
|                            |                                            |

|                         |                                                                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `async getAllHarnesses` | Gets an array of harness instances.                                                                                                            |
| **Parameters**          |
| query: HarnessQuery<T>  | A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Returns**             |
| Promise\<T[]>           | An array of harness instances.                                                                                                                 |
|                         |                                                                                                                                                |

|                                          |                                                             |
| ---------------------------------------- | ----------------------------------------------------------- |
| `async getCellTextByColumnName`          | Gets the text inside the entire table organized by columns. |
| **Returns**                              |
| Promise\<MatDatatableHarnessColumnsText> | The text inside the entire table organized by columns.      |
|                                          |                                                             |

|                            |                                                                 |
| -------------------------- | --------------------------------------------------------------- |
| `async getCellTextByIndex` | Gets the text inside the entire table organized by rows.        |
| **Returns**                |
| Promise\<string[][]>       | Array for all rows containing the content of a row as an array. |
|                            |                                                                 |

|                         |                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| `async getChildLoader`  | Searches for an element matching the given selector below the root element of this HarnessLoader. |
| **Parameters**          |
| selector: string        | A string used for selecting the HarnessLoader.                                                    |
| **Returns**             |
| Promise\<HarnessLoader> | A new HarnessLoader rooted at the first matching element.                                         |
|                         |                                                                                                   |

|                                 |                                                    |
| ------------------------------- | -------------------------------------------------- |
| `async getFooterRows`           | Gets a list of the footer rows in a mat-datatable. |
| **Returns**                     |
| Promise\<MatHeaderRowHarness[]> | A list of the footer rows.                         |
|                                 |                                                    |

|                        |                                                                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `async getHarness`     | Searches for an instance of the given ComponentHarness class or HarnessPredicate below the root element of this HarnessLoader.                 |
| **Parameters**         |
| query: HarnessQuery<T> | A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Returns**            |
| Promise\<T>            | An instance of the harness corresponding to the first matching element.                                                                        |
|                        |                                                                                                                                                |

|                          |                                                                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `async getHarnessOrNull` | Gets an instance of the given ComponentHarness class or HarnessPredicate below the root element of this HarnessLoader.                         |
| **Parameters**           |
| query HarnessQuery<T>    | A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Returns**              |
| Promise\<T \| null>      | An instance of the harness corresponding to the first matching element.                                                                        |
|                          |                                                                                                                                                |

|                                 |                                                    |
| ------------------------------- | -------------------------------------------------- |
| `async getHeaderRows`           | Gets a list of the header rows in a mat-datatable. |
| **Returns**                     |
| Promise\<MatHeaderRowHarness[]> | A list of the header rows.                         |
|                                 |                                                    |

|                                |                                                                               |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `async getRows`                | Gets a list of the regular data rows in a mat-datatable.                      |
| **Parameters**                 |
| filter: RowHarnessFilters = {} | A set of criteria that can be used to filter a list of row harness instances. |
| **Returns**                    |
| Promise\<MatRowHarness[]>      | A filtered list of the regular data rows.                                     |
|                                |                                                                               |

|                       |                                                                                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `async hasHarness`    | Check, if the harness contains the instances defined by 'query'.                                                                               |
| **Parameters**        |
| query HarnessQuery<T> | A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Returns**           |
| Promise\<boolean>     | 'True', if the instances is part of the harness.                                                                                               |
|                       |                                                                                                                                                |

|                       |                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------ |
| `async host`          | Gets a Promise for the 'TestElement' representing the host element of the component. |
| **Returns**           |
| Promise\<TestElement> | The 'TestElement' representing the host element of the component.                    |
|                       |                                                                                      |

|                                   |                                                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| `static with`                     | Gets a 'HarnessPredicate' that can be used to search for a mat-datatable with specific attributes. |
| **Parameters**                    |
| options: TableHarnessFilters = {} | Options for narrowing the search.                                                                  |
| **Returns**                       |
| HarnessPredicate<T>               | A 'HarnessPredicate' configured with the given options.                                            |
|                                   |                                                                                                    |

<a id="matfootercellharness"></a>

#### **MatFooterCellHarness** extends [_MatRowCellHarnessBase](#MatRowCellHarnessBase)

Harness for interacting with an MDC-based Angular Material table footer cell.

##### **Properties**

|                                               |                                                                         |
| --------------------------------------------- | ----------------------------------------------------------------------- |
| `static hostSelector: '.mat-mdc-footer-cell'` | The selector for the host element of a 'MatFooterCellHarness' instance. |

<a id="matfooterrowharness"></a>

#### **MatFooterRowHarness** extends [_MatRowHarnessBase](#MatRowHarnessBase)

Harness for interacting with a mat-datatable footer row.

##### Properties

|                                              |                                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| `static hostSelector: '.mat-mdc-footer-row'` | Used to identify the host element of a 'MatFooterRowHarness' instance. |
|                                              |                                                                        |

<a id="matheadercellharness"></a>

#### **MatHeaderCellHarness** extends [_MatRowCellHarnessBase](#MatRowCellHarnessBase)

Harness for interacting with an MDC-based Angular Material table header cell.

##### **Properties**

|                                               |                                                                         |
| --------------------------------------------- | ----------------------------------------------------------------------- |
| `static hostSelector: '.mat-mdc-header-cell'` | The selector for the host element of a 'MatHeaderCellHarness' instance. |

##### **Methods**

|                  |                              |
| ---------------- | ---------------------------- |
| `async getText`  | Gets the header cell's text. |
| **Return**       |
| Promise\<string> | The header cell's text.      |
|                  |                              |

|                     |                                               |
| ------------------- | --------------------------------------------- |
| `async isResizable` | Check, if the cell is defined as 'resizable'. |
| **Returns**         |
| Promise\<boolean>   | The cell is resizable.                        |
|                     |                                               |

|                  |                                                  |
| ---------------- | ------------------------------------------------ |
| `async resize`   | Resize the cell to a new width (if 'resizable'). |
| **Parameters**   |
| newWidth: number | The new width of the cell in 'px'.               |
| **Returns**      |
| Promise\<void>   | The cell got resized.                            |
|                  |                                                  |

<a id="matheaderrowharness"></a>

#### **MatHeaderRowHarness** extends [_MatRowHarnessBase](#MatRowHarnessBase)

Harness for interacting with a mat-datatable header row.

##### Properties

|                                              |                                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| `static hostSelector: '.mat-mdc-header-row'` | Used to identify the host element of a 'MatHeaderRowHarness' instance. |
|                                              |                                                                        |

##### Methods

|                                       |                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| `async getCells`                      | Gets a list of 'MatRowCellHarness' for all cells in the row.                   |
| **Parameters**                        |
| filter: HeaderCellHarnessFilters = {} | A set of criteria that can be used to filter a list of cell harness instances. |
| **Returns**                           |
| Promise\<MatHeaderCellHarness[]>      | A filtered list of MatRowCellHarness for the cells in the header row.          |
|                                       |                                                                                |

<a id="matmultisortharness"></a>

#### **MatMultiSortHarness** extends [ComponentHarness](https://material.angular.io/cdk/test-harnesses/api#ComponentHarness)

Harness for interacting with a mat-multi-sort element in tests.

##### **Properties**

|                                          |                                           |
| ---------------------------------------- | ----------------------------------------- |
| `static hostSelector: '.mat-multi-sort'` | Used to identify the elements in the DOM. |
|                                          |                                           |

##### **Methods**

|                                       |                                                            |
| ------------------------------------- | ---------------------------------------------------------- |
| `async getActiveHeaders`              | Gets all headers used for sorting in the 'mat-multi-sort'. |
| **Returns**                           |
| Promise\<MatMultiSortHeaderHarness[]> | All headers used for sorting.                              |
|                                       |                                                            |

|                                  |                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------- |
| `async getActiveSortData`        | Gets the sorting data for all headers used for sorting in the 'mat-multi-sort'. |
| **Returns**                      |
| Promise\<DomSortingDefinition[]> | Sorting data of all headers used for sorting.                                   |
|                                  |                                                                                 |

|                                            |                                                                                          |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `async getSortHeaders`                     | Gets the headers used for sorting in the 'mat-multi-sort' reduced by the given 'filter'. |
| **Parameters**                             |
| filter: MultiSortHeaderHarnessFilters = {} |                                                                                          |
| **Returns**                                |
| Promise\<MatMultiSortHeaderHarness[]>      | The filtered sort headers.                                                               |
|                                            |                                                                                          |

|                       |                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------ |
| `async host`          | Gets a Promise for the 'TestElement' representing the host element of the component. |
| **Returns**           |
| Promise\<TestElement> | The 'TestElement' representing the host element of the component.                    |
|                       |                                                                                      |

|                                        |                                                                                                       |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `static with`                          | Gets a 'HarnessPredicate' that can be used to search for a 'mat-multi-sort' with specific attributes. |
| **Parameters**                         |
| options: MultiSortHarnessFilters = {}  | Options for narrowing the search.                                                                     |
| **Returns**                            |
| HarnessPredicate\<MatMultiSortHarness> | A 'HarnessPredicate' configured with the given options.                                               |
|                                        |                                                                                                       |

<a id="matmultisortheaderharness"></a>

#### **MatMultiSortHeaderHarness** extends [ComponentHarness](https://material.angular.io/cdk/test-harnesses/api#ComponentHarness)

Harness for interacting with a `mat-multi-sort header` element in tests.

##### **Properties**

|                       |                                                                             |
| --------------------- | --------------------------------------------------------------------------- |
| `static hostSelector` | Used to identify the elements in the DOM (value: '.mat-multi-sort-header'). |
|                       |                                                                             |

##### **Methods**

|                |                                                                                         |
| -------------- | --------------------------------------------------------------------------------------- |
| `async click`  | Clicks the header to change its sorting direction. Only works if the header is enabled. |
| **Returns**    |
| Promise\<void> | Promise that resolves when the click action completes.                                  |
|                |                                                                                         |

|                                                   |                                                     |
| ------------------------------------------------- | --------------------------------------------------- |
| `async getAllSortData`                            | Gets an object with the sorting data of the header. |
| **Returns**                                       |
| Promise\<MatMultiSortHeaderHarnessSortDefinition> | The sorting data of the header.                     |
|                                                   |                                                     |

|                  |                                 |
| ---------------- | ------------------------------- |
| `async getId`    | Gets the id of the sort header. |
| **Returns**      |
| Promise\<string> | The id of the sort header.      |
|                  |                                 |

|                  |                                    |
| ---------------- | ---------------------------------- |
| `async getLabel` | Gets the label of the sort header. |
| **Returns**      |
| Promise\<string> | The label of the sort header.      |
|                  |                                    |

|                          |                                           |
| ------------------------ | ----------------------------------------- |
| `async getSortDirection` | Gets the sorting direction of the header. |
| **Returns**              |
| Promise\<SortDirection>  | The sorting direction of the header.      |
|                          |                                           |

|                         |                                            |
| ----------------------- | ------------------------------------------ |
| `async getSortPosition` | Gets the sorting position of the header.   |
| **Returns**             |
| Promise\<SortDirection> | The sorting position of the header (1..n). |
|                         |                                            |

|                      |                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------ |
| `async host`         | Gets a Promise for the 'TestElement' representing the host element of the component. |
| **Returns**          |
| Promise<TestElement> | The 'Promise' for the 'TestElement'.                                                 |
|                      |                                                                                      |

|                  |                                                                   |
| ---------------- | ----------------------------------------------------------------- |
| `async isActive` | Gets whether the sort header is currently being used for sorting. |
| **Returns**      |
| Promise<boolean> | `True`, if the sort header is currently being used for sorting.   |
|                  |                                                                   |

|                    |                                         |
| ------------------ | --------------------------------------- |
| `async isDisabled` | Whether the sort header is disabled.    |
| **Returns**        |
| Promise<boolean>   | `True`, if the sort header is disabled. |
|                    |                                         |

|                                              |                                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `static with`                                | Gets a 'HarnessPredicate' that can be used to search for a sort header with specific attributes. |
| **Parameters**                               |
| options: MultiSortHeaderHarnessFilters = {}  | Options for narrowing the search.                                                                |
| **Returns**                                  |
| HarnessPredicate\<MatMultiSortHeaderHarness> | A 'HarnessPredicate' configured with the given options.                                          |
|                                              |                                                                                                  |

<a id="matrowcellharness"></a>

#### **MatRowCellHarness** extends [_MatRowCellHarnessBase](#MatRowCellHarnessBase)

Harness for interacting with a mat-datatable cell in a row.

##### **Properties**

|                                        |                                                                      |
| -------------------------------------- | -------------------------------------------------------------------- |
| `static hostSelector: '.mat-mdc-cell'` | Used to identify the host element of a 'MatRowCellHarness' instance. |

##### **Methods**

|                      |                                                      |
| -------------------- | ---------------------------------------------------- |
| `async isSingleLine` | Check, if the cell is defined as 'showAsSingleLine'. |
| **Returns**          |
| Promise\<boolean>    | The cell is shown as single line.                    |
|                      |                                                      |

<a id="matrowharness"></a>

#### **MatRowHarness** extends [_MatRowHarnessBase](#MatRowHarnessBase)

Harness for interacting with a mat-datatable row.

##### **Properties**

|                                       |                                           |
| ------------------------------------- | ----------------------------------------- |
| `static hostSelector: '.mat-mdc-row'` | Used to identify the elements in the DOM. |

##### **Methods**

|                |                                                        |
| -------------- | ------------------------------------------------------ |
| `async click`  | Clicks the row (e.g. to select a row).                 |
| **Returns**    |
| Promise\<void> | Promise that resolves when the click action completes. |
|                |                                                        |

|                                 |                                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `static with`                   | Gets a `HarnessPredicate` that can be used to search for a mat-datatable row with specific attributes. |
| **Parameters**                  |
| options: RowHarnessFilters = {} | Options for narrowing the search.                                                                      |
| **Returns**                     |
| HarnessPredicate<T>             | A 'HarnessPredicate' configured with the given options.                                                |

<p align="right">(<a href="#top">back to top</a>)</p>

<a id="interfaces-api-testing"></a>

### **Interfaces**

#### **CellHarnessFilters**

A set of criteria that can be used to filter a list of cell harness instances.

##### **Properties**

|                              |                                                                |
| ---------------------------- | -------------------------------------------------------------- |
| columnName: string \| RegExp | Only find instances whose column name matches the given value. |
| text: string \| RegExp       | Only find instances whose text matches the given value.        |
|                              |                                                                |

#### **DomSortingDefinition**

##### **Properties**

|                                |                                     |
| ------------------------------ | ----------------------------------- |
| `id: string`                   | ID of the header element.           |
| `label: string`                | Label of the header.                |
| `sortDirection: SortDirection` | Sort direction of the header.       |
| `sortPosition: number`         | Sort position of the header (1..n). |
|                                |                                     |

#### **MatDatatableHarnessColumnsText**

Text extracted from a table organized by columns.

This interface describes an object, whose keys are the names of the columns and whose values are an object with the following properties:

##### **Properties of a value**

|                                 |                                                |
| ------------------------------- | ---------------------------------------------- |
| text: string[]                  | Array with content of the rows of this column. |
| headerText: string              | Content of the header row of this column.      |
| footerText: string \| undefined | Content of the footer row of this column.      |
|                                 |                                                |

#### **MatDatatableHarnessFilters**

A set of criteria that can be used to filter a list of table harness instances.

##### **Properties**

|     |     |
| --- | --- |
| -   |     |
|     |     |

#### **MatRowHarnessColumnsText**

Text extracted from a table row organized by columns.

This interface describes an object, whose keys are the names of the columns and whose values are the corresponding cell content.

#### **MultiSortHarnessFilters**

##### **Properties**

|     |     |
| --- | --- |
| -   |     |
|     |     |

#### **MultiSortHeaderHarnessFilters**

##### **Properties**

|                                |                                     |
| ------------------------------ | ----------------------------------- |
| `label: string \| RegExp`      | Label of the header.                |
| `id: string \| RegExp`         | ID of the header element.           |
| `sortDirection: SortDirection` | Sort direction of the header.       |
| `sortPosition: number`         | Sort position of the header (1..n). |
|                                |                                     |

#### **RowHarnessFilters**

A set of criteria that can be used to filter a list of row harness instances.

##### **Properties**

|     |     |
| --- | --- |
| -   |     |
|     |     |

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

See the [open issues](https://github.com/BePo65/mat-datatable/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- HINTS ON POSSIBLE EXTENSIONS -->

## Hints On Possible Extensions

- to make footer turn on / off dynamically it is not sufficient to wrap the footer cell and row definitions in ng-container. Details see [stackoverflow](https://stackoverflow.com/questions/63644938/angular-material-mat-table-dynamic-footer-header-rowdef/63648914#63648914). The demo uses [ngx-rerender](https://www.npmjs.com/package/ngx-rerender).

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Changelog

The project uses 'standard-version' to create the changelog. To enable this system, commit messages are linted before commits are executed by git.

To enable this system you have to run the following scripts in your local repository home directory:

```
npx husky install
npx husky add .husky/commit-msg "npx --no -- commitlint --edit $1"
```

**The structure of commit messages is**:

```
  <header>
  <BLANK LINE>
  <body>
  <BLANK LINE>
  <footer>
```

**header**

```
  <type>(<scope>): <short summary>
```

type and scope

- build: Changes that affect the build system or external dependencies (example scope: npm)
- docs: Documentation only changes
- feat: A new feature
- fix: A bug fix
- perf: A code change that improves performance
- refactor: A code change that neither fixes a bug nor adds a feature
- test: Adding missing tests or correcting existing tests (example scopes: demo, lib, e2e)

**footer**

```
  BREAKING CHANGE: ... (requires MAJOR in Semantic Versioning)
```

For details of the commit messages format see [Contributing to Angular](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit).

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- LICENSE -->

## License

Copyright © 2025 [Bernhard Pottler](https://github.com/BePo65).

Distributed under the MIT License. See `LICENSE` for more information.

This project uses the fonts '[Roboto](https://fonts.google.com/specimen/Roboto/about)' and '[Material Icons](https://github.com/google/material-design-icons)' from the [Google Fonts Library](https://fonts.google.com/) that are licensed under the [Apache License Version 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt).

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- HINTS -->

## Hints on dependencies

As `eslint` V9 requires a fundamental change to the configuration files, the update will be done in a later version.

As a consequence the package `eslint-plugin-cypress` cannot be updated to a version 4.x or 5.x (as this version has a peerDependency of eslint >= 9).

`@cypress/webpack-preprocessor` cannot be updated to v7.x as it does not support webpack v4.x (used by angular v17.x).

`cypress` cannot be updated to v15.x as it no longer supports webpack v4.x (angular v18 will switch away from webpack).

`@cypress/schematic` cannot be updated to v4.x, as this requires angular v18.x.

<p align="right">(<a href="#top">back to top</a>)</p>
