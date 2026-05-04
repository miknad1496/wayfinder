# AP Computer Science A — Unit 8: 2D Array — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 7.5–10% of the AP Computer Science A exam
- **Sub-topics covered:** 2D array creation; row-major vs column-major traversal; nested loops for 2D access; common 2D algorithms; row vs column lengths.
- **Where this unit appears on the exam:** FRQ Question 4 often involves 2D arrays. Nested loop tracing common in MCQ.

## Big Ideas

1. **2D array** is array of arrays — rectangular grid in concept.
2. **Access:** `arr[row][col]`.
3. **Row-major traversal** is conventional (outer loop rows, inner columns).
4. **`arr.length`** = number of rows; **`arr[0].length`** = number of columns (assuming rectangular).
5. **2D arrays as parameters** common.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **2D array declaration:**
  - **`int[][] grid = new int[3][4];`** — 3 rows, 4 columns; all zeros.
  - **`int[][] grid = {{1,2,3}, {4,5,6}, {7,8,9}};`** — initializer.
- **Access:**
  - **`grid[row][col]`** — element at row, column.
  - **Zero-indexed** in both dimensions.
- **Dimensions:**
  - **`grid.length`** = number of rows.
  - **`grid[0].length`** = number of columns (assuming rectangular).
  - **For non-rectangular (jagged):** `grid[i].length` for row i.
- **Row-major traversal (standard):**
  ```java
  for (int row = 0; row < grid.length; row++) {
    for (int col = 0; col < grid[0].length; col++) {
      // process grid[row][col]
    }
  }
  ```
- **Column-major traversal:**
  ```java
  for (int col = 0; col < grid[0].length; col++) {
    for (int row = 0; row < grid.length; row++) {
      // process grid[row][col]
    }
  }
  ```
- **Enhanced for over 2D:**
  ```java
  for (int[] row : grid) {
    for (int x : row) {
      // process x
    }
  }
  ```
- **Common 2D operations:**
  - **Sum all elements.**
  - **Sum a specific row** or column.
  - **Find max element** and its location.
  - **Search for value.**
  - **Transpose** (rows become columns).
  - **Sum of diagonal:**
    ```java
    for (int i = 0; i < grid.length; i++) {
      sum += grid[i][i];
    }
    ```

### Adds for [4]

- **Why row-major standard:**
  - **Java stores 2D arrays as arrays of arrays** — each row is contiguous.
  - **Row-major access** is cache-efficient.
  - **Convention** matches mathematical matrix notation.
- **Sum a row vs column:**
  - **Row sum:** fix row, vary column.
  - **Column sum:** fix column, vary row.
- **Transpose:**
  - **New matrix where transposed[j][i] = original[i][j].**
  - **Swap rows and columns.**
- **Boundary issues:**
  - **Iterating** with `i < grid.length` and `j < grid[0].length`.
  - **Off-by-one** for borders.
- **Edge effects** in image/grid processing:
  - **Adjacent cells** require checking boundaries.

### Adds for [5]

- **Why 2D arrays useful:**
  - **Tables, grids, matrices, game boards.**
  - **Image processing** (pixels are 2D).
  - **Spreadsheets.**
- **Cache efficiency:**
  - **Row-major access** uses cache better.
  - **Column-major** in row-major storage is cache-unfriendly (less important at AP level).

## Worked Examples

### Example 1 [3] — Create and access

```java
int[][] grid = {{1,2,3}, {4,5,6}, {7,8,9}};
int x = grid[1][2];
int rows = grid.length;
int cols = grid[0].length;
```
- x = **6** (row 1, col 2).
- rows = **3**.
- cols = **3**.

### Example 2 [3] — Sum all elements

```java
int sum = 0;
for (int row = 0; row < grid.length; row++) {
  for (int col = 0; col < grid[0].length; col++) {
    sum += grid[row][col];
  }
}
```
- For 3×3 grid {{1,2,3},{4,5,6},{7,8,9}}: sum = **45**.

### Example 3 [4] — Sum specific row

Sum of row 2:
```java
int rowSum = 0;
for (int col = 0; col < grid[2].length; col++) {
  rowSum += grid[2][col];
}
```

### Example 4 [4] — Sum specific column

Sum of column 1:
```java
int colSum = 0;
for (int row = 0; row < grid.length; row++) {
  colSum += grid[row][1];
}
```

### Example 5 [5] — Transpose

Create transpose of m×n matrix.
```java
int[][] transpose(int[][] grid) {
  int rows = grid.length;
  int cols = grid[0].length;
  int[][] t = new int[cols][rows];
  for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
      t[j][i] = grid[i][j];
    }
  }
  return t;
}
```

## Top Traps & Common Errors

1. **Wrong dimensions.** `grid.length` = rows; `grid[0].length` = columns.
2. **Confusing row and column.** `grid[row][col]` not `grid[col][row]`.
3. **Off-by-one in boundary.** Use `< grid.length` and `< grid[0].length`.
4. **Assuming rectangular.** For jagged arrays, each `grid[i].length` may differ.
5. **Forgetting nested loop structure** for 2D operations.

## Rubric-Aware Tactics

**For 2D FRQ:**
- **Use `grid.length` and `grid[0].length`** for bounds.
- **Use row-major** unless problem requires column-major.
- **Verify** dimensions match operation (sum row vs column).

## "Phrases That Score" — verbatim language for FRQs

1. "2D arrays in Java are arrays of arrays. `grid.length` returns the number of rows; `grid[0].length` returns the number of columns (for rectangular arrays). Access uses double bracket: `grid[row][col]`."
2. "Row-major traversal — outer loop over rows, inner loop over columns — is conventional and cache-efficient: `for (int row = 0; row < grid.length; row++) for (int col = 0; col < grid[0].length; col++) ...`."
3. "To sum a specific row: fix the row index, vary the column. To sum a specific column: fix the column index, vary the row. The diagonal: `grid[i][i]` for i from 0 to grid.length - 1."
4. "Transposing a matrix swaps rows and columns: `transposed[j][i] = original[i][j]`. The result has dimensions m×n becoming n×m."
5. "Enhanced for loop works on 2D arrays as nested for-each: `for (int[] row : grid) for (int x : row) { ... }` — clean for read-only traversal."

## If You Do Nothing Else for This Unit

*Master 2D array creation, access, dimensions. Master row-major traversal. Master common 2D operations (sum, sum row/col, max, search). Use grid.length and grid[0].length.*

_lastUpdated: 2026-05-04
_sources: College Board AP CSA CED 2024-25, Java AP Subset documentation, Princeton Review AP CSA 2025
_difficulty: foundational
_relatedUnits: ap-computer-science-a-unit-4-iteration, ap-computer-science-a-unit-6-array
