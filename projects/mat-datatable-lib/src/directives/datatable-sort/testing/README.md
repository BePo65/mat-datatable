# API reference for mat-multi-sort-testing


`import {MatMultiSortHarness} from '@bepo65/mat-multi-
sort/testing';`

## Classes

### **MatMultiSortHarness** extends ComponentHarness

Harness for interacting with a `mat-multi-sort` element in tests.

#### **Properties**

| | |
|------|-------------|
| `static hostSelector` | Used to identify the elements in the DOM (value: '.mat-multi-sort'). |
| | |

#### **Methods**

| | |
|---|---|
| `async getActiveHeaders` | Gets all headers used for sorting in the 'mat-multi-sort'. |
| **Returns** |
| Promise\<MatMultiSortHeaderHarness[]> | All headers used for sorting. |
| | |

| | |
|---|---|
| `async getSortHeaders` | Gets the headers used for sorting in the 'mat-multi-sort' reduced by the given 'filter'. |
| **Parameters** |
| filter: MultiSortHeaderHarnessFilters = {} | |
| **Returns** |
| Promise\<MatMultiSortHeaderHarness[]> | The filtered sort headers. |
| | |

| | |
|---|---|
| `async host` | Gets a Promise for the 'TestElement' representing the host element of the component. |
| **Returns** |
| Promise\<TestElement> | The 'TestElement' representing the host element of the component. |
| | |

| | |
|---|---|
| `static with` | Gets a 'HarnessPredicate' that can be used to search for a 'mat-multi-sort' with specific attributes. |
| **Parameters** |
| options: MultiSortHarnessFilters = {} | Options for narrowing the search. |
| **Returns** |
| HarnessPredicate\<MatMultiSortHarness> | A 'HarnessPredicate' configured with the given options. |
| | |

### **MatMultiSortHeaderHarness** extends ComponentHarness

Harness for interacting with a `mat-multi-sort header` element in tests.

#### **Properties**

| | |
|---|---|
| `static hostSelector` | Used to identify the elements in the DOM (value: '.mat-multi-sort-header'). |
| | |

#### **Methods**

| | |
|---|---|
| `async click` | Clicks the header to change its sorting direction. Only works if the header is enabled. |
| **Returns** |
| Promise\<void> | Promise that resolves when the click action completes. |
| | |

| | |
|---|---|
| `async getLabel` | Gets the label of the sort header. |
| **Returns** |
| Promise\<string> | The label of the sort header. |
| | |

| | |
|---|---|
| `async getSortDirection` | Gets the sorting direction of the header. |
| **Returns** |
| Promise\<SortDirection> | The sorting direction of the header. |
| | |

| | |
|---|---|
| `async host` | Gets a Promise for the 'TestElement' representing the host element of the component. |
| **Returns** |
| Promise<TestElement> | The 'Promise' for the 'TestElement'. |
| | |

| | |
|---|---|
| `async isActive` | Gets whether the sort header is currently being used for sorting. |
| **Returns** |
| Promise<boolean> | `True`, if the sort header is currently being used for sorting. |
| | |

| | |
|---|---|
| `async isDisabled` | Whether the sort header is disabled. |
| **Returns** |
| Promise<boolean> | `True`, if the sort header is disabled. |
| | |

| | |
|---|---|
| `static with` | Gets a 'HarnessPredicate' that can be used to search for a sort header with specific attributes. |
| **Parameters** |
| options: MultiSortHeaderHarnessFilters = {} | Options for narrowing the search. |
| **Returns** |
| HarnessPredicate\<MatMultiSortHeaderHarness> | A 'HarnessPredicate' configured with the given options. |
| | |

## Interfaces

### **MultiSortHarnessFilters**

#### **Properties**

| | |
|---|---|
| - | |
| | |

### **MultiSortHeaderHarnessFilters**

#### **Properties**

| | |
|---|---|
| `label: string \| RegExp` | Label of the header. |
| `id: string \| RegExp` | ID of the header element. |
| `sortDirection: SortDirection` | Sort direction of the header. |
| `sortPosition: number` | Sort position of the header (1..n). |
| | |
