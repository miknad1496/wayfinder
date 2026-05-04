# AP Computer Science A — Unit 6: Array — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 10–15% of the AP Computer Science A exam
- **Sub-topics covered:** array creation; array access; array traversal; common array algorithms (sum, count, min/max, search, swap); enhanced for loop with arrays.
- **Where this unit appears on the exam:** Common in MCQ. Often appears in FRQ alongside other concepts. Off-by-one errors common.

## Big Ideas

1. **Arrays store fixed-size sequence** of same-type elements.
2. **Zero-indexed:** indices 0 to length-1.
3. **`array.length`** gives size.
4. **Common algorithms:** sum, count, min/max, find, swap.
5. **Enhanced for loop** convenient for read-only traversal.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Array declaration:**
  - **`int[] arr = new int[10];`** creates array of 10 ints (default 0).
  - **`int[] arr = {1, 2, 3, 4, 5};`** initializer list.
  - **`String[] names = new String[5];`** creates array of 5 Strings (default null).
- **Array access:**
  - **`arr[i]`** — element at index i.
  - **Zero-indexed:** first element is `arr[0]`.
  - **Last element:** `arr[arr.length - 1]`.
- **Array length:**
  - **`arr.length`** — note: **field, NOT method** (no parentheses).
  - **Compare to String:** `s.length()` (method, with parentheses).
- **Indexed traversal:**
  ```java
  for (int i = 0; i < arr.length; i++) {
    // process arr[i]
  }
  ```
- **Enhanced for (for-each):**
  ```java
  for (int x : arr) {
    // process x
  }
  ```
  - **Cannot modify** arr through x.
- **Common algorithms:**
  - **Sum:**
    ```java
    int sum = 0;
    for (int x : arr) sum += x;
    ```
  - **Count meeting condition:**
    ```java
    int count = 0;
    for (int x : arr) if (x > threshold) count++;
    ```
  - **Find max:**
    ```java
    int max = arr[0];
    for (int x : arr) if (x > max) max = x;
    ```
  - **Find min:** similar.
  - **Linear search:**
    ```java
    int idx = -1;
    for (int i = 0; i < arr.length; i++) {
      if (arr[i] == target) { idx = i; break; }
    }
    ```
  - **Swap:**
    ```java
    int temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
    ```
  - **Reverse:**
    ```java
    for (int i = 0; i < arr.length / 2; i++) {
      int temp = arr[i];
      arr[i] = arr[arr.length - 1 - i];
      arr[arr.length - 1 - i] = temp;
    }
    ```
- **Array bounds:**
  - **Valid indices:** 0 to length - 1.
  - **Out of bounds:** `ArrayIndexOutOfBoundsException`.
- **Default values:**
  - **int, double:** 0 / 0.0.
  - **boolean:** false.
  - **Object reference:** null.
- **Arrays of objects:**
  - **`Person[] people = new Person[5];`** creates 5 null references.
  - **Must initialize each:** `people[0] = new Person(...);`.

### Adds for [4]

- **Why arr.length is a field:**
  - **Java design choice:** array length is fixed at creation, exposed as field.
  - **Contrast with String** (method to allow potential subclassing).
- **Selection sort (sometimes tested):**
  ```java
  for (int i = 0; i < arr.length - 1; i++) {
    int minIdx = i;
    for (int j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    // swap arr[i] and arr[minIdx]
  }
  ```
- **Insertion sort:**
  - **Build sorted prefix** by inserting each element in correct position.
- **Binary search (sorted array):**
  - **Halve search space** each step.
  - **O(log n)** vs linear's O(n).
  - **Requires sorted array.**
- **Why for-each can't modify:**
  - **`for (int x : arr) x = 0;`** doesn't modify array.
  - **`x` is local copy** for primitives; reference copy for objects (but reassignment doesn't update array).
  - **Use indexed for** to modify.

### Adds for [5]

- **Why arrays:**
  - **Fast access** by index (O(1)).
  - **Fixed size:** can't grow without making new array (use ArrayList).
  - **Efficient memory.**
- **Why off-by-one bugs.**
  - **0 vs 1 indexing.**
  - **`<` vs `<=`.**
  - **Always test boundaries.**

## Worked Examples

### Example 1 [3] — Sum of array

```java
int[] arr = {1, 2, 3, 4, 5};
int sum = 0;
for (int x : arr) sum += x;
```
- sum = **15**.

### Example 2 [3] — Find max

```java
int[] arr = {3, 1, 4, 1, 5, 9, 2, 6};
int max = arr[0];
for (int x : arr) {
  if (x > max) max = x;
}
```
- max = **9**.

### Example 3 [4] — Reverse array

Reverse {1, 2, 3, 4, 5} in place.
```java
for (int i = 0; i < arr.length / 2; i++) {
  int temp = arr[i];
  arr[i] = arr[arr.length - 1 - i];
  arr[arr.length - 1 - i] = temp;
}
```
- After: {5, 4, 3, 2, 1}.
- **Note:** loop only to length/2 to avoid swapping back.

### Example 4 [4] — Linear search

Find index of first occurrence of target.
```java
public static int find(int[] arr, int target) {
  for (int i = 0; i < arr.length; i++) {
    if (arr[i] == target) return i;
  }
  return -1;  // not found
}
```

### Example 5 [5] — Count condition

Count elements greater than 10 in array.
```java
int count = 0;
for (int x : arr) {
  if (x > 10) count++;
}
```

## Top Traps & Common Errors

1. **arr.length** is field (no parentheses); s.length() is method.
2. **Off-by-one:** valid indices 0 to length-1.
3. **`for (int x : arr) x = 0;`** doesn't modify array.
4. **Forgetting** to initialize each element when creating array of objects.
5. **Default values** for primitive arrays: 0; for objects: null.
6. **Array immutable size** — can't add/remove (use ArrayList).

## Rubric-Aware Tactics

**For array MCQ:**
- **Trace** through loop tracking values.
- **Check bounds.**

**For array FRQ:**
- **Use `arr.length`** not hard-coded number.
- **Use indexed for** when modifying; for-each otherwise.

## "Phrases That Score" — verbatim language for FRQs

1. "Arrays in Java are zero-indexed with fixed size; `arr.length` (a field, not method) returns the array size. Valid indices range from 0 to `arr.length - 1`; accessing outside throws `ArrayIndexOutOfBoundsException`."
2. "Common array algorithms include traversal (sum, count, min/max), linear search (O(n)), binary search on sorted arrays (O(log n)), swap (using temporary variable), and reverse (loop to length/2 to avoid double-swap)."
3. "The enhanced for loop (`for (int x : arr)`) provides clean traversal but cannot modify array contents through the loop variable. To modify elements, use an indexed for loop with `arr[i]`."
4. "Arrays of objects initialize to null references. To populate, must explicitly create each object: `people[0] = new Person(...);`. Forgetting this leads to `NullPointerException` on access."
5. "Off-by-one errors plague array code: `i < arr.length` runs valid iterations; `i <= arr.length` runs one too many and throws an exception. Always use `< arr.length` for the upper bound."

## If You Do Nothing Else for This Unit

*Master array creation and access. Master arr.length (field, not method). Master common algorithms (sum, count, min/max, search, swap, reverse). Use enhanced for for read-only; indexed for to modify.*

_lastUpdated: 2026-05-04
_sources: College Board AP CSA CED 2024-25, Java AP Subset documentation, Princeton Review AP CSA 2025
_difficulty: foundational
_relatedUnits: ap-computer-science-a-unit-4-iteration, ap-computer-science-a-unit-7-arraylist, ap-computer-science-a-unit-8-2d-array
