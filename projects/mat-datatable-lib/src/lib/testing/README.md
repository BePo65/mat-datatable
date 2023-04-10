# API reference for mat-datatable-testing
------------------------------------------------

`import {MatDatatableHarness} from '@bepo65/mat-datatable/testing';`

## Classes

### **MatDatatableHarness**

Harness for interacting with a mat-datatable in tests.

#### **Properties**

| | |
|------|-------------|
| `static hostSelector` | The selector for the host element of a 'MatDatatableHarness' instance (value: '.mat-datatable'). |
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
| Promise<T[]> | An array of harness instances. |
| | |

| | |
|------|-------------|
| `async getCellTextByColumnName` | Gets the text inside the entire table organized by columns. |
| **Returns** |
| Promise<MatDatatableHarnessColumnsText> | The text inside the entire table organized by columns. |
| | |

| | |
|------|-------------|
| `async getCellTextByIndex` | Gets the text inside the entire table organized by rows. |
| **Returns** |
| Promise<string[][]> | Array for all rows containing the content of a row as an array. |
| | |

| | |
|------|-------------|
| `async getChildLoader`| Searches for an element matching the given selector below the root element of this HarnessLoader. |
| **Parameters** |
| selector: string | A string used for selecting the HarnessLoader. |
| **Returns** |
| Promise<HarnessLoader> | A new HarnessLoader rooted at the first matching element. |
| | |

| | |
|------|-------------|
| `async getHarness` | Searches for an instance of the given ComponentHarness class or HarnessPredicate below the root element of this HarnessLoader. |
| **Parameters** |
| query: HarnessQuery<T> | A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Returns** |
| Promise<T> | An instance of the harness corresponding to the first matching element. |
| | |

| | |
|------|-------------|
| `async getHarnessOrNull` | Gets an instance of the given ComponentHarness class or HarnessPredicate below the root element of this HarnessLoader. |
| **Parameters** |
| query HarnessQuery<T> | A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Returns** |
| Promise\<T | null> | An instance of the harness corresponding to the first matching element. |
| | |

| | |
|------|-------------|
| `async getHeaderRow` | Gets the header row in a mat-datatable. |
| **Parameters** |
| filter: RowHarnessFilters = {} | A set of criteria that can be used to filter a list of row harness instances. |
| **Returns** |
| Promise<HeaderRow> | The header row. |
| | |

| | |
|------|-------------|
| `async getRows` | Gets a list of the regular data rows in a mat-datatable. |
| **Parameters** |
| filter: RowHarnessFilters = {} | A set of criteria that can be used to filter a list of row harness instances. |
| **Returns** |
| Promise<Row[]> | A filtered list of the regular data rows. |
| | |

| | |
|------|-------------|
| `async hasHarness` | Check, if the harness contains the instances defined by 'query'. |
| **Parameters** |
| query HarnessQuery<T> | A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Returns** |
| Promise<boolean> | `True`, if the instances is part of the harness. |
| | |

| | |
|------|-------------|
| `async host` | Gets a Promise for the 'TestElement' representing the host element of the component. |
| **Returns** |
| Promise<TestElement> | The 'TestElement' representing the host element of the component. |
| | |

| | |
|------|-------------|
| `static with` | Gets a 'HarnessPredicate' that can be used to search for a mat-datatable with specific attributes. |
| **Parameters** |
| options: TableHarnessFilters = {} | Options for narrowing the search. |
| **Returns** |
| HarnessPredicate<T> | A 'HarnessPredicate' configured with the given options. |
| | |

### **MatRowHarness**

Harness for interacting with a mat-datatable row.

#### **Properties**

| | |
|------|-------------|
| `static hostSelector` | Used to identify the elements in the DOM (value: '.mat-mdc-row'). |

#### **Methods**

| | |
|------|-------------|
| `async getCellTextByColumnName` | Gets the text inside the row organized by columns. |
  **Returns** |
| Promise<MatRowHarnessColumnsText> | The text inside the row organized by columns. |
| | |

| | |
|------|-------------|
| `async getCellTextByIndex` | Gets the text of the cells in the row. |
| **Parameters**|
| filter: CellHarnessFilters = {} | A set of criteria that can be used to filter a list of cell harness instances. |
| **Returns** |
| Promise<string[]> | The text of the cells in the row. |
| | |

| | |
|------|-------------|
| `async getCells` | Gets a list of MatCellHarness for the cells in the row. |
| **Parameters** |
| filter: CellHarnessFilters = {} | A set of criteria that can be used to filter a list of cell harness instances. |
| **Returns** |
| Promise<Cell[]> | A filtered list of MatCellHarness for the cells in the row. |
| | |

