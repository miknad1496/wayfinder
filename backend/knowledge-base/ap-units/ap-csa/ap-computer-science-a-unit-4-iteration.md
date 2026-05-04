# AP Computer Science A — Unit 4: Iteration — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 17.5–22.5% of the AP Computer Science A exam
- **Sub-topics covered:** while loops; for loops; nested loops; loop traversal of Strings; iteration patterns; informal code analysis (Big-O concepts).
- **Where this unit appears on the exam:** Largest content unit. Loop tracing tested constantly. Off-by-one errors common. Nested loops for 2D structures (Unit 8).

## Big Ideas

1. **Loops repeat code** — while (condition-based) and for (counter-based).
2. **For loops** are syntactic sugar for while loops with init + update.
3. **Nested loops** iterate 2D structures (rows × columns).
4. **Off-by-one errors** are the #1 loop bug.
5. **String traversal** uses charAt(i) in indexed loop.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **While loop:**
  - ```java
    while (condition) {
      // body
    }
    ```
  - **Tests condition first;** body may execute 0 times.
- **For loop:**
  - ```java
    for (init; condition; update) {
      // body
    }
    ```
  - **Standard counter:** `for (int i = 0; i < n; i++) { ... }`.
- **For vs while equivalence:**
  - ```java
    for (int i = 0; i < 10; i++) { ... }
    ```
  - equivalent to:
  - ```java
    int i = 0;
    while (i < 10) {
      ...
      i++;
    }
    ```
- **Common loop patterns:**
  - **Counter:** `for (int i = 0; i < n; i++)`.
  - **Reverse:** `for (int i = n-1; i >= 0; i--)`.
  - **Step by 2:** `for (int i = 0; i < n; i += 2)`.
- **String traversal:**
  - **Indexed:** access characters via `s.charAt(i)`.
  - **Length-based loop:** `for (int i = 0; i < s.length(); i++)`.
- **Nested loops:**
  - **Loop inside loop.**
  - **Outer loop runs slow;** inner loop runs fast.
  - **For 2D:** outer = rows, inner = columns (typical).
- **Counting and accumulating:**
  - **Sum:** `int sum = 0; for (...) sum += value;`.
  - **Count:** `int count = 0; for (...) if (cond) count++;`.
  - **Min/max:** initialize, compare in loop.
- **Loop control:**
  - **break:** exit loop immediately.
  - **continue:** skip to next iteration.
  - (Not heavily tested on AP exam but appears.)
- **Common errors:**
  - **Off-by-one:** loop runs one too few or too many times.
  - **Infinite loop:** condition never becomes false.
  - **Wrong direction:** decrementing when should increment, etc.

### Adds for [4]

- **Boundary checks:**
  - **`i < n`** vs **`i <= n`** — different total iterations.
  - **For 0-indexed array of length n:** `for (int i = 0; i < n; i++)` covers indices 0 to n-1.
- **Loop variants:**
  - **For-each (enhanced for):** `for (int x : array) { ... }`.
    - **Cannot modify** array elements; use indexed for that.
- **Common String operations in loop:**
  - **Count characters:** count if charAt(i) matches.
  - **Reverse string:** loop in reverse, build new string.
  - **Check palindrome:** compare i and length-1-i.
- **Nested loop patterns:**
  - **Multiplication table:**
    ```java
    for (int i = 1; i <= 10; i++) {
      for (int j = 1; j <= 10; j++) {
        System.out.print(i*j + "\t");
      }
      System.out.println();
    }
    ```
- **Big-O concepts (informal):**
  - **Single loop over n:** O(n).
  - **Nested loop over n×n:** O(n²).
  - **Loop with halving:** O(log n) (binary search).

### Adds for [5]

- **Why off-by-one common:**
  - **Boundary thinking:** start from 0 or 1? End < or <=?
  - **Test with small input** to catch.
- **Why for-each useful:**
  - **Cleaner syntax** for read-only traversal.
  - **No index management.**
  - **Limit:** can't easily access index or modify.
