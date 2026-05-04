# AP Computer Science A — Unit 3: Boolean Expressions and If Statements — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 15–17.5% of the AP Computer Science A exam
- **Sub-topics covered:** boolean expressions; relational operators; logical operators (AND, OR, NOT); if/else/else-if; nested conditionals; De Morgan's Laws; short-circuit evaluation.
- **Where this unit appears on the exam:** Largest unit. Conditional logic permeates exam. Short-circuit evaluation common trap. De Morgan's Laws tested.

## Big Ideas

1. **Boolean expressions** evaluate to true or false.
2. **Logical operators:** && (AND), || (OR), ! (NOT).
3. **Short-circuit evaluation** stops evaluating once result determined.
4. **De Morgan's Laws** transform negated compound expressions.
5. **If-else-if chains** handle multiple cases.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Relational operators:**
  - **==** equal to.
  - **!=** not equal to.
  - **<** less than.
  - **>** greater than.
  - **<=** less than or equal to.
  - **>=** greater than or equal to.
  - **Return boolean.**
- **Logical operators:**
  - **&&** AND (both must be true).
  - **||** OR (at least one must be true).
  - **!** NOT (flips).
- **Truth tables:**
  - **AND:** T&&T=T; T&&F=F; F&&T=F; F&&F=F.
  - **OR:** T||T=T; T||F=T; F||T=T; F||F=F.
- **If statement:**
  - ```java
    if (condition) {
      // executes if condition true
    }
    ```
- **If-else:**
  - ```java
    if (condition) {
      // true branch
    } else {
      // false branch
    }
    ```
- **If-else-if:**
  - ```java
    if (cond1) {
      // ...
    } else if (cond2) {
      // ...
    } else {
      // default
    }
    ```
- **Nested if:**
  - **If inside another if.**
  - Becomes complex; can usually be simplified.
- **Short-circuit evaluation:**
  - **&&:** if first is false, second NOT evaluated (overall is false).
  - **||:** if first is true, second NOT evaluated (overall is true).
  - **Important when** second part has side effects or might throw exception.
  - **Example:** `if (x != 0 && 10/x > 2)` — if x is 0, division avoided.
- **De Morgan's Laws:**
  - **!(A && B) = !A || !B**
  - **!(A || B) = !A && !B**
  - **Negate by:** flip operator AND negate each operand.
- **Boolean variables:**
  - **boolean done = false;**
  - **if (done) {...}** — checks if done is true.
  - **if (!done) {...}** — checks if done is false.
  - **No need:** `if (done == true)` is verbose; use `if (done)`.
- **Comparing objects:**
  - **==** compares references for objects.
  - **.equals()** compares content (for Strings, etc.).
- **Common patterns:**
  - **Range check:** `if (x >= 0 && x <= 100)`.
  - **Even check:** `if (n % 2 == 0)`.
  - **Validation:** `if (s != null && s.length() > 0)`.

### Adds for [4]

- **Why short-circuit matters:**
  - **Avoids errors:** `if (x != 0 && y/x > 5)` — division-by-zero avoided if x is 0.
  - **Performance:** doesn't evaluate unnecessary parts.
  - **Order matters:** put cheap/protective check first.
- **De Morgan example:**
  - **Original:** `!(x > 0 && y > 0)` (NOT both positive).
  - **De Morgan:** `x <= 0 || y <= 0` (at least one non-positive).
- **Common compound conditions:**
  - **In range:** `min <= x && x <= max`.
  - **Outside range:** `x < min || x > max`.
  - **Either/or but not both (XOR):** `(a || b) && !(a && b)`.
- **If-else vs ternary:**
  - **Ternary:** `int max = (a > b) ? a : b;`
  - **Compact:** equivalent to `if (a > b) max = a; else max = b;`.
- **Switch (less common in AP):** alternative for multi-way branching on single value.

### Adds for [5]

- **Why nested conditionals problematic:**
  - **Hard to read** with multiple levels.
  - **Often simplifiable** with combined conditions or early returns.
  - **Refactor when** indentation gets deep.
