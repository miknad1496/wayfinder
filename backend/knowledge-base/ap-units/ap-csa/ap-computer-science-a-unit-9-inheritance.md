# AP Computer Science A — Unit 9: Inheritance — Wayfinder Teaching Brain

> Surfaces in chat when student mentions topics in this unit. Use to ground custom teaching responses + on-demand teaching guide generation.

## Unit at a Glance

- **Exam weight:** 5–10% of the AP Computer Science A exam
- **Sub-topics covered:** subclasses and superclasses; extends; super; method overriding; polymorphism; the Object class; abstract classes; type checking and casting.
- **Where this unit appears on the exam:** Polymorphism and dynamic binding are perennial concepts. Object class methods (toString, equals). Constructor chaining via super. Casting object types.

## Big Ideas

1. **Inheritance:** subclass extends superclass; reuses + extends behavior.
2. **`extends` keyword** establishes inheritance.
3. **`super`** refers to superclass.
4. **Polymorphism:** subclass object can be used where superclass expected.
5. **Method overriding** allows subclass to specialize behavior.

## Tier-Tagged Content

### Foundational [3] — needed for any score

- **Inheritance basics:**
  ```java
  public class Animal {
    private String name;
    public Animal(String name) { this.name = name; }
    public String getName() { return name; }
    public String describe() { return "An animal named " + name; }
  }
  
  public class Dog extends Animal {
    private String breed;
    public Dog(String name, String breed) {
      super(name);  // call superclass constructor
      this.breed = breed;
    }
    public String getBreed() { return breed; }
    @Override
    public String describe() {  // override superclass method
      return "A " + breed + " named " + getName();
    }
  }
  ```
- **`extends` keyword:**
  - **`class Subclass extends Superclass`** establishes "is-a" relationship.
  - **Subclass inherits** all public/protected fields and methods.
- **`super` keyword:**
  - **Superclass constructor:** `super(args)` — must be FIRST line of subclass constructor.
  - **Superclass method:** `super.methodName()` to call overridden method.
- **Method overriding:**
  - **Subclass redefines** method with same signature.
  - **`@Override`** annotation (recommended; not required).
  - **Polymorphic dispatch** at runtime.
- **Polymorphism:**
  - **Superclass reference can hold subclass object:**
    ```java
    Animal a = new Dog("Rex", "Lab");
    a.describe();  // calls Dog's describe (dynamic dispatch)
    ```
  - **Method called depends on actual object type,** not reference type.
- **The Object class:**
  - **Root of all class hierarchies.**
  - **Every class extends Object** (directly or indirectly).
  - **Common methods:**
    - **toString()** — returns String representation.
    - **equals(Object other)** — returns boolean for content equality.
- **Object methods to override:**
  - **toString()** — to customize printing.
  - **equals(Object other)** — to compare content.
- **`instanceof` operator:**
  - **Tests** if object is instance of class.
  - **`if (a instanceof Dog) { ... }`** safely tests before casting.
- **Casting object types:**
  - **Upcast (subclass to superclass):** automatic, safe. `Animal a = new Dog(...);`.
  - **Downcast (superclass to subclass):** explicit, may fail at runtime. `Dog d = (Dog) a;`.
  - **Use instanceof first** to avoid ClassCastException.
- **Abstract classes:**
  - **Cannot be instantiated.**
  - **Can have abstract methods** (no body) that subclasses must implement.
  - **`abstract` keyword.**

### Adds for [4]

- **Constructor chaining with super:**
  - **Subclass constructor MUST call superclass constructor.**
  - **`super(args)` must be FIRST statement.**
  - **If omitted, Java calls** `super()` (no-arg superclass constructor).
- **Why polymorphism powerful:**
  - **Write code in terms of superclass** — works for any subclass.
  - **`List<Animal> animals`** can hold Dogs, Cats, etc.
  - **`for (Animal a : animals) a.describe();`** calls each's describe.
- **Method dispatch:**
  - **Static binding** for non-overridden methods.
  - **Dynamic binding** for overridden methods (chooses subclass version).
- **equals() best practices:**
  - **Override** when you want content equality.
  - **Pattern:**
    ```java
    public boolean equals(Object other) {
      if (!(other instanceof MyClass)) return false;
      MyClass m = (MyClass) other;
      return this.field == m.field;
    }
    ```
- **Inheritance vs composition:**
  - **Inheritance:** "Dog IS-A Animal."
  - **Composition:** "Car HAS-A Engine."
  - **Composition often preferred** for flexibility.

