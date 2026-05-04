# AP Computer Science A — Unit 2: Using Objects — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 5–7.5% of the AP Computer Science A exam
- **Sub-topics covered:** classes, objects, references; constructors; calling methods on objects; the String class; the Math class; void vs return methods.
- **Where this unit appears on the exam:** String operations and Math methods used constantly. Reference vs primitive distinction is a perennial topic. Method calls and dot notation.

## Big Ideas

1. **Objects are instances of classes** — instantiated with `new`.
2. **References vs primitives:** primitives store value; references store memory address.
3. **String is immutable** — operations return new strings.
4. **Math class** has static methods (called on class, not instance).
5. **Methods can return values or be void** (no return).

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Class vs object:**
  - **Class:** blueprint (e.g., `String`, `Scanner`, custom classes).
  - **Object:** instance (e.g., a particular `String "hello"`).
- **Creating objects:**
  - **`new` keyword** + constructor call: `String s = new String("hello");`
  - **String literal shortcut:** `String s = "hello";`
- **Reference vs primitive:**
  - **Primitive:** variable stores value directly.
  - **Reference:** variable stores memory address pointing to object.
- **Calling methods (dot notation):**
  - **`object.methodName(args)`** for instance methods.
  - **`ClassName.methodName(args)`** for static methods.
- **String class (immutable):**
  - **Common methods:**
    - **length()** — number of characters.
    - **substring(start)** — from start to end.
    - **substring(start, end)** — from start (inclusive) to end (exclusive).
    - **indexOf(substring)** — index of first occurrence (-1 if not found).
    - **charAt(index)** — character at index.
    - **toUpperCase() / toLowerCase()** — case change (returns new String).
    - **equals(other)** — content equality.
    - **equalsIgnoreCase(other)** — case-insensitive content equality.
    - **compareTo(other)** — lexicographic comparison (negative if before, 0 if equal, positive if after).
    - **concat(other)** or **+** — concatenation.
  - **Strings are zero-indexed.**
  - **Strings immutable:** `s.toUpperCase()` returns NEW string; doesn't modify s.
- **String comparison:**
  - **==** compares references (whether variables point to same object) — DON'T USE for content.
  - **.equals()** compares content — USE THIS.
- **Math class (static methods):**
  - **Math.abs(x)** — absolute value.
  - **Math.pow(base, exp)** — exponentiation.
  - **Math.sqrt(x)** — square root.
  - **Math.random()** — random double in [0.0, 1.0).
  - **Math.PI** — pi constant.
  - **Math.E** — e constant.
  - **Called on class:** `Math.sqrt(16)`, NOT `(new Math()).sqrt(16)`.
- **Wrapper classes:**
  - **Integer** wraps int; **Double** wraps double.
  - **Autoboxing/unboxing:** Java automatically converts between int and Integer.
  - **`Integer.parseInt("123")`** parses string to int.
  - **`Double.parseDouble("3.14")`** parses string to double.
- **Method types:**
  - **Void method:** no return; performs action.
  - **Return method:** returns value of declared type.
  - **Methods can take parameters.**
- **Constructors:**
  - **Special method** to create object.
  - **Same name as class.**
  - **No return type.**
  - **Called with `new`:** `new ClassName(args)`.
  - **Default constructor:** no parameters; provided automatically if no others defined.
- **Instance methods vs static methods:**
  - **Instance:** called on object: `s.length()`.
  - **Static:** called on class: `Math.abs(-5)`.

### Adds for [4]

- **Why == fails for Strings:**
  - **String literals** may share references (string pool).
  - **`new String()` always** creates new object.
  - **Always use .equals()** for String content comparison.
- **String concatenation:**
  - **+ operator** works for Strings.
  - **String + anything** = String.
  - **`"Number: " + 5`** = `"Number: 5"` (5 converted to "5").
- **Common Math methods:**
  - **Math.abs(-3.5) → 3.5**
  - **Math.pow(2, 3) → 8.0**
  - **Math.sqrt(16) → 4.0**
  - **Math.random() → 0.0 to 0.999...**
  - **(int)(Math.random() * n) → 0 to n-1.**
  - **(int)(Math.random() * (max - min + 1)) + min → min to max.**
- **Random number patterns:**
  - **Random int 1-6 (die roll):** `(int)(Math.random() * 6) + 1`.

### Adds for [5]

- **Why immutability matters.**
  - **Predictable** — String value can't change.
  - **Safe to share** — multiple references can point to same String.
  - **Some performance cost** for frequent modifications (use StringBuilder for that).
