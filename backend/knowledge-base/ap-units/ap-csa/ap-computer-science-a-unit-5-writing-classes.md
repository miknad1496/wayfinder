# AP Computer Science A — Unit 5: Writing Classes — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 5–7.5% of the AP Computer Science A exam
- **Sub-topics covered:** class structure; instance variables; constructors; accessor (getter) and mutator (setter) methods; method overloading; scope; static variables and methods; this keyword.
- **Where this unit appears on the exam:** FRQ Question 2 (class design) requires this. Encapsulation principles. Constructor chaining via this().

## Big Ideas

1. **Classes encapsulate data and behavior** — instance variables (state) + methods (behavior).
2. **Constructors** initialize object state.
3. **Encapsulation:** make instance variables private; access via methods.
4. **`this`** refers to current object.
5. **Static** members belong to class, not instance.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Class structure:**
  - ```java
    public class ClassName {
      // instance variables (state)
      private int x;
      private String name;
      
      // constructor
      public ClassName(int x, String name) {
        this.x = x;
        this.name = name;
      }
      
      // accessor (getter)
      public int getX() {
        return x;
      }
      
      // mutator (setter)
      public void setX(int newX) {
        x = newX;
      }
      
      // other methods
      public String describe() {
        return name + " has x = " + x;
      }
    }
    ```
- **Instance variables (fields):**
  - **Belong to each object.**
  - **Each object has own copy.**
  - **Conventionally `private`** (encapsulation).
- **Constructors:**
  - **Same name as class.**
  - **No return type.**
  - **Initialize instance variables.**
  - **Default constructor** provided if no constructors defined.
- **Accessor (getter) methods:**
  - **Return value of instance variable.**
  - **Conventionally:** `getX()`, `getName()`.
- **Mutator (setter) methods:**
  - **Modify instance variable.**
  - **Conventionally:** `setX(int newX)`.
  - **`void` return type.**
- **The `this` keyword:**
  - **Refers to current object.**
  - **Used to disambiguate** when parameter has same name as instance variable: `this.x = x;`.
  - **Can call other methods** on this object: `this.method()`.
- **Method overloading:**
  - **Same method name; different parameters.**
  - **Compiler chooses** based on argument types.
  - **Example:** `int abs(int x)` and `double abs(double x)`.
- **Scope:**
  - **Local variables:** declared in method; only accessible there.
  - **Instance variables:** accessible throughout class (and externally if public).
  - **Local hides instance:** if same name, local takes precedence (use `this.` to access instance).
- **Encapsulation:**
  - **Hide implementation;** expose interface.
  - **Private fields + public methods.**
  - **Allows** changing implementation without breaking external code.
- **Static variables and methods:**
  - **Static variable:** belongs to class; shared across all instances.
  - **Static method:** called on class; can't access instance variables.
  - **Example:** `Math.PI`, `Math.sqrt()`.
  - **Counter** of instances often static.
- **Public vs private:**
  - **Public:** accessible anywhere.
  - **Private:** only accessible within class.
  - **Convention:** instance variables private, methods public (unless internal helper).

### Adds for [4]

- **Why encapsulation:**
  - **Maintainability:** change implementation without breaking callers.
  - **Validation:** setter can validate input.
  - **Read-only:** provide getter without setter.
- **Constructor chaining:**
  - **`this(args)`** calls another constructor in same class.
  - **Reduces code duplication.**
  - **Example:**
    ```java
    public Point() {
      this(0, 0);  // calls Point(int, int)
    }
    public Point(int x, int y) {
      this.x = x;
      this.y = y;
    }
    ```
- **toString() method:**
  - **Special method;** returns String representation.
  - **Called automatically** when object printed: `System.out.println(p);`.
  - **Override to customize.**
- **Static example:**
  - **Counter:**
    ```java
    public class Widget {
      private static int totalCount = 0;
      private int id;
      public Widget() {
        totalCount++;
        id = totalCount;
      }
      public static int getTotalCount() {
        return totalCount;
      }
    }
    ```