### Adds for [5]

- **Why prefer composition over inheritance (sometimes):**
  - **Inheritance is rigid;** can lock into hierarchy.
  - **Composition flexible.**
  - **"Favor composition over inheritance"** common design principle.
- **Why dynamic dispatch:**
  - **Open/closed principle:** open for extension; closed for modification.
  - **Add new subclasses** without changing existing code.

## Worked Examples

### Example 1 [3] — Define subclass

Define `Cat` extending `Animal`.
```java
public class Cat extends Animal {
  private boolean isIndoor;
  public Cat(String name, boolean isIndoor) {
    super(name);
    this.isIndoor = isIndoor;
  }
  public boolean getIsIndoor() { return isIndoor; }
  @Override
  public String describe() {
    return getName() + " is " + (isIndoor ? "indoor" : "outdoor");
  }
}
```

### Example 2 [3] — Polymorphism

```java
Animal a1 = new Dog("Rex", "Lab");
Animal a2 = new Cat("Whiskers", true);
System.out.println(a1.describe());
System.out.println(a2.describe());
```
- **a1.describe()** calls Dog's describe → "A Lab named Rex".
- **a2.describe()** calls Cat's describe → "Whiskers is indoor".
- **Reference type Animal,** but actual object type determines method call.

### Example 3 [4] — Casting

```java
Animal a = new Dog("Rex", "Lab");
String breed = a.getBreed();  // ERROR: Animal has no getBreed
```
- **Compile error:** Animal class lacks getBreed.
- **Fix with cast:**
  ```java
  if (a instanceof Dog) {
    Dog d = (Dog) a;
    String breed = d.getBreed();
  }
  ```

### Example 4 [4] — Override toString

```java
public class Point {
  private int x, y;
  public Point(int x, int y) { this.x = x; this.y = y; }
  @Override
  public String toString() {
    return "(" + x + ", " + y + ")";
  }
}

Point p = new Point(3, 5);
System.out.println(p);  // Output: (3, 5)
```

### Example 5 [5] — equals override

```java
@Override
public boolean equals(Object other) {
  if (!(other instanceof Point)) return false;
  Point p = (Point) other;
  return this.x == p.x && this.y == p.y;
}
```
- **Pattern:** instanceof check, cast, compare fields.

## Top Traps & Common Errors

1. **Forgetting super() call.** Subclass constructor must call super constructor (Java auto-calls super() if omitted).
2. **Wrong order:** super() must be FIRST in subclass constructor.
3. **Casting without check.** Downcasting can throw ClassCastException; use instanceof.
4. **Confusing reference type and object type.** `Animal a = new Dog(...)`; reference is Animal, object is Dog.
5. **Forgetting @Override.** Not required but catches typos.
6. **Wrong equals signature.** Must be `public boolean equals(Object other)` for proper override.

## Rubric-Aware Tactics

**For inheritance FRQ:**
- **Use extends.**
- **Call super(args)** as first line of constructor.
- **Override methods** as required.
- **Use @Override** annotation.

## "Phrases That Score" — verbatim language for FRQs

1. "Inheritance establishes 'is-a' relationships through `extends`: a subclass inherits the superclass's public fields and methods, can override them to specialize behavior, and adds its own."
2. "Subclass constructors must call a superclass constructor as their FIRST statement using `super(args)`. If omitted, Java implicitly calls `super()` (the no-argument superclass constructor)."
3. "Polymorphism allows a superclass reference to hold a subclass object: `Animal a = new Dog(...);`. Method calls dispatch to the actual object's class — `a.describe()` calls Dog's `describe`, not Animal's."
4. "Use `instanceof` before downcasting to avoid `ClassCastException`: `if (a instanceof Dog) { Dog d = (Dog) a; ... }`. Upcasting (subclass to superclass) is automatic and safe."
5. "Override `toString()` to customize how an object prints (called automatically by `System.out.println`); override `equals(Object other)` for content equality, following the pattern: instanceof check → cast → compare fields."

## If You Do Nothing Else for This Unit

*Master extends, super (constructor + method), method overriding, polymorphism, dynamic dispatch. Master casting (instanceof first). Master Object class methods (toString, equals).*

_lastUpdated: 2026-05-04
_sources: College Board AP CSA CED 2024-25, Java AP Subset documentation, Princeton Review AP CSA 2025
_difficulty: intermediate
_relatedUnits: ap-computer-science-a-unit-2-using-objects, ap-computer-science-a-unit-5-writing-classes
