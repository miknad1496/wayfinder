# AP Computer Science A — Unit 10: Recursion — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 5–7.5% of the AP Computer Science A exam
- **Sub-topics covered:** recursion concept; base case; recursive case; recursive search algorithms (binary search); merge sort overview; tracing recursion.
- **Where this unit appears on the exam:** Recursive trace problems perennial in MCQ. Recursive method writing in FRQ. Stack overflow understanding.

## Big Ideas

1. **Recursion:** method calls itself.
2. **Base case** stops recursion.
3. **Recursive case** reduces problem and calls method on smaller problem.
4. **Without base case:** infinite recursion → StackOverflowError.
5. **Some problems naturally recursive** (factorials, tree traversal, search).

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Recursion:**
  - **Method calls itself** with different (typically smaller) input.
  - **Each call** added to call stack.
  - **Returns unwind** the stack.
- **Two essential parts:**
  - **Base case:** condition where recursion stops.
  - **Recursive case:** calls method with reduced input.
- **Classic examples:**
  - **Factorial:**
    ```java
    public int factorial(int n) {
      if (n <= 1) return 1;     // base case
      return n * factorial(n - 1);  // recursive case
    }
    ```
    - factorial(4) = 4 * factorial(3) = 4 * 3 * factorial(2) = 4 * 3 * 2 * factorial(1) = 4 * 3 * 2 * 1 = 24.
  - **Sum 1 to n:**
    ```java
    public int sum(int n) {
      if (n <= 0) return 0;
      return n + sum(n - 1);
    }
    ```
  - **Fibonacci:**
    ```java
    public int fib(int n) {
      if (n <= 1) return n;
      return fib(n - 1) + fib(n - 2);
    }
    ```
- **Tracing recursion:**
  - **Track** each call's parameters and return value.
  - **Build call tree** for visualization.
- **Recursive search algorithms:**
  - **Binary search (recursive):**
    ```java
    public int binarySearch(int[] arr, int target, int lo, int hi) {
      if (lo > hi) return -1;          // base case: not found
      int mid = (lo + hi) / 2;
      if (arr[mid] == target) return mid;     // base case: found
      if (target < arr[mid]) return binarySearch(arr, target, lo, mid - 1);
      return binarySearch(arr, target, mid + 1, hi);
    }
    ```
- **Merge sort (overview):**
  - **Divide** array in half.
  - **Recursively sort** each half.
  - **Merge** the sorted halves.
  - **O(n log n)** time complexity.

### Adds for [4]

- **Recursion vs iteration:**
  - **Recursion:** elegant for naturally recursive problems (trees, fractals).
  - **Iteration:** typically more efficient (no call stack overhead).
  - **Java doesn't optimize tail recursion** (unlike some languages).
- **Why base case essential:**
  - **Without base case:** infinite recursion.
  - **Stack overflow** when call stack exceeds limit.
- **Common recursive patterns:**
  - **String reversal:**
    ```java
    public String reverse(String s) {
      if (s.length() <= 1) return s;
      return reverse(s.substring(1)) + s.charAt(0);
    }
    ```
  - **Power:**
    ```java
    public int power(int base, int exp) {
      if (exp == 0) return 1;
      return base * power(base, exp - 1);
    }
    ```
- **Trace technique:**
  - **List each call** with parameters.
  - **Show return** values working back up.
  - **Indent for clarity:**
    ```
    factorial(4)
      factorial(3)
        factorial(2)
          factorial(1) → 1
        → 2 * 1 = 2
      → 3 * 2 = 6
    → 4 * 6 = 24
    ```
- **Recursion on arrays/lists:**
  - **Recurse on smaller array** (e.g., first element + recurse on rest).
  - **Or pass start index** to avoid creating new arrays.

### Adds for [5]

- **Why some problems naturally recursive:**
  - **Tree traversal** (each subtree is a tree).
  - **Divide-and-conquer** (merge sort, quick sort).
  - **Fractals** (each part is similar to whole).
- **Why iteration usually preferred for AP:**
  - **More efficient.**
  - **Easier to understand for simple cases.**
  - **Recursion shines** when problem is naturally recursive.