| | |
|------|-------------|
| `async host` | Gets a Promise for the 'TestElement' representing the host element of the component. |
| **Returns** |
| Promise<TestElement> | The 'TestElement' representing the host element of the component. |
| | |

| | |
|------|-------------|
| `static with` | Gets a `HarnessPredicate` that can be used to search for a mat-datatable row with specific attributes. |
| **Parameters** |
| options: RowHarnessFilters = {} | Options for narrowing the search. |
| **Returns** |
| HarnessPredicate<T> | A 'HarnessPredicate' configured with the given options. |

### **MatHeaderRowHarness**

Harness for interacting with a mat-datatable header row.

#### Properties

| | |
|------|-------------|
| `static hostSelector` | Used to identify the host element of a 'MatHeaderRowHarness' instance (value: '.mat-mdc-header-row'). |
| | |

#### Methods

| | |
|------|-------------|
| `async getCellTextByColumnName` | Gets the text inside the row organized by columns. |
| **Returns** |
| Promise<MatRowHarnessColumnsText> | ?? |
| | |

| | |
|------|-------------|
| `async getCellTextByIndex` | Gets the text of the cells in the row. |
| **Parameters** |
| filter: CellHarnessFilters = {} | A set of criteria that can be used to filter a list of cell harness instances. |
| **Returns** |
| Promise<string[]> | The text of the cells in the row. |
| | |

| | |
|------|-------------|
| `async getCells` | Gets a list of 'MatCellHarness' for all cells in the row. |
| **Parameters** |
| filter: CellHarnessFilters = {} | A set of criteria that can be used to filter a list of cell harness instances. |
| **Returns** |
| Promise<Cell[]> | A filtered list of MatCellHarness for the cells in the row. |
| | |

| | |
|------|-------------|
| `async host` | Gets a Promise for the 'TestElement' representing the host element of the component. |
| **Returns** |
| Promise<TestElement> | The 'TestElement' representing the host element of the component. |
| | |

| | |
|------|-------------|
| `static with` | Gets a 'HarnessPredicate' that can be used to search for a mat-datatable header row with specific attributes. |
| **Parameters** |
| options: RowHarnessFilters = {} | Options for narrowing the search. |
| **Returns** |
| HarnessPredicate<T> | A 'HarnessPredicate' configured with the given options. |
| | |

### **MatCellHarness**

Harness for interacting with a mat-datatable cell.

#### **Properties**

| | |
|------|-------------|
| `static hostSelector` | Used to identify the host element of a 'MatCellHarness' instance (value: '.mat-mdc-cell'). |

#### **Methods**

| | |
|------|-------------|
| `async getAllChildLoaders` | Gets an array of HarnessLoader instances.?? |
| **Parameters** |
| selector: string | A string used for selecting the instances. |
| **Returns** |
| Promise<HarnessLoader[]> | An array of HarnessLoader instances. |
| | |

| | |
|------|-------------|
| `async getAllHarnesses` | Gets an array of harness instances. |
| **Parameters** |
| query: HarnessQuery<T> |A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Returns** |
| Promise<T[]> | An array of harness instances. |
| | |

| | |
|------|-------------|
| `async getChildLoader` | A new HarnessLoader rooted at the first matching element. |
| **Parameters** |
| selector: string | A string used for selecting the HarnessLoader. |
| **Returns** |
| Promise<HarnessLoader> | A new HarnessLoader rooted at the first matching element. |
| | |

| | |
|------|-------------|
| `async getColumnName` | Gets the name of the column that the cell belongs to. |
| **Returns** |
| Promise<string> | The name of the column that the cell belongs to. |
| | |

| | |
|------|-------------|
| `async getHarness` | Searches for an instance of the given ComponentHarness class or HarnessPredicate below the root element of this HarnessLoader. |
| **Parameters** |
| query: HarnessQuery<T> | A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Returns** |
| Promise<T> | An instance of the harness corresponding to the first matching element. |
| | |

| | |
|------|-------------|
| `async getHarnessOrNull`| Gets an instance of the given ComponentHarness class or HarnessPredicate below the root element of this HarnessLoader. |
| **Parameters** |
| query: HarnessQuery<T> | A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Returns** |
| Promise<T \| null> | An instance of the harness corresponding to the first matching element. |
| | |

| | |
|------|-------------|
| `async getText` | Gets the cell's text. |
| **Returns** |
| Promise<string> | The cell's text. |
| | |

| | |
|------|-------------|
| `async hasHarness` | Check, if the harness contains the instances defined by 'query'. |
| **Parameters** |
| query: HarnessQuery<T> | A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Returns** |
| Promise<boolean> | `True`, if the instances is part of the harness. |
| | |

| | |
|------|-------------|
| `async host` | Gets a Promise for the 'TestElement' representing the host element of the component. |
| **Return** |
| Promise<TestElement> | The 'TestElement' representing the host element of the component. |

