# AP Computer Science A — Unit 1: Primitive Types — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 2.5–5% of the AP Computer Science A exam
- **Sub-topics covered:** Java basics; primitive data types (int, double, boolean); variables and assignment; expressions; casting; integer division.
- **Where this unit appears on the exam:** Foundation for everything. Integer division, casting, and operator precedence are common multiple-choice traps.

## Big Ideas

1. **Java is statically typed** — variable types declared.
2. **Primitive types** are the basic building blocks (int, double, boolean, char).
3. **Integer division truncates** — 7/2 = 3, NOT 3.5.
4. **Casting** changes types explicitly.
5. **Operator precedence** matters — multiplication before addition, etc.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Primitive data types in Java (AP subset):**
  - **int:** integer (whole numbers, ~−2 billion to ~2 billion).
  - **double:** decimal (floating-point) numbers.
  - **boolean:** true or false.
  - **(char and others not on AP exam.)**
- **Variable declaration and assignment:**
  - `int x;` declares.
  - `int x = 5;` declares and initializes.
  - `x = 10;` reassigns.
  - **Variables MUST be declared** before use.
- **Naming conventions:**
  - **camelCase** for variables: `studentCount`, `firstName`.
  - **Cannot start with digit.**
  - **Cannot use Java keywords** (int, class, public, etc.).
  - **Case-sensitive** (myVar ≠ MyVar).