- **Why dot notation.**
  - **OOP convention:** "ask object to do something."
  - **Instance methods** access object's data.
  - **Static methods** are class-level utilities.

## Worked Examples

### Example 1 [3] — String methods

```java
String s = "hello world";
int len = s.length();
String sub = s.substring(6);
String upper = s.toUpperCase();
int idx = s.indexOf("world");
char c = s.charAt(0);
```
- len = **11**.
- sub = **"world"** (substring from index 6 to end).
- upper = **"HELLO WORLD"**.
- idx = **6**.
- c = **'h'**.

### Example 2 [3] — String comparison

```java
String a = "hello";
String b = "hello";
String c = new String("hello");
boolean eq1 = (a == b);
boolean eq2 = (a == c);
boolean eq3 = a.equals(c);
```
- eq1 = **true** (string literals may share reference — implementation-dependent but often true).
- eq2 = **false** (`new String` creates separate object; references differ).
- eq3 = **true** (.equals compares content).
- **Always use .equals() for content** — don't rely on ==.

### Example 3 [4] — Math methods

```java
double x = Math.pow(2, 10);
double y = Math.sqrt(144);
int z = Math.abs(-7);
double r = Math.random();
int dieRoll = (int)(Math.random() * 6) + 1;
```
- x = **1024.0**.
- y = **12.0**.
- z = **7**.
- r = some double **0.0 ≤ r < 1.0**.
- dieRoll = some int **1, 2, 3, 4, 5, or 6**.

### Example 4 [4] — Random in range

How to generate random int between 10 and 20 inclusive?
- **Range size:** 20 - 10 + 1 = 11 values.
- **Pattern:** `(int)(Math.random() * 11) + 10`.
- **Verify:** Math.random() ∈ [0, 1), times 11 = [0, 11), cast to int = {0,...,10}, +10 = {10,...,20}.

### Example 5 [5] — String immutability

```java
String s = "hello";
s.toUpperCase();
System.out.println(s);
```
- **Output:** **"hello"** (lowercase!).
- **Why:** `toUpperCase()` returns NEW string; doesn't modify original.
- **To capture:** `s = s.toUpperCase();`

## Top Traps & Common Errors

1. **Using == for String comparison.** Always use .equals(). == compares references, not content.
2. **Forgetting String immutability.** `s.toUpperCase()` returns new string; doesn't modify s.
3. **Wrong substring bounds.** `substring(start, end)`: end is EXCLUSIVE.
4. **Math is class, not object.** Math.sqrt(16), not (new Math()).sqrt(16).
5. **String indexOf returns -1** if not found (not 0).
6. **Random pattern for range.** `(int)(Math.random() * (max - min + 1)) + min`.

## Rubric-Aware Tactics

**For MCQ:**
- **Trace** through string operations carefully.
- **Watch for** == vs .equals().
- **Note** end is exclusive in substring.

**For FRQ:**
- **Use .equals() for String comparison** explicitly.
- **Capture return values** of String methods (immutability).

## "Phrases That Score" — verbatim language for FRQs

1. "Strings in Java are immutable: methods like `toUpperCase()`, `substring()`, and `concat()` return new String objects rather than modifying the original. Always assign the result: `s = s.toUpperCase();`"
2. "String comparison uses `.equals()` for content: `s1 == s2` compares references and may return false even when contents are identical, while `s1.equals(s2)` correctly compares character sequences."
3. "Math class methods are static, called on the class itself: `Math.sqrt(16)`, `Math.pow(2, 3)`, `Math.abs(-5)`, `Math.random()`."
4. "To generate a random integer in range [min, max] inclusive: `(int)(Math.random() * (max - min + 1)) + min`."
5. "The String method `substring(start, end)` returns the substring from index `start` (inclusive) to `end` (exclusive); `s.length()` returns the character count; `s.indexOf(t)` returns the first index of `t` or -1 if not found."

## If You Do Nothing Else for This Unit

*Master String methods (length, substring, indexOf, charAt, toUpperCase, equals). Master == vs .equals() for Strings. Master Math class as static methods. Master random number patterns. Master String immutability.*

_lastUpdated: 2026-05-04
_sources: College Board AP CSA CED 2024-25, Java AP Subset documentation, Princeton Review AP CSA 2025
_difficulty: foundational
_relatedUnits: ap-computer-science-a-unit-1-primitive-types, ap-computer-science-a-unit-3-boolean-if, ap-computer-science-a-unit-5-writing-classes
