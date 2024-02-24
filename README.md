<a name="readme-top"></a>

# Mat-Datatable

A simple data table with virtual scrolling using Angular Material.

![Version](https://img.shields.io/badge/version-15.0.0-blue.svg?cacheSeconds=2592000)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)]
![Angular version](https://img.shields.io/github/package-json/dependency-version/mat-datatable/@angular/core?color=red&label=Angular&logo=angular&logoColor=red)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/mat-datatable/@angular/material?color=red&label=Angular-Material&logo=angular&logoColor=red)

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

This project extends 'angular material table' so that it can be used as a replacement for [ngx-datatable](https://github.com/swimlane/ngx-datatable) in one of my projects. Unluckily ngx-datatable seems to be dead as it is still on angular v12 and an update to a more recent angular version is not in sight.

Nat-Datatable implements a table with virtual scrolling, sorting and filtering. Only a minimal set of the functionality of ngx-datatable is implemented.

![Screenshot](assets/screenshot.jpg "Screenshot of the demo page")

Try out the [live demo](https://bepo65.github.io/mat-datatable/).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

To use this package in your project just follow these simple steps.

### Prerequisites

The package can be used in Angular apps with Angular Material installed.

### Installation

Install the package from npmjs
   ```sh
   npm install @bepo65/mat-datatable
   ```

### Embed mat-datatable in project

Configure your angular application module (e.g: app.module.ts):
```ts
...
import { MatDatatableModule } from 'mat-datatable';

@NgModule({
  ...
  imports: [
    ...
    MatDatatableModule
  ]
})
```

Add Mat-Datatable to your html file (e.g: app.component.html):
```html
<div class="content-table">
  <mat-datatable #datatable
    [columnDefinitions]="columnDefinitions"
    [displayedColumns]="displayedColumns"
    [dataStoreProvider]="dataStore"
    [trackBy]="trackBy">
    loading...
  </mat-datatable>
</div>
```

The height of the element containing the mat-datatable must be set explicitly (e.g: app.component.scss):
```css
.content-table {
  height: 400px;
  margin: 0 1em;
  overflow: auto;
}
```

Some properties of mat-datatable must be configured in the component class (e,g, app.component.ts):
```ts
export class AppComponent {
  ...
    protected dataStore = new MyTableDataStore<MyTableItem>();
    protected columnDefinitions: MatColumnDefinition<MyTableItem>[] = [
      {
        columnId: 'id',
        header: 'ID',
        cell: (row: DemoTableItem) => row?.userId?.toString(),
        footer: 'id'
      },
      {
        columnId: 'name',
        sortable: true,
        resizable: true,
        header: 'Name',
        cell: (row: DemoTableItem) => row?.firstName,
        footer: 'name'
      }

    ];
    protected displayedColumns: string[] = ['id', 'name'];

```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Used assets

The component is based on Angular Material and uses [Google Fonts](https://fonts.google.com/specimen/Roboto) and the [Google Material Icons](https://google.github.io/material-design-icons/#icon-font-for-the-web) font.
Both fonts are part of the project and not fetched via https.

## Mat-Datatable Demo

Demo project to show all features of Mat-Datatable.

```
git clone git@github.com:BePo65/mat-datatable.git
cd mat-datatable
npm start
```

Navigate to http://localhost:4200

<!-- API -->
## API reference

`import { MatDatatable } from '@bepo65/mat-datatable';`

## Classes

### **MatDatatable**

Component to create an angular material table based datatable.
The component is generic; the given type is used to define the object for the row data.

#### **Properties**

| Name | Description |
|------|-------------|
| `@Input() columnDefinitions: MatColumnDefinition<T>[]` | The definition of the columns used in the table. The order of the definitions needs not to correspond to the order of the columns in the table. Default value: `[]`. |
| | |

| Name | Description |
|------|-------------|
| `@Input() displayedColumns: string[]` | A list with the names of the columns in the table. The array contains the 'columnId' of the corresponding column definition. Default value: `[]`. |
| | |

| Name | Description |
|------|-------------|
| `@Input() rowSelectionMode: RowSelectionType` | The type of row selection. Default value: `'none'`. |
| | |

| Name | Description |
|------|-------------|
| `@Input() dataStoreProvider: DataStoreProvider<T>` | An object that connects the mat-datatable with the data source. The object must be the instance of a class implementing the DataStoreProvider interface. Default value: `new EmptyDataStoreProvider<T>`. |
| | |

| Name | Description |
|------|-------------|
| `@Input() trackBy(): TrackByFunction<T>` | A function that returns a value that identifies a single row. Default value: `(index: number, item: T) => JSON.stringify(item)`. |
| | |

| Name | Description |
|------|-------------|
| withFooter: boolean | Whether the table has a footer row. Default value: `true`. |
| | |

| Name | Description |
|------|-------------|
| `@Output() rowClick: EventEmitter<T>` | Emitted when a row is clicked. |
| | |

| Name | Description |
|------|-------------|
| @Output() rowSelectionChange: EventEmitter<T[]> | Emitted when the list of selected rows changes. |
| | |

| Name | Description |
|------|-------------|
| `@Output() sortChange: EventEmitter<MatSortDefinition[]>` | Emitted when the sort definition changes. |
| | |

| Name | Description |
|------|-------------|
| `firstVisibleIndexChanged: Observable<number>` | Emitted when the index of the first visible row changes. |
| | |

| Name | Description |
|------|-------------|
| `totalRowsChanged: Observable<number>` | Emitted when the total number of rows in the datastore changes (does not depend on any active filter). |
| | |

| Name | Description |
|------|-------------|
| `filteredRowsChanged: Observable<number>` | Emitted when the number of filtered rows changes. |
| | |

| Name | Description |
|------|-------------|
| `activatedRow: T \| undefined` | Marks a row as 'active'. |
| | |

| Name | Description |
|------|-------------|
| `selectedRows: T[]` | Marks rows as 'selected'. |
| | |

| Name | Description |
|------|-------------|
| `sortDefinitions: MatSortDefinition[]` | Gets / sets the current sort definition. |
| | |

| Name | Description |
|------|-------------|
| `filterDefinitions: FieldFilterDefinition\<T>[]` | Gets / sets the current filter definition. |
| | |

#### **Methods**

| | |
|------|-------------|
| `scrollToRow` | Scrolls to the given row. |
| **Parameters** |
| row: T | Row to show on the top of the current viewport. |
| | |

| | |
|------|-------------|
| `reloadTable` | Reloads the rows of the table. |
| | |

## Interfaces

### DataStoreProvider

Component to create an angular material table based datatable.
The component is generic; the given type is used to define the object for the row data.

#### **Methods**

| | |
|------|-------------|
| `getPagedData` | Fetches data from the datastore respecting sorting and filtering. |
| **Parameters** |
| rowsRange: RequestRowsRange | The range of rows to fetch. |
| sorts: FieldSortDefinition<T>[] | The sort definitions to use. |
| filters: FieldFilterDefinition<T>[] | The filter definitions to use. |
| **Returns** |
| Observable<Page<T>> | Emitting fetched data from the datastore. |
| | |

### MatColumnDefinition

Interface for the definition of a single table column.

#### **Properties**

| Name | Description |
|------|-------------|
| `columnId: string` | The ID of the column. |
| `sortable: boolean` | Whether this column can be used for sorting. By default a column is not sortable. |
| `resizable: boolean` | Whether this column can be resized. By default a column is not resizable. |
| `header: string` | The text in the header row of a column. |
| `headerAlignment: ColumnAlignmentType` | The alignment of the header row of a column. |
| `cell: (element: TRowData) => string` | The function to get the content of a cell. |
| `cellAlignment: ColumnAlignmentType` | The alignment of a data row in a column. |
| `width: string` | The width of the column. |
| `tooltip: (element: TRowData) => string` | The function to get the tooltip for a cell. |
| `showAsMailtoLink: boolean` | Whether this cell should be shown a 'mailto' link. By default a column is not shown as mailto link. |
| `showAsSingleLine: boolean` | Whether this cell should be truncated to a single line. By default multiline text in a column is not shown as a single line. |
| `footer: string` | The text in the footer row of a column. |
| `footerAlignment: ColumnAlignmentType` | The alignment of the footer row of a column. |
| `footerColumnSpan: number` | The number of columns a footer should span. By default a footer spans 1 column. |
| | |

### MatSortDefinition

Interface for the definition of the sorting of 1 table column.

#### **Properties**

| Name | Description |
|------|-------------|
| `columnId: string` | The 'columnId' of the column to use for sorting. |
| `direction: SortDirection` | The direction used to sort the column. |
| | |

### Page

Interface defining the properties of a requests for a range of rows.

#### **Properties**

| Name | Description |
|------|-------------|
| `startRowIndex: number` | The index of the first row to return. |
| `numberOfRows: number` | The number of rows to return. |
| | |

### RequestRowsRange

Interface defining the properties of a page of rows returned from the datastore.

#### **Properties**

| Name | Description |
|------|-------------|
| `content:T[]` | The array of the requested rows. |
| `startRowIndex` | The index of the first row returned. |
| `returnedElements` | The number of rows in 'content'. |
| `totalElements` | The number of rows in the unfiltered data store. |
| `totalFilteredElements` | The number of rows after filtering. |
| | |


## Type aliases

### ColumnAlignmentType

The alignment of the content of a column

| |
|------|
| type ColumnAlignmentType = "left" | "center" | "right"; |
| |

### FieldFilterDefinition

The definition of a parameter filtering for the column identified by the given 'fieldName'.

| |
|------|
| type FieldFilterDefinition<T> = StrictUnion\<(FieldFilterDefinitionSimple\<T> \| FieldFilterDefinitionRange\<T>)>; |
| |

### FieldFilterDefinitionRange

The definition of a parameter filtering for a range of values.

| |
|------|
| type FieldFilterDefinitionSimple<T> = {<br>&nbsp;&nbsp;fieldName: keyof T<br>&nbsp;&nbsp;valueFrom: string \| number \| Date<br>&nbsp;&nbsp;valueTo: string \| number \| Date<br>}; |
| |

### FieldFilterDefinitionSimple

The definition of a parameter filtering for a single value.

| |
|------|
| type FieldFilterDefinitionSimple<T> = {<br>&nbsp;&nbsp;fieldName: keyof T<br>&nbsp;&nbsp;value: string \| number \| Date<br>}; |
| |

### FieldSortDefinition

The definition of a single sort parameter.

| |
|------|
| type FieldSortDefinition<T> = {<br>&nbsp;&nbsp;fieldName: keyof T<br>&nbsp;&nbsp;sortDirection: SortDirectionAscDesc<br>}; |
| |

### RowSelectionType

How many rows can be selected.

| |
|------|
| type RowSelectionType = 'none' \| 'single' \| 'multi'; |
| |

### SortDirectionAscDesc

The direction of a sort.

| |
|------|
| type SortDirection = 'asc' \| 'desc'; |
| |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/BePo65/mat-datatable/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Hints on possible extensions

+ to make footer turn on / off dynamically it is not sufficient to wrap the footer cell and row definitions in ng-container. Details see [stackoverflow](https://stackoverflow.com/questions/63644938/angular-material-mat-table-dynamic-footer-header-rowdef/63648914#63648914). The demo uses [ngx-rerender](https://www.npmjs.com/package/ngx-rerender).

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


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

This project uses icons from the [Google Material Icons Library](https://developers.google.com/fonts/docs/material_icons) that are licensed under the [Apache License Version 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt).

<p align="right">(<a href="#readme-top">back to top</a>)</p>