- **Arithmetic operators:**
  - **+** (addition), **-** (subtraction), * (multiplication), **/** (division), **%** (modulo).
  - **Operator precedence:** *, /, % before +, -.
  - **Parentheses** override precedence.
- **Integer division:**
  - **int / int = int (truncated, not rounded).**
  - **7 / 2 = 3** (NOT 3.5).
  - **-7 / 2 = -3** (truncated toward zero).
  - **At least one operand must be double for decimal result:** `7.0 / 2 = 3.5`.
- **Modulo (%):**
  - Returns remainder.
  - **7 % 2 = 1** (7 divided by 2 = 3 remainder 1).
  - **10 % 5 = 0** (10 divided by 5 = 2 remainder 0).
  - Useful for **even/odd checks** (n % 2 == 0 means even).
- **Compound assignment operators:**
  - **x += 5** same as **x = x + 5**.
  - Also: -=, *=, /=, %=.
- **Increment/decrement:**
  - **x++** same as **x = x + 1** (post-increment).
  - **++x** pre-increment.
  - **x--** decrement.
- **Casting:**
  - **(int) 3.7** = 3 (truncates).
  - **(double) 5** = 5.0.
  - **Implicit casting:** int → double automatic.
  - **Explicit casting:** double → int requires (int) cast.
- **Output:**
  - `System.out.println("text");` prints with newline.
  - `System.out.print("text");` prints without newline.
- **Input:** (rarely tested on AP exam at primitive level).
- **Comments:**
  - `// single line comment`
  - `/* multi-line comment */`

### Adds for [4]

- **Why integer division matters:**
  - **Common bug:** expecting 3.5 from 7/2.
  - **For decimal result:** cast or use double literal.
  - **Average of two ints:** `(a + b) / 2.0` (force double).
- **Operator precedence detail:**
  - **Highest:** parentheses, increment/decrement, casts.
  - **Then:** *, /, %.
  - **Then:** +, -.
  - **When equal precedence:** evaluate left-to-right.
- **Type promotion:**
  - **int + double = double.**
  - **Java promotes** to wider type to avoid info loss.
- **Why double inexact:**
  - **Floating-point representation** can't exactly represent some decimals.
  - **0.1 + 0.2 ≠ 0.3** exactly (it's ~0.30000000000000004).
  - **Don't use ==** for double comparison; use range.

### Adds for [5]

- **Why static typing.**
  - **Compiler catches type errors** before runtime.
  - **Trade-off:** more verbose than dynamically typed (Python).
  - **Strong typing** essential for large-scale software.
- **Why primitives.**
  - **Stored directly** (not via reference).
  - **Fast.**
  - **Limited size.**

## Worked Examples

### Example 1 [3] — Trace primitive operations

```java
int a = 7;
int b = 2;
int c = a / b;
double d = a / b;
double e = (double) a / b;
double f = a / 2.0;
```
- c = **3** (integer division).
- d = **3.0** (a/b computed as int 3, then assigned to double).
- e = **3.5** (a cast to double, double division).
- f = **3.5** (2.0 forces double division).

### Example 2 [3] — Modulo

```java
int x = 17;
int rem3 = x % 3;
int rem5 = x % 5;
```
- rem3 = **2** (17 = 3·5 + 2).
- rem5 = **2** (17 = 5·3 + 2).

### Example 3 [4] — Casting trap

```java
double d = 3.7;
int i = (int) d;
int j = (int) (d + 0.5);
```
- i = **3** (truncates toward zero).
- j = **4** (3.7 + 0.5 = 4.2, then cast to 4 — this is "rounding by adding 0.5 then truncating").

### Example 4 [4] — Operator precedence

What does `2 + 3 * 4 - 5` evaluate to?
- **Multiplication first:** 3*4 = 12.
- **Then left-to-right:** 2 + 12 - 5 = **9**.

### Example 5 [5] — Compound assignment

```java
int x = 10;
x += 5;
x *= 2;
x %= 7;
```
- After x += 5: x = **15**.
- After x *= 2: x = **30**.
- After x %= 7: x = **2** (30 / 7 = 4 remainder 2).

## Top Traps & Common Errors

1. **Integer division.** 7/2 = 3, NOT 3.5. Cast to double or use double literal for decimal.
2. **Casting double to int truncates,** doesn't round. (int) 3.9 = 3.
3. **Operator precedence.** *, /, % before +, -.
4. **Using == for double equality.** Floating-point inexactness; use range or epsilon.
5. **Modulo with negatives.** -7 % 2 = -1 (not 1) in Java.
6. **Forgetting variable declaration.** Java requires declared types.

## Rubric-Aware Tactics

**For MCQ:**
- **Trace step-by-step,** showing variable values.
- **Watch for integer division.**
- **Watch for casting.**

**For FRQ:**
- **Declare variable types correctly.**
- **Use parentheses** for clarity.

## "Phrases That Score" — verbatim language for FRQs (Java code in mind)

1. "In Java, integer division truncates: `7 / 2` evaluates to `3`, not `3.5`. To produce a decimal result, at least one operand must be a `double`: `7 / 2.0` or `(double) 7 / 2`."
2. "The modulo operator `%` returns the remainder of integer division: `17 % 5` is `2` because 17 = 5·3 + 2. Common use: `n % 2 == 0` tests for even."
3. "Casting `(int)` truncates toward zero: `(int) 3.9` is `3`, `(int) -3.9` is `-3`. To round, add 0.5 before casting: `(int) (d + 0.5)`."
4. "Operator precedence in Java follows standard math: `*`, `/`, `%` evaluate before `+`, `-`. Parentheses override precedence; equal-precedence operators evaluate left-to-right."
5. "Comparing doubles with `==` is unsafe due to floating-point representation imprecision; instead, check `Math.abs(a - b) < epsilon` for some small epsilon."

## If You Do Nothing Else for This Unit

*Master integer division (truncates). Master casting (truncates toward zero). Master operator precedence. Master modulo. Variable declaration syntax. Output via System.out.println.*

_lastUpdated: 2026-05-04
_sources: College Board AP CSA CED 2024-25, Java AP Subset documentation, Princeton Review AP CSA 2025, Barron's AP CSA
_difficulty: foundational
_relatedUnits: ap-computer-science-a-unit-2-using-objects, ap-computer-science-a-unit-3-boolean-if