| | |

| | |
|------|-------------|
| `static with` | Gets a 'HarnessPredicate' that can be used to search for a mat-datatable cell with specific attributes. |
| **Parameters** |
| options: CellHarnessFilters = {} | Options for narrowing the search. |
| **Return** |
| HarnessPredicate<MatCellHarness> | A `HarnessPredicate` configured with the given options. |
| | |

### **MatHeaderCellHarness**

Harness for interacting with an MDC-based Angular Material table header cell.

#### **Properties**

| | |
|------|-------------|
| `static hostSelector` | The selector for the host element of a 'MatHeaderCellHarness' instance (value: '.mat-mdc-header-cell'). |

#### **Methods**

| | |
|------|-------------|
| `async getAllChildLoaders` | Gets an array of HarnessLoader instances. |
| **Parameters** |
| selector: string | A string used for selecting the instances. |
| **Return** |
| Promise<HarnessLoader[]> | An array of HarnessLoader instances. |
| | |

| | |
|------|-------------|
| `async getAllHarnesses` | Gets an array of harness instances. |
| **Parameters** |
| query: HarnessQuery<T> | A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Return** |
| Promise<T[]> | An array of harness instances. |
| | |

| | |
|------|-------------|
| `async getChildLoader` | Searches for an element matching the given selector below the root element of this HarnessLoader. |
| **Parameters** |
| selector: string | A string used for selecting the HarnessLoader. |
| **Return** |
| Promise<HarnessLoader> | A new HarnessLoader rooted at the first matching element. |
| | |

| | |
|------|-------------|
| `async getColumnName` | Gets the name of the column that the header cell belongs to. |
| **Return** |
| Promise<string> | The name of the column that the cell belongs to. |
| | |

| | |
|------|-------------|
| `async getHarness` | Searches for an instance of the given ComponentHarness class or HarnessPredicate below the root element of this HarnessLoader. |
| **Parameters** |
| query: HarnessQuery<T> | A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Return** |
| Promise<T> | An instance of the harness corresponding to the first matching element. |
| | |

| | |
|------|-------------|
| `async getHarnessOrNull` | Gets an instance of the given ComponentHarness class or HarnessPredicate below the root element of this HarnessLoader. |
| **Parameters** |
| query: HarnessQuery<T> | A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Return** |
| Promise<T \| null> | An instance of the harness corresponding to the first matching element. |
| | |

| | |
|------|-------------|
| `async getText` | Gets the header cell's text. |
| **Return** |
| Promise<string> | The header cell's text. |
| | |

| | |
|------|-------------|
| `async hasHarness` | Check, if the harness contains the instances defined by 'query'. |
| **Parameters** |
| query: HarnessQuery<T> | A query for a ComponentHarness used to filter the instances, which is expressed as either a ComponentHarnessConstructor or a HarnessPredicate. |
| **Return** |
| Promise<boolean> | `True`, if the instances is part of the harness. |
| | |

| | |
|------|-------------|
| `async host` | Gets a Promise for the 'TestElement' representing the host element of the component. |
| **Return** |
| Promise<TestElement> | The 'TestElement' representing the host element of the component. |
| | |

| | |
|------|-------------|
| `static with` | Gets a `HarnessPredicate` that can be used to search for a table header cell with specific attributes. |
| **Parameters** |
| options: CellHarnessFilters = {} | Options for narrowing the search. |
| **Return** |
| HarnessPredicate<MatHeaderCellHarness> | A `HarnessPredicate` configured with the given options. |
| | |

## **Interfaces**

### **MatDatatableHarnessColumnsText**

Text extracted from a table organized by columns.

This interface describes an object, whose keys are the names of the columns and whose values are an object with the following properties:

#### **Properties of a value**

| | |
|------|-------------|
| text: string[] | Array with content of the rows of this column. |
| headerText: string | Content of the header row of this column. |
| | |


### **MatRowHarnessColumnsText**

Text extracted from a table row organized by columns.

This interface describes an object, whose keys are the names of the columns and whose values are the corresponding cell content.

### **CellHarnessFilters**

A set of criteria that can be used to filter a list of cell harness instances.

#### **Properties**

| | |
|------|-------------|
| columnName: string \| RegExp | Only find instances whose column name matches the given value. |
| text: string \| RegExp | Only find instances whose text matches the given value. |
| | |

### **RowHarnessFilters**

A set of criteria that can be used to filter a list of row harness instances.

#### **Properties**

| | |
|------|-------------|
| - | |
| | |

### **MatDatatableHarnessFilters**

A set of criteria that can be used to filter a list of table harness instances.

#### **Properties**

| | |
|------|-------------|
| - | |
| | |