- **Why De Morgan's Laws useful.**
  - **Simplify negated compound conditions.**
  - **Especially for loop conditions** (when do we exit?).

## Worked Examples

### Example 1 [3] — Conditional logic

```java
int x = 5;
if (x > 0) {
  System.out.println("positive");
} else if (x < 0) {
  System.out.println("negative");
} else {
  System.out.println("zero");
}
```
- **Output:** **"positive"** (x = 5 > 0).

### Example 2 [3] — Short-circuit

```java
int x = 0;
if (x != 0 && 10/x > 2) {
  System.out.println("yes");
} else {
  System.out.println("no");
}
```
- **x != 0** is false, so && short-circuits.
- **10/x not evaluated** (which would throw ArithmeticException).
- **Output: "no"**.

### Example 3 [4] — De Morgan's

Negate `(x > 0 && y > 0)` using De Morgan's.
- **!(x > 0 && y > 0)**.
- **= !(x > 0) || !(y > 0)** (De Morgan).
- **= x <= 0 || y <= 0**.
- **Means:** "x is non-positive OR y is non-positive."

### Example 4 [4] — Range check

Write condition: x is in range 1 to 10 inclusive.
- **x >= 1 && x <= 10**.
- Or equivalently: **!(x < 1 || x > 10)**.

### Example 5 [5] — Nested vs flat

Convert nested to flat:
```java
if (x > 0) {
  if (y > 0) {
    System.out.println("both positive");
  }
}
```
becomes:
```java
if (x > 0 && y > 0) {
  System.out.println("both positive");
}
```
- **Equivalent** but flatter; easier to read.

## Top Traps & Common Errors

1. **Confusing = and ==.** = is assignment; == is comparison.
2. **Using == for Strings.** Use .equals() instead.
3. **Forgetting short-circuit.** `if (x != 0 && 10/x > 2)` — if x is 0, second part skipped.
4. **De Morgan errors.** Flip BOTH operator AND operands when negating.
5. **Order of conditions.** Put protective check first: `if (s != null && s.length() > 0)` not reverse (NullPointerException).
6. **Forgetting else.** Multiple separate ifs may not be mutually exclusive.

## Rubric-Aware Tactics

**For MCQ:**
- **Trace through** all possible paths.
- **Check** short-circuit behavior.
- **Apply** De Morgan's to simplify negations.

**For FRQ:**
- **Use compound conditions** instead of nested when possible.
- **Order conditions** for short-circuit safety.

## "Phrases That Score" — verbatim language for FRQs

1. "Java logical operators include `&&` (AND, both must be true), `||` (OR, at least one true), and `!` (NOT, flips). Both `&&` and `||` short-circuit: if `&&`'s left operand is false, the right is not evaluated; if `||`'s left is true, the right is not evaluated."
2. "Short-circuit evaluation enables safe compound checks: `if (x != 0 && 10 / x > 2)` avoids division by zero because the second operand is not evaluated when `x == 0`."
3. "De Morgan's Laws transform negated compound expressions: `!(A && B)` is equivalent to `!A || !B`, and `!(A || B)` is equivalent to `!A && !B` — flip both the operator and each operand."
4. "Range checks combine relational operators with `&&`: `if (x >= 1 && x <= 10)` checks that x is in [1, 10] inclusive. The complement (outside range) is `x < 1 || x > 10`."
5. "Compare object content with `.equals()`, not `==`. Compare primitive values with `==`. The pattern `if (s != null && s.length() > 0)` uses short-circuit to avoid NullPointerException on a null String."

## If You Do Nothing Else for This Unit

*Master &&, ||, !. Master short-circuit evaluation. Master De Morgan's Laws. Master if/else/else-if. Master compound conditions vs nesting. Always use .equals() for String comparison.*

_lastUpdated: 2026-05-04
_sources: College Board AP CSA CED 2024-25, Java AP Subset documentation, Princeton Review AP CSA 2025
_difficulty: foundational
_relatedUnits: ap-computer-science-a-unit-2-using-objects, ap-computer-science-a-unit-4-iteration
