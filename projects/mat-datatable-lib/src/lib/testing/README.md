<a id="top"></a>

# API reference for Mat-Datatable testing
------------------------------------------------

`import { MatDatatableHarness } from '@bepo65/mat-datatable/testing';`

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#classes">Classes</a>
      <ul>
        <li><a href="#_matrowcellharnessbase">_MatRowCellHarnessBase</a></li>
        <li><a href="#_matrowharnessbase">_MatRowHarnessBase</a></li>
        <li><a href="#matdatatableharness">MatDatatableHarness</a></li>
        <li><a href="#matfootercellharness">MatFooterCellHarness</a></li>
        <li><a href="#matfooterrowharness">MatFooterRowHarness</a></li>
        <li><a href="#matheadercellharness">MatHeaderCellHarness</a></li>
        <li><a href="#matheaderrowharness">MatHeaderRowHarness</a></li>
        <li><a href="#matrowcellharness">MatRowCellHarness</a></li>
        <li><a href="#matrowharness">MatRowHarness</a></li>
      </ul>
    </li>
    <li>
      <a href="#interfaces">Interfaces</a>
      <ul>
        <li><a href="#cellharnessfilters">CellHarnessFilters</a></li>
        <li><a href="#matdatatableharnesscolumnstext">MatDatatableHarnessColumnsText</a></li>
        <li><a href="#matdatatableharnessfilters">MatDatatableHarnessFilters</a></li>
        <li><a href="#matrowharnesscolumnstext">MatRowHarnessColumnsText</a></li>
        <li><a href="#rowharnessfilters">RowHarnessFilters</a></li>
      </ul>
    </li>
  </ol>
</details>

## Classes

<a id="_matrowcellharnessbase"></a>

### **_MatRowCellHarnessBase** extends [ContentContainerComponentHarness\<string>](https://material.angular.io/cdk/test-harnesses/api#ContentContainerComponentHarness)

#### **Methods**

| | |
|------|-------------|
| `static async booleanMatches` | Checks if the specified nullable boolean value matches the given value. |
| **Parameters**|
| value: boolean \| null \| Promise\<boolean \| null> | The nullable boolean value to check, or a Promise resolving to the nullable boolean value. |
| pattern: boolean \| null | The boolean the value is expected to match. If 'pattern' is 'null', the value is expected to be 'null'. |
| **Returns** |
| Promise\<boolean> | Whether the value matches the pattern. |
| | |

| | |
|------|-------------|
| `async getColumnName` | Gets the name of the column that the cell belongs to. |
| **Returns** |
| Promise\<string> | The name of the column that the cell belongs to. |
| | |

| | |
|------|-------------|
| `async getColumnWidth` | Gets the cell's width in 'px' (with padding). |
| **Returns** |
| Promise\<number> | The cell's width. |
| | |

| | |
|------|-------------|
| `async getText` | Gets the cell's text. |
| **Returns** |
| Promise\<string> | The cell's text. |
| | |

<a id="_matrowharnessbase"></a>

### **_MatRowHarnessBase** extends [ComponentHarness](https://material.angular.io/cdk/test-harnesses/api#ComponentHarness)

Abstract class used as base for harnesses that interact with a mat-datatable row.

#### **Methods**

| | |
|------|-------------|
| `async getCells` | Gets a list of 'MatRowCellHarness', 'MatHeaderCellHarness' or 'MatFooterCellHarness' for all cells in the row. |
| filter: CellHarnessFilters = {} | A set of criteria that can be used to filter a list of cell harness instances. |
  **Returns** |
| Promise\<Cell[]> | A filtered list of MatRowCellHarness for the cells in the row. |
| | |

| | |
|------|-------------|
| `async getCellTextByColumnName` | Gets the text inside the row organized by columns. |
  **Returns** |
| Promise\<MatRowHarnessColumnsText> | The text inside the row organized by columns. |
| | |

| | |
|------|-------------|
| `async getCellTextByIndex` | Gets the text of the cells in the row. |
| **Parameters**|
| filter: CellHarnessFilters = {} | A set of criteria that can be used to filter a list of cell harness instances. |
| **Returns** |
| Promise\<string[]> | The text of the cells in the row. |
| | |

| | |
|------|-------------|
| `static async rowCellsContentMatch` | Checks if the values of the table row columns given in the 'value' parameter, match the given column values. Only columns defined in the pattern are inspected. |
| **Parameters**|
| value: MatRowHarnessColumnsText \| Promise<MatRowHarnessColumnsText> \| null | The nullable object defining all columns of a row and their values used for the checks. Alternatively a Promise resolving to the nullable object. |
| pattern: Record<string, string \| RegExp> \| null | Object defining the columns and the values or RegExp expected to match. If 'pattern' is 'null', the value is expected to be 'null'. |
| **Returns** |
| Promise\<boolean> | Whether the value matches the pattern. |
| | |

