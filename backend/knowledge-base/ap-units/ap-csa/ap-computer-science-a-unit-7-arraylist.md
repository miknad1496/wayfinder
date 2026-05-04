# AP Computer Science A — Unit 7: ArrayList — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 2.5–7.5% of the AP Computer Science A exam
- **Sub-topics covered:** ArrayList class; common methods (add, get, set, remove, size); traversal; iteration with removal pitfalls; ArrayList vs array.
- **Where this unit appears on the exam:** Common alternative to arrays. Removal during iteration is a perennial trap. ArrayList only stores objects (not primitives directly).

## Big Ideas

1. **ArrayList is dynamic-size** alternative to array.
2. **Stores objects only** — primitives autoboxed (int → Integer).
3. **Common methods:** add, get, set, remove, size.
4. **Removal during iteration** requires careful handling (or for-each fails).
5. **Generic typing:** `ArrayList<String>` for type safety.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Import statement:**
  ```java
  import java.util.ArrayList;
  ```
- **Creation:**
  ```java
  ArrayList<String> list = new ArrayList<String>();
  ArrayList<Integer> nums = new ArrayList<Integer>();
  ```
- **Common methods:**
  - **size()** — number of elements (note: size() not length).
  - **add(element)** — appends to end.
  - **add(index, element)** — inserts at index, shifts rest.
  - **get(index)** — returns element at index.
  - **set(index, element)** — replaces element at index, returns old.
  - **remove(index)** — removes and returns element at index, shifts rest.
  - **remove(Object)** — removes first occurrence of object (note: tricky with Integer due to overload).
  - **contains(element)** — true if list contains element.
  - **indexOf(element)** — index of first occurrence (-1 if not found).
  - **isEmpty()** — true if size == 0.
- **Indexed traversal:**
  ```java
  for (int i = 0; i < list.size(); i++) {
    String s = list.get(i);
    // process s
  }
  ```
- **Enhanced for:**
  ```java
  for (String s : list) {
    // process s
  }
  ```
- **ArrayList vs array:**
  - **Array:** fixed size, holds primitives or objects, `arr.length`.
  - **ArrayList:** dynamic size, holds objects only (primitives autoboxed), `list.size()`.
  - **Array faster** for fixed-size; ArrayList more flexible.
- **Autoboxing:**
  - **Java auto-converts** between primitive and wrapper.
  - **`list.add(5)`** automatically boxes 5 to Integer.
  - **`int x = list.get(0)`** automatically unboxes.
- **Generic typing:**
  - **`ArrayList<String>`** ensures only Strings can be added.
  - **Compile-time type safety.**
- **Removal during iteration:**
  - **DANGER:** removing while traversing can cause skipping or ConcurrentModificationException (with for-each).
  - **Indexed approach with care:**
    ```java
    for (int i = list.size() - 1; i >= 0; i--) {
      if (shouldRemove(list.get(i))) list.remove(i);
    }
    ```
  - **Iterating backwards** prevents index shift issues.

### Adds for [4]

- **Why iterate backwards when removing:**
  - **Forward removal** shifts subsequent elements; might skip.
  - **Example:** removing list[1] in [a,b,c,d] leaves [a,c,d]; next iteration index 2 is now 'd', skipping 'c'.
  - **Backward iteration** doesn't disrupt remaining indices.
- **ArrayList vs array tradeoffs:**
  - **Array faster** for indexed access.
  - **ArrayList grows dynamically** — array doesn't.
  - **ArrayList auto-resizes** when capacity exceeded.
- **remove ambiguity with Integer:**
  - **`list.remove(2)` on ArrayList<Integer>** — does this remove index 2, or value 2?
  - **Calls remove(int index)** — removes by index.
  - **`list.remove(Integer.valueOf(2))`** removes by value.
- **List interface (advanced):**
  - **`List<String> list = new ArrayList<String>();`** uses interface type.
  - **More flexible:** could swap implementation.

### Adds for [5]