- **Memoization:**
  - **Cache** recursive results to avoid recomputation.
  - **Naive Fibonacci** is O(2^n) — exponential!
  - **Memoized Fibonacci** is O(n).

## Worked Examples

### Example 1 [3] — Trace recursion

Trace `factorial(4)`.
- factorial(4) = 4 * factorial(3).
- factorial(3) = 3 * factorial(2).
- factorial(2) = 2 * factorial(1).
- factorial(1) = 1 (base case).
- Returns: 1 → 2 → 6 → **24**.

### Example 2 [3] — Sum to n

```java
public int sum(int n) {
  if (n <= 0) return 0;
  return n + sum(n - 1);
}
```
- sum(3) = 3 + sum(2) = 3 + 2 + sum(1) = 3 + 2 + 1 + sum(0) = 3 + 2 + 1 + 0 = **6**.

### Example 3 [4] — String reversal

```java
public String reverse(String s) {
  if (s.length() <= 1) return s;
  return reverse(s.substring(1)) + s.charAt(0);
}
```
- reverse("abc"):
  - = reverse("bc") + 'a'.
  - = (reverse("c") + 'b') + 'a'.
  - = ("c" + 'b') + 'a'.
  - = "cb" + 'a'.
  - = **"cba"**.

### Example 4 [4] — Binary search

Find 7 in [1, 3, 5, 7, 9].
- binarySearch(arr, 7, 0, 4):
  - mid = 2; arr[2] = 5 < 7; recurse right.
- binarySearch(arr, 7, 3, 4):
  - mid = 3; arr[3] = 7; **return 3**.

### Example 5 [5] — Fibonacci

```java
public int fib(int n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}
```
- fib(5):
  - = fib(4) + fib(3).
  - = (fib(3) + fib(2)) + (fib(2) + fib(1)).
  - = ((fib(2) + fib(1)) + (fib(1) + fib(0))) + ((fib(1) + fib(0)) + 1).
  - = ((1 + 0 + 1) + (1 + 0)) + ((1 + 0) + 1) = (2 + 1) + (1 + 1) = 3 + 2 = **5**.
- **Naive Fibonacci** recomputes — exponential time.

## Top Traps & Common Errors

1. **Missing base case** → infinite recursion → StackOverflowError.
2. **Base case never reached** (recursive call doesn't reduce input).
3. **Wrong recursive call** (subtract or divide wrong).
4. **Tracing errors** — write each call out.
5. **Naive Fibonacci** is O(2^n); use iteration or memoization.

## Rubric-Aware Tactics

**For recursion FRQ:**
- **Identify base case clearly.**
- **Reduce input in recursive call.**
- **Trace** with example to verify.

**For tracing MCQ:**
- **List each call** with parameters.
- **Work back up** with returns.

## "Phrases That Score" — verbatim language for FRQs

1. "A recursive method calls itself with reduced input. Every recursive method must have a base case (terminating condition) and a recursive case (call with reduced input). Without a base case, recursion never terminates and causes a `StackOverflowError`."
2. "Factorial illustrates recursion: `factorial(n) = n * factorial(n-1)` with base case `factorial(0) = 1`. Each call is added to the call stack and unwinds when base case returns."
3. "Recursive binary search halves the search space at each call: if target equals `arr[mid]`, return mid; if target less than `arr[mid]`, recurse on left half; otherwise recurse on right half. Base cases: lo > hi (not found) or value found."
4. "Merge sort divides the array in half, recursively sorts each half, and merges the sorted halves — O(n log n) time complexity."
5. "Naive recursive Fibonacci is O(2^n) due to repeated subproblem computation. Memoization (caching results) reduces this to O(n); iteration also achieves O(n) with constant additional space."

## If You Do Nothing Else for This Unit

*Master base case + recursive case structure. Master tracing recursion. Master classic examples (factorial, sum, Fibonacci, string reversal). Master recursive binary search. Avoid infinite recursion (always reduce input).*

_lastUpdated: 2026-05-04
_sources: College Board AP CSA CED 2024-25, Java AP Subset documentation, Princeton Review AP CSA 2025
_difficulty: intermediate
_relatedUnits: ap-computer-science-a-unit-4-iteration, ap-computer-science-a-unit-6-array