<a id="matdatatableharness"></a>

### **MatDatatableHarness** extends [ContentContainerComponentHarness\<string>](https://material.angular.io/cdk/test-harnesses/api#ContentContainerComponentHarness)

Harness for interacting with a mat-datatable in tests.

#### **Properties**

| Name | Description |
|------|-------------|
| `static hostSelector: '.mat-datatable'` | The selector for the host element of a 'MatDatatableHarness'. |
| | |

#### **Methods**

| | |
|------|-------------|
| `async getAllChildLoaders` | Gets an array of HarnessLoader instances. |
| **Parameters** |
| selector: string | A string used for selecting the instances. |
| **Returns** |
| Promise\<HarnessLoader[]> | An array of HarnessLoader instances. |
| | |

| | |
|------|-------------|
| `async getAllHarnesses` | Gets an array of harness instances. |
| **Parameters** |
| query: HarnessQuery<T> | A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Returns** |
| Promise\<T[]> | An array of harness instances. |
| | |

| | |
|------|-------------|
| `async getCellTextByColumnName` | Gets the text inside the entire table organized by columns. |
| **Returns** |
| Promise\<MatDatatableHarnessColumnsText> | The text inside the entire table organized by columns. |
| | |

| | |
|------|-------------|
| `async getCellTextByIndex` | Gets the text inside the entire table organized by rows. |
| **Returns** |
| Promise\<string[][]> | Array for all rows containing the content of a row as an array. |
| | |

| | |
|------|-------------|
| `async getChildLoader`| Searches for an element matching the given selector below the root element of this HarnessLoader. |
| **Parameters** |
| selector: string | A string used for selecting the HarnessLoader. |
| **Returns** |
| Promise\<HarnessLoader> | A new HarnessLoader rooted at the first matching element. |
| | |

| | |
|------|-------------|
| `async getFooterRows` | Gets a list of the footer rows in a mat-datatable. |
| **Returns** |
| Promise\<MatHeaderRowHarness[]> | A list of the footer rows. |
| | |

| | |
|------|-------------|
| `async getHarness` | Searches for an instance of the given ComponentHarness class or HarnessPredicate below the root element of this HarnessLoader. |
| **Parameters** |
| query: HarnessQuery<T> | A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Returns** |
| Promise\<T> | An instance of the harness corresponding to the first matching element. |
| | |

| | |
|------|-------------|
| `async getHarnessOrNull` | Gets an instance of the given ComponentHarness class or HarnessPredicate below the root element of this HarnessLoader. |
| **Parameters** |
| query HarnessQuery<T> | A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Returns** |
| Promise\<T \| null> | An instance of the harness corresponding to the first matching element. |
| | |

| | |
|------|-------------|
| `async getHeaderRows` | Gets a list of the header rows in a mat-datatable. |
| **Returns** |
| Promise\<MatHeaderRowHarness[]> | A list of the header rows. |
| | |

| | |
|------|-------------|
| `async getRows` | Gets a list of the regular data rows in a mat-datatable. |
| **Parameters** |
| filter: RowHarnessFilters = {} | A set of criteria that can be used to filter a list of row harness instances. |
| **Returns** |
| Promise\<MatRowHarness[]> | A filtered list of the regular data rows. |
| | |

| | |
|------|-------------|
| `async hasHarness` | Check, if the harness contains the instances defined by 'query'. |
| **Parameters** |
| query HarnessQuery<T> | A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Returns** |
| Promise\<boolean> | 'True', if the instances is part of the harness. |
| | |

| | |
|------|-------------|
| `async host` | Gets a Promise for the 'TestElement' representing the host element of the component. |
| **Returns** |
| Promise\<TestElement> | The 'TestElement' representing the host element of the component. |
| | |

| | |
|------|-------------|
| `static with` | Gets a 'HarnessPredicate' that can be used to search for a mat-datatable with specific attributes. |
| **Parameters** |
| options: TableHarnessFilters = {} | Options for narrowing the search. |
| **Returns** |
| HarnessPredicate<T> | A 'HarnessPredicate' configured with the given options. |
| | |

<a id="matfootercellharness"></a>

### **MatFooterCellHarness** extends [_MatRowCellHarnessBase](#MatRowCellHarnessBase)

Harness for interacting with an MDC-based Angular Material table footer cell.

#### **Properties**

| | |
|------|-------------|
| `static hostSelector: '.mat-mdc-footer-cell'` | The selector for the host element of a 'MatFooterCellHarness' instance. |

<a id="matfooterrowharness"></a>

### **MatFooterRowHarness** extends [_MatRowHarnessBase](#MatRowHarnessBase)

Harness for interacting with a mat-datatable footer row.

#### Properties