- **Why nested loops O(n²):**
  - **Outer runs n times.**
  - **Inner runs n times each.**
  - **Total: n² operations.**

## Worked Examples

### Example 1 [3] — Trace for loop

```java
int sum = 0;
for (int i = 1; i <= 5; i++) {
  sum += i;
}
```
- Iterations: i=1 (sum=1), i=2 (sum=3), i=3 (sum=6), i=4 (sum=10), i=5 (sum=15).
- **Final sum: 15.**

### Example 2 [3] — While loop

```java
int n = 10;
int count = 0;
while (n > 0) {
  n /= 2;
  count++;
}
```
- n=10 → 5 (count=1), 5→2 (count=2), 2→1 (count=3), 1→0 (count=4).
- **Final count: 4.**
- **Note:** integer division.

### Example 3 [4] — String traversal

Count vowels in a String.
```java
String s = "hello world";
int count = 0;
for (int i = 0; i < s.length(); i++) {
  char c = s.charAt(i);
  if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') {
    count++;
  }
}
```
- "hello world" → 'e', 'o', 'o' → **count = 3**.

### Example 4 [4] — Nested loop trace

```java
int n = 0;
for (int i = 1; i <= 3; i++) {
  for (int j = 1; j <= 2; j++) {
    n++;
  }
}
```
- **Inner runs 2 times each outer.**
- **Outer runs 3 times.**
- **Total: 3 × 2 = 6.**
- **n = 6.**

### Example 5 [5] — Off-by-one analysis

For array of length 10, what's wrong with `for (int i = 0; i <= 10; i++) arr[i] = 0;`?
- **i goes from 0 to 10** — that's 11 values.
- **Array indices** are 0 to 9.
- **`arr[10]` throws ArrayIndexOutOfBoundsException.**
- **Fix:** `i < 10` (or `i < arr.length`).

## Top Traps & Common Errors

1. **Off-by-one.** `i <= n` runs one more iteration than `i < n`.
2. **Infinite loop.** Forgetting to update loop variable; condition never becomes false.
3. **Confusing while and do-while.** While tests first; do-while tests after (body always runs at least once).
4. **For-each can't modify** array elements.
5. **Nested loop confusion.** Outer slow, inner fast.
6. **String index** is 0-based; `s.length()` is exclusive bound.

## Rubric-Aware Tactics

**For loop tracing MCQ:**
- **Make table** of variables after each iteration.
- **Watch for** off-by-one.

**For FRQ requiring loop:**
- **Use** `i < arr.length` not hard-coded number.
- **Verify** boundary conditions.

## "Phrases That Score" — verbatim language for FRQs

1. "While loops repeat as long as a condition is true; for loops are syntactic sugar combining initialization, condition, and update: `for (int i = 0; i < n; i++)` covers indices 0 to n-1."
2. "Off-by-one errors are the most common loop bugs: `i < n` runs n iterations (indices 0 to n-1); `i <= n` runs n+1 iterations and may overshoot array bounds."
3. "Nested loops iterate two-dimensional structures: an outer loop over rows and inner loop over columns yields O(n×m) iterations. The outer loop variable changes slowly; the inner loop variable changes quickly."
4. "String traversal uses `s.charAt(i)` in an indexed loop bounded by `s.length()`: `for (int i = 0; i < s.length(); i++) { char c = s.charAt(i); ... }`."
5. "The enhanced for loop (`for (int x : arr)`) provides cleaner syntax for read-only traversal but does not allow modification of array elements; use indexed `for` when modifications are needed."

## If You Do Nothing Else for This Unit

*Master while and for syntax. Master loop tracing. Master common patterns (sum, count, min/max, traverse). Master nested loops for 2D. Avoid off-by-one. Use `i < arr.length`.*

_lastUpdated: 2026-05-04
_sources: College Board AP CSA CED 2024-25, Java AP Subset documentation, Princeton Review AP CSA 2025
_difficulty: foundational
_relatedUnits: ap-computer-science-a-unit-3-boolean-if, ap-computer-science-a-unit-6-array, ap-computer-science-a-unit-8-2d-array