- **Why ArrayList over array:**
  - **Don't know size in advance** (collect data without counting first).
  - **Frequently add/remove.**
  - **Cleaner methods** (contains, indexOf).
- **When array better:**
  - **Fixed size** known.
  - **Performance critical.**
  - **Storing primitives without boxing overhead.**

## Worked Examples

### Example 1 [3] — Basic operations

```java
ArrayList<String> list = new ArrayList<String>();
list.add("apple");
list.add("banana");
list.add("cherry");
String first = list.get(0);
list.set(1, "blueberry");
list.remove(2);
int size = list.size();
```
- list after: ["apple", "blueberry"].
- first = **"apple"**.
- size = **2**.

### Example 2 [3] — Sum ArrayList

```java
ArrayList<Integer> nums = new ArrayList<Integer>();
nums.add(1);
nums.add(2);
nums.add(3);
int sum = 0;
for (int x : nums) sum += x;
```
- sum = **6**.

### Example 3 [4] — Remove during iteration (BACKWARDS)

Remove all even numbers from ArrayList<Integer>.
```java
for (int i = list.size() - 1; i >= 0; i--) {
  if (list.get(i) % 2 == 0) {
    list.remove(i);
  }
}
```
- **Iterating backwards** prevents index shift issues.

### Example 4 [4] — Forward iteration with care

Alternative: iterate forward but adjust index when removing.
```java
int i = 0;
while (i < list.size()) {
  if (list.get(i) % 2 == 0) {
    list.remove(i);
    // do NOT increment i
  } else {
    i++;
  }
}
```

### Example 5 [5] — ArrayList vs array

When use array vs ArrayList?
- **Array:** size known and fixed; performance critical; storing primitives.
- **ArrayList:** size unknown or changes; need add/remove flexibility; convenience methods.
- **AP exam:** both appear; choose based on problem requirements.

## Top Traps & Common Errors

1. **Mixing size() and length.** Array: arr.length. ArrayList: list.size().
2. **Removing during forward for-each loop.** Throws ConcurrentModificationException.
3. **Removing forward by index.** Skips elements due to index shift; iterate backwards.
4. **`list.remove(2)` on ArrayList<Integer>** — removes index 2, not value 2.
5. **Array doesn't have add/remove methods** — they're ArrayList-specific.
6. **Primitives in ArrayList** — must use wrapper class (Integer, not int).

## Rubric-Aware Tactics

**For ArrayList FRQ:**
- **Use list.size()** not list.length.
- **Use list.get(i)** not list[i].
- **Iterate backwards** when removing.

## "Phrases That Score" — verbatim language for FRQs

1. "ArrayList provides a dynamic-size alternative to arrays, storing objects (primitives are autoboxed). Common methods include `add`, `get`, `set`, `remove`, `size`, `contains`, and `indexOf`."
2. "ArrayList uses `list.size()` (a method) for element count, while arrays use `arr.length` (a field). Both are zero-indexed."
3. "Removing elements during iteration requires care: removing forward by index causes skipping due to index shift; iterating backwards (`for (int i = list.size() - 1; i >= 0; i--)`) avoids this issue."
4. "On `ArrayList<Integer>`, `list.remove(2)` removes the element at INDEX 2, not the value 2. To remove by value, use `list.remove(Integer.valueOf(2))`."
5. "Choose ArrayList for dynamic size, frequent add/remove, and convenience methods. Choose array for fixed size, performance-critical code, and primitive storage without boxing overhead."

## If You Do Nothing Else for This Unit

*Master ArrayList methods (add, get, set, remove, size, contains). Master removal during iteration (iterate backwards). Master ArrayList vs array distinction. Note size() vs length.*

_lastUpdated: 2026-05-04
_sources: College Board AP CSA CED 2024-25, Java AP Subset documentation, Princeton Review AP CSA 2025
_difficulty: foundational
_relatedUnits: ap-computer-science-a-unit-6-array, ap-computer-science-a-unit-8-2d-array