| | |
|------|-------------|
| `static hostSelector: '.mat-mdc-footer-row'` | Used to identify the host element of a 'MatFooterRowHarness' instance. |
| | |

<a id="matheadercellharness"></a>

### **MatHeaderCellHarness** extends [_MatRowCellHarnessBase](#MatRowCellHarnessBase)

Harness for interacting with an MDC-based Angular Material table header cell.

#### **Properties**

| | |
|------|-------------|
| `static hostSelector: '.mat-mdc-header-cell'` | The selector for the host element of a 'MatHeaderCellHarness' instance. |

#### **Methods**

| | |
|------|-------------|
| `async getText` | Gets the header cell's text. |
| **Return** |
| Promise\<string> | The header cell's text. |
| | |

| | |
|------|-------------|
| `async isResizable` | Check, if the cell is defined as 'resizable'. |
| **Returns** |
| Promise\<boolean> | The cell is resizable. |
| | |

| | |
|------|-------------|
| `async resize` | Resize the cell to a new width (if 'resizable'). |
| **Parameters** |
| newWidth: number | The new width of the cell in 'px'. |
| **Returns** |
| Promise\<void> | The cell got resized. |
| | |

<a id="matheaderrowharness"></a>

### **MatHeaderRowHarness** extends [_MatRowHarnessBase](#MatRowHarnessBase)

Harness for interacting with a mat-datatable header row.

#### Properties

| | |
|------|-------------|
| `static hostSelector: '.mat-mdc-header-row'` | Used to identify the host element of a 'MatHeaderRowHarness' instance. |
| | |

#### Methods

| | |
|------|-------------|
| `async getCells` | Gets a list of 'MatRowCellHarness' for all cells in the row. |
| **Parameters** |
| filter: HeaderCellHarnessFilters = {} | A set of criteria that can be used to filter a list of cell harness instances. |
| **Returns** |
| Promise\<MatHeaderCellHarness[]> | A filtered list of MatRowCellHarness for the cells in the header row. |
| | |

<a id="matrowcellharness"></a>

### **MatRowCellHarness** extends [_MatRowCellHarnessBase](#MatRowCellHarnessBase)

Harness for interacting with a mat-datatable cell in a row.

#### **Properties**

| | |
|------|-------------|
| `static hostSelector: '.mat-mdc-cell'` | Used to identify the host element of a 'MatRowCellHarness' instance. |

#### **Methods**

| | |
|------|-------------|
| `async isSingleLine` | Check, if the cell is defined as 'showAsSingleLine'. |
| **Returns** |
| Promise\<boolean> | The cell is shown as single line. |
| | |

<a id="matrowharness"></a>

### **MatRowHarness** extends [_MatRowHarnessBase](#MatRowHarnessBase)

Harness for interacting with a mat-datatable row.

#### **Properties**

| | |
|------|-------------|
| `static hostSelector: '.mat-mdc-row'` | Used to identify the elements in the DOM. |

#### **Methods**

| | |
|---|---|
| `async click` | Clicks the row (e.g. to select a row). |
| **Returns** |
| Promise\<void> | Promise that resolves when the click action completes. |
| | |

| | |
|------|-------------|
| `static with` | Gets a `HarnessPredicate` that can be used to search for a mat-datatable row with specific attributes. |
| **Parameters** |
| options: RowHarnessFilters = {} | Options for narrowing the search. |
| **Returns** |
| HarnessPredicate<T> | A 'HarnessPredicate' configured with the given options. |

<p align="right">(<a href="#top">back to top</a>)</p>

## **Interfaces**

### **CellHarnessFilters**

A set of criteria that can be used to filter a list of cell harness instances.

#### **Properties**

| | |
|------|-------------|
| columnName: string \| RegExp | Only find instances whose column name matches the given value. |
| text: string \| RegExp | Only find instances whose text matches the given value. |
| | |

### **MatDatatableHarnessColumnsText**

Text extracted from a table organized by columns.

This interface describes an object, whose keys are the names of the columns and whose values are an object with the following properties:

#### **Properties of a value**

| | |
|------|-------------|
| text: string[] | Array with content of the rows of this column. |
| headerText: string | Content of the header row of this column. |
| footerText: string \| undefined | Content of the footer row of this column. |
| | |

### **MatDatatableHarnessFilters**

A set of criteria that can be used to filter a list of table harness instances.

#### **Properties**

| | |
|------|-------------|
| - | |
| | |

### **MatRowHarnessColumnsText**

Text extracted from a table row organized by columns.

This interface describes an object, whose keys are the names of the columns and whose values are the corresponding cell content.

### **RowHarnessFilters**

A set of criteria that can be used to filter a list of row harness instances.

#### **Properties**

| | |
|------|-------------|
| - | |
| | |

<p align="right">(<a href="#top">back to top</a>)</p>
<p>(<a href="#matrowharness">back to matrowharness</a>)</p>