### Adds for [5]

- **Why object-oriented programming.**
  - **Models real-world entities.**
  - **Reusable** through inheritance, composition.
  - **Manages complexity** through encapsulation.
- **Why immutable classes:**
  - **All fields final** (set in constructor only).
  - **No setters.**
  - **Thread-safe.**
  - **Predictable.**
  - **Example:** Java's String.

## Worked Examples

### Example 1 [3] — Define a class

Write a class `Rectangle` with width, height, area method.
```java
public class Rectangle {
  private double width;
  private double height;
  
  public Rectangle(double width, double height) {
    this.width = width;
    this.height = height;
  }
  
  public double getArea() {
    return width * height;
  }
}
```

### Example 2 [3] — Use class

```java
Rectangle r = new Rectangle(3, 4);
System.out.println(r.getArea());
```
- Output: **12.0**.

### Example 3 [4] — Encapsulation with validation

```java
public void setAge(int age) {
  if (age >= 0) {
    this.age = age;
  }
  // else, ignore (or throw exception)
}
```
- **Validation in setter** prevents invalid state.
- **Caller** can't directly set age field (private).

### Example 4 [4] — Static counter

```java
public class Account {
  private static int totalAccounts = 0;
  private int id;
  private String owner;
  
  public Account(String owner) {
    totalAccounts++;
    this.id = totalAccounts;
    this.owner = owner;
  }
  
  public static int getTotalAccounts() {
    return totalAccounts;
  }
}
```
- **`new Account("Alice")`** increments totalAccounts to 1, id = 1.
- **`new Account("Bob")`** increments to 2, id = 2.
- **`Account.getTotalAccounts()`** returns 2.

### Example 5 [5] — toString

```java
public class Point {
  private int x, y;
  public Point(int x, int y) { this.x = x; this.y = y; }
  
  public String toString() {
    return "(" + x + ", " + y + ")";
  }
}

Point p = new Point(3, 5);
System.out.println(p);  // Output: (3, 5)
```
- **toString() called automatically** by println.

## Top Traps & Common Errors

1. **Forgetting `this`** when parameter name matches field name.
2. **Returning wrong type** from method.
3. **Using static** when instance method needed (or vice versa).
4. **Public fields** (use private + accessors).
5. **Forgetting return type** in constructor (it has none).
6. **Calling instance method from static** without object.

## Rubric-Aware Tactics

**For class design FRQ:**
- **Declare instance variables private.**
- **Provide constructor** initializing all fields.
- **Provide accessors** for needed state.
- **Provide mutators** if state can change externally.
- **Implement requested methods.**

## "Phrases That Score" — verbatim language for FRQs

1. "Classes encapsulate state (private instance variables) and behavior (public methods). Constructors initialize state; accessor methods (getters) expose state; mutator methods (setters) modify state with optional validation."
2. "The `this` keyword refers to the current object. It is required to distinguish a field from a parameter of the same name: `this.x = x;` assigns the parameter `x` to the field `x`."
3. "Static variables and methods belong to the class itself, not individual instances; static members are shared across all instances and accessed via the class name (e.g., `Math.PI`)."
4. "Encapsulation makes implementation details private and exposes a public interface. Private fields with public accessor and mutator methods allow internal changes without breaking external code, and enable validation in setters."
5. "Constructor chaining via `this(args)` allows one constructor to call another, reducing code duplication when multiple constructors initialize state in similar ways."

## If You Do Nothing Else for This Unit

*Master class structure (instance variables, constructor, methods). Master encapsulation (private fields + public accessors/mutators). Master `this`. Master static vs instance. Be ready for class design FRQ.*

_lastUpdated: 2026-05-04
_sources: College Board AP CSA CED 2024-25, Java AP Subset documentation, Princeton Review AP CSA 2025
_difficulty: foundational
_relatedUnits: ap-computer-science-a-unit-2-using-objects, ap-computer-science-a-unit-9-inheritance
