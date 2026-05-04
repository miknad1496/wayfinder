# AP Computer Science Principles — Big Idea 3: Algorithms and Programming — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this Big Idea. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 30–35% of the AP CSP exam (LARGEST Big Idea)
- **Sub-topics covered:** variables; data types; operators; expressions; conditionals; iteration; lists; procedures (functions); algorithms; algorithm efficiency; undecidable problems.
- **Where this Big Idea appears on the exam:** AP-pseudocode (College Board's reference language) MUST be mastered. Tracing pseudocode is a perennial test format. Concepts of efficiency (linear vs binary search; reasonable vs unreasonable). One-indexing in AP-pseudocode!

## Big Ideas

1. **Variables, expressions, conditionals, iteration, lists, procedures** are programming building blocks.
2. **AP-pseudocode is one-indexed** (lists start at 1, NOT 0).
3. **Algorithms are sequences of steps** that solve problems.
4. **Efficiency matters:** linear (slow) vs binary (fast) search.
5. **Some problems are undecidable** (no algorithm can solve in general).

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Variables and assignment:**
  - **Variable:** named storage for value.
  - **Assignment:** `x ← 5` (AP-pseudocode uses left arrow).
  - **Variables can be reassigned.**
- **Data types:**
  - **Numbers** (integers, decimals).
  - **Strings** (text, in quotes).
  - **Booleans** (true/false).
  - **Lists** (ordered collections).
- **Operators:**
  - **Arithmetic:** `+`, `−`, `*`, `/`, `MOD` (modulo, remainder).
  - **Relational:** `=`, `≠`, `>`, `<`, `≥`, `≤`.
  - **Logical:** `AND`, `OR`, `NOT`.
- **Expressions:**
  - Combine values, variables, operators to compute new value.
  - **Order of operations** (PEMDAS).
- **Conditionals (selection):**
  - **IF (condition) { ... }** runs if true.
  - **IF (condition) { ... } ELSE { ... }** branches.
  - **Nested conditionals** for multiple cases.
- **Iteration (loops):**
  - **REPEAT n TIMES { ... }** — fixed count.
  - **REPEAT UNTIL (condition) { ... }** — loop until condition true.
  - Modern code uses **for** and **while** loops.
- **Lists in AP-pseudocode:**
  - `aList ← [10, 20, 30, 40]`
  - **One-indexed!** `aList[1]` = 10. (NOT zero-indexed.)
  - `LENGTH(aList)` = 4.
  - `APPEND(aList, value)` adds to end.
  - `INSERT(aList, i, value)` inserts at position.
  - `REMOVE(aList, i)` removes element.
- **Procedures (functions):**
  - `PROCEDURE name(parameters) { ... return value }`.
  - **Parameters** are inputs.
  - **Return value** is output.
  - **Reusability:** define once, call many times.
  - **Abstraction:** hide implementation details.
- **Algorithms:**
  - **Sequence:** steps in order.
  - **Selection:** branching with conditionals.
  - **Iteration:** repetition with loops.
- **Common algorithms:**
  - **Linear search:** check each element until found. **O(n).**
  - **Binary search:** halve sorted list each step. **O(log n)** — much faster.
  - **Sorting:** various algorithms (selection, insertion, merge, quick).
- **Algorithm efficiency:**
  - **Reasonable time:** polynomial (n, n², n³). Solvable in practice.
  - **Unreasonable time:** exponential (2^n, n!) for large n. Intractable.
  - **Heuristic:** approximate solution that's "good enough."
- **Undecidable problems:**
  - **Some problems have no algorithm** that solves all inputs.
  - **Halting problem (Turing):** can't determine in general if a program halts.
- **Random:**
  - `RANDOM(a, b)` returns random integer between a and b inclusive.
  - Used for simulations, games.
- **Substring/string operations:**
  - `SUBSTRING(str, start, end)` extracts portion.
  - `CONCAT(a, b)` joins strings.

### Adds for [4]

- **Tracing pseudocode:**
  - **Walk through line by line**, tracking variable values.
  - **Show table** of variable values after each step.
  - Critical exam skill.
- **Boolean logic:**
  - **AND:** both must be true.
  - **OR:** at least one true.
  - **NOT:** flips.
  - **Truth tables.**
- **Nested loops:**
  - Loop inside loop.
  - **2D iteration:** rows and columns of grids.
- **Linear vs binary search efficiency:**
  - **Linear:** at worst checks all n items. n=1,000,000 → 1,000,000 checks.
  - **Binary (sorted):** halves each time. n=1,000,000 → ~20 checks.
  - Binary requires sorted data; linear doesn't.
- **Procedure abstraction benefits:**
  - **Reusability:** call many times.
  - **Readability:** name describes intent.
  - **Maintainability:** change in one place.
  - **Testability:** test procedure in isolation.
- **APIs (Application Programming Interfaces):**
  - Pre-built procedures from libraries.
  - Allow building on others' work.
  - **Examples:** Google Maps API, weather API, payment APIs.

### Adds for [5]

- **Why algorithm efficiency matters.**
  - **Big data** = need fast algorithms.
  - **Linear search on billion items: too slow.**
  - **Binary search ~30 steps** — feasible.
  - Choice of algorithm has dramatic impact at scale.
- **Why undecidability matters.**
  - **Limits of computation.**
  - **Halting problem** has practical implications (can't always tell if program will infinite-loop).
  - **NP-complete problems** likely require exponential time (open question).
- **Why abstraction matters.**
  - **Manage complexity.**
  - Modern software built layers of abstraction.

## Worked Examples

### Example 1 [3] — Trace pseudocode

```
x ← 5
y ← 10
z ← x + y
DISPLAY(z)
```
- **z = 15**, displays 15.

### Example 2 [3] — Conditional

```
x ← 10
IF (x > 5) {
  DISPLAY("big")
} ELSE {
  DISPLAY("small")
}
```
- **x > 5 is true**, displays "big".

### Example 3 [3] — List indexing (AP-pseudocode)

```
aList ← [10, 20, 30, 40]
DISPLAY(aList[2])
```
- **AP-pseudocode is 1-indexed!**
- aList[1] = 10, aList[2] = **20**.
- Displays 20.

### Example 4 [4] — Loop trace

```
sum ← 0
REPEAT 4 TIMES {
  sum ← sum + 1
}
```
- After loop: sum = **4**.

### Example 5 [4] — Linear vs binary search

You have a sorted list of 1,024 items. How many comparisons (worst case) for each?
- **Linear search:** up to **1,024** comparisons.
- **Binary search:** **log₂(1024) = 10** comparisons.
- **Binary much faster** (but requires sorted data).

### Example 6 [5] — Reasonable vs unreasonable

For each algorithm time complexity, classify reasonable or unreasonable:
(a) O(n).
(b) O(n²).
(c) O(2^n).
(d) O(n!).

- (a) **Reasonable** (linear).
- (b) **Reasonable** (polynomial).
- (c) **Unreasonable** (exponential).
- (d) **Unreasonable** (factorial — even worse).

## Top Traps & Common Errors

1. **Wrong list indexing.** AP-pseudocode is **1-indexed** (NOT 0-indexed like Python/Java).
2. **Confusing assignment and equality.** `←` for assignment; `=` for equality test.
3. **Off-by-one errors in loops.** REPEAT 4 TIMES executes exactly 4 times, not 3 or 5.
4. **Confusing AND/OR.** AND: both true. OR: at least one true.
5. **Confusing efficiency classes.** Linear (n), polynomial (n², n³) reasonable. Exponential (2^n) unreasonable.
6. **Forgetting binary search needs sorted data.** Linear works on unsorted; binary doesn't.

## Rubric-Aware Tactics

**For pseudocode tracing:**
- Walk through line by line.
- Show variable values after each step.
- Remember 1-indexing.

**For algorithm comparison:**
- Identify time complexity.
- Compare with concrete numbers.
- Note constraints (binary search needs sorted).

**For Create PT:**
- Define a procedure with parameter and return value.
- Show iteration (loop).
- Show selection (conditional).
- Show list/data manipulation.

## "Phrases That Score" — verbatim language for FRQs

1. "Programs are built from variables, expressions, conditionals (selection), iteration (loops), lists, and procedures (functions). AP-pseudocode lists are ONE-INDEXED — aList[1] is the first element."
2. "Procedures (functions) abstract behavior into a named, reusable unit with parameters (inputs) and return values (outputs) — improving reusability, readability, maintainability, and testability."
3. "Linear search examines each element sequentially in O(n) time. Binary search halves a SORTED list at each step in O(log n) time — dramatically faster for large datasets (1,024 items: 1,024 vs 10 comparisons)."
4. "Algorithm efficiency matters: polynomial-time algorithms (n, n², n³) are 'reasonable' and feasible at scale; exponential-time algorithms (2^n, n!) are 'unreasonable' for large inputs."
5. "Some problems are undecidable: the halting problem (Turing) shows no algorithm can determine in general whether an arbitrary program will halt."

## If You Do Nothing Else for This Big Idea

*Master AP-pseudocode (especially 1-indexed lists). Master tracing through code. Master conditional, loops, procedures. Master linear vs binary search. Master reasonable vs unreasonable algorithms.*

_lastUpdated: 2026-05-04
_sources: College Board AP CSP CED 2024-25, AP CSP Reference Sheet (AP-pseudocode), Barron's AP CSP, Princeton Review AP CSP 2025
_difficulty: foundational
_relatedUnits: ap-csp-big-idea-1-creative-development, ap-csp-big-idea-2-data, ap-csp-big-idea-4-computer-systems-networks
