# Wayfinder Architecture & Push Discipline

**Authored 2026-05-14 as patch 165, after a five-patch debugging spiral
(155-164) where multiple unrelated edits cascaded into production breakages.
Read this before any new patch. The discipline below is what makes pushes
safe again.**

---

## The core principle

> **A change to feature A must have ZERO risk of breaking feature B.**

When that principle holds, you can push with confidence. When it doesn't,
every commit feels like a coin flip. The patches below codify what it takes
to actually hold the line.

---

## The bug classes that bit us (so we don't forget)

| Patch | What broke | Why | Layer that should have caught it |
|---|---|---|---|
| 121 | KO localizer aborted because `MutationObserver.observe(document.body)` ran when body was null | Head-script touched DOM before parse | Layer 2 (JSDOM smoke) |
| 124 | `chatHaikuIntake` referenced `options.intlContext` without `options` in the signature | Undeclared identifier inside fn body | Layer 6 (ESLint no-undef) |
| 125 | Inline `<script>` missing close paren | Syntax error inside inline script | Layer 1 (inline-script syntax) |
| 143 | Footer link to `/privacy.html` had no server route, catchall served SPA with 200 | Link/route drift | Layer 3 (route audit) |
| 148 | `.bat` had em-dashes + arrows + box-drawing chars; cmd silently crashed | Non-ASCII in bat file | Layer 4 (bat ASCII scan) |
| 156 | Tutor topic accepted 800 chars in HTML but backend capped at 200 | Frontend/backend cap drift | Manual audit (no auto-detection yet) |
| 156 | `let _profileLines` placed AFTER its first use in scoreFrq's systemPrompt | TDZ ReferenceError | Layer 5 (backend runtime smoke) |
| 156 | `scope` renamed to `detected` in coachChat, return statement still said `scope` | Undeclared identifier in return | Layer 6 (ESLint no-undef) |
| 156 | `attachments` cap 5 vs 15 vs 100kb global body limit | Bottom-layer body parser ran first | Manual audit (the symptom hid in a generic 500) |
| 160 | `Internal server error` had no diagnostic; took 5 patches to find the cause | Catch block swallowed the error | Always include err.message in 500 responses |
| 161 | Same as 156 attachments — wrong root cause across 4 patches | Skipped validator chain on slow bats | **Always run validate-changes.bat** |
| 164 | Same class as 156's `scope` rename — and Layer 6 was present but soft-passed because ESLint wasn't installed in the path the validator checked | Layer 6 silent | This doc + install ESLint properly |

Every one of these is something a validator either catches today or could
catch with one more line of code. The discipline is what makes the validators
actually run.

---

## The 6-layer pre-push validator chain

`validate-changes.bat` runs all 6 in sequence. **Every `apply-changes-NN.bat`
must call it.** No exceptions, even for "tiny" patches.

| Layer | File | Catches |
|---|---|---|
| 1 | `validate-changes.js` | JS syntax + relative imports + parse5 HTML + inline-script syntax |
| 2 | `validate-runtime.js` | JSDOM head-script crashes on null `document.body`, init-time TypeErrors |
| 3 | `validate-routes.js` | `<a href>` -> server route alignment, catches catchall-serves-wrong-content |
| 4 | `validate-bat.js` | `.bat` ASCII-only scan + NULL byte check |
| 5 | `validate-backend.js` | Backend service runtime smoke — imports + sentinel-invokes each export |
| 6 | `validate-eslint.js` | ESLint `no-undef` + `no-use-before-define` on `.js` / `.mjs` / `.cjs` args |

Layers 1, 3, 4 always run. Layer 2 runs when HTML is in args. Layer 5 runs when
`backend/services/` is in args. Layer 6 runs when any JS is in args.

If any layer fails, the push aborts.

---

## The push discipline (mandatory for every patch going forward)

### Rule 1: every `apply-changes-NN.bat` MUST call `validate-changes.bat`

The bat template at the bottom of this doc is the canonical form. Never write
an apply script that skips validation, no matter how confident you are.

**This rule was violated for patches 156 and 164.** Both bats skipped the
validator chain because earlier validator layers were slow on app.js (9.8K
lines through JSDOM took 60+ seconds on Windows). The fix is to make the
slow layers fast, NOT to skip them. See "performance" below.

### Rule 2: every patch markers must be present and findstr-checked

Each touched file gets a `PATCHNN <THEME>` marker in a comment. The bat then
`findstr`-checks each marker before commit. This catches the "I edited the
wrong file" class of mistake and makes the patch surface visible in git blame.

### Rule 3: never include err.message-less catches in production code

If a route's outer catch returns "Internal server error" with no details, you
will spend hours guessing what broke. Always include at minimum `err.message`
and `err.name` in 500 responses. Stack traces in dev only; message + name in
prod is safe and worth the visibility.

### Rule 4: bottom-layer limits beat per-route overrides

Express middleware runs in mount order. If `app.use(express.json({limit: '100kb'}))`
is global, no per-route `express.json({limit: '80mb'})` will EVER fire for
oversized requests — body-parser already errored. Mount per-route raised
limits BEFORE the global. This is the patch 161 lesson.

### Rule 5: install Layer 6 once, then it just works

Layer 6 (ESLint) requires the package to be installed. Run once in a fresh
checkout:

```
npm install eslint --no-save --prefix wayfinder/frontend
```

It's already installed in this workspace. Do not skip it on future setup.

---

## Anti-patterns that crashed prod (named so we never repeat them)

### The "rename half" anti-pattern (patch 156 + 164)

Renaming a variable in one place but missing its other references. ESLint
`no-undef` catches this if Layer 6 is enabled. Always run Layer 6 after
renaming anything.

### The "let after use" anti-pattern (patch 156's TDZ)

Declaring `let foo = ...` AFTER something that already references `foo`. The
reference hits TDZ and throws ReferenceError. Layer 5 + Layer 6 both catch
this. Always declare locals at the top of the function.

### The "swallowed error" anti-pattern (patch 160's diagnostic)

A try/catch that returns `{success: false, error: 'generic'}` without including
the actual exception message. Hours of guessing follow. Always include
`err.message` (and ideally `err.name` + first 4 stack lines) in returned errors.

### The "global limit overrides per-route" anti-pattern (patch 161)

Adding `router.post('/foo', expressJson({limit: 'Xmb'}), handler)` does not
help if `app.use(express.json({limit: '100kb'}))` runs first. Mount the per-route
parser BEFORE the global one in server.js.

### The "skip the validator because it's slow" anti-pattern (patches 156, 164)

When a layer takes 60s, you start writing simpler bats that skip it. The next
bug ships. The fix is to make the slow layer fast (or move it to async/parallel),
NOT to skip it. The slow layer was caught critical bugs in the past.

### The "edit by Edit tool truncates the file" anti-pattern (recurring)

The Edit tool sometimes silently drops trailing lines on CRLF files. Always
`tail -3` the edited file and re-validate after every edit. When in doubt,
use Write or bash sed/python with explicit content.

---

## When you DO touch a previously-working function

You're about to edit a working function and you're scared. Here's the checklist:

1. **Read the FULL function first.** Don't just look at the section you're editing.
   Note every variable used in the return statement; those are the hostages of
   any rename you do.

2. **If you rename anything, grep for all references** before you save:
   ```
   grep -rn "oldname" backend/ frontend/
   ```
   ESLint `no-undef` will catch most cases but not all (e.g. property accesses
   on objects).

3. **Declare any new local variable at the TOP of the function**, before its
   first use. Never let-after-use. Layer 6's `no-use-before-define` rule
   enforces this for explicit declarations; it won't catch dynamic `eval`
   weirdness but we don't do that.

4. **After your edit, run all 6 layers locally** via `validate-changes.bat`
   (or the equivalent node commands directly) BEFORE committing.

5. **Watch for the 6th-layer ESLint failures** — those are likely renames
   that left dangling references. Fix and re-run.

---

## Canonical apply-changes-NN.bat template

Every new patch bat starts from this. The validator chain is non-negotiable.

```bat
@echo off
REM ----------------------------------------------------------------
REM apply-changes-NN.bat -- Patch NN: <SHORT TITLE>
REM
REM <root cause + fix paragraph>
REM ----------------------------------------------------------------
setlocal
cd /d "%~dp0wayfinder"

echo === Step 1: validate (6 layers) ===
call ..\validate-changes.bat <files...> "%~f0"
if errorlevel 1 ( echo VALIDATION FAILED -- aborting push. & pause & exit /b 1 )

echo === Step 2: confirm markers ===
findstr /c:"PATCHNN <THEME>" <file> >nul
if errorlevel 1 ( echo PATCHNN marker missing in <file>. & pause & exit /b 1 )

echo === Step 3: commit ===
git add <files...>
git commit -m "Patch NN: <short title>"
if errorlevel 1 ( echo Commit failed. & pause & exit /b 1 )

echo === Step 4: pull-rebase ===
git pull --rebase --autostash origin main
if errorlevel 1 ( echo Rebase failed. & pause & exit /b 1 )

echo === Step 5: push ===
git push origin main
if errorlevel 1 ( echo Push failed. & pause & exit /b 1 )

echo === Patch NN pushed. Render redeploy in 1-3 min. ===
git log --oneline -3
endlocal
pause
exit /b 0
```

If `validate-changes.bat` is slow on a particular file (e.g. Layer 2 on the
9.8K-line app.js), the answer is to make Layer 2 faster (smaller smoke test
or async), not to skip it.

---

## Performance: why Layer 2 was slow + the fix path

Layer 2 (JSDOM smoke) was slow on app.js because JSDOM loads the file as HTML
and parses 9.8K lines. The fix is to NOT pass app.js as a Layer 2 arg — Layer 2
only needs to see `frontend/index.html` (the actual entry). All inline JS in
the HTML gets executed during page load; standalone .js files are loaded as
externals which JSDOM stubs.

Update apply-changes bats: pass `frontend/index.html` (for Layer 2) but
specify `frontend/src/app.js` separately for Layers 1 and 6. The current
validate-changes.bat already does this routing internally; just don't pass
app.js to Layer 2 explicitly.

(Future patch: split arg routing so the bat caller doesn't have to think
about which layer wants which file.)

---

## Open improvements (queued but not yet shipped)

- **Layer 7: return-shape contracts.** Each backend service function has a
  `__contracts__/<file>.contract.js` declaring its inputs + expected return
  shape. A validator runs sentinel inputs and asserts the resolved shape.
  Would catch patch 164 even when SDK mocking is hard. Requires writing
  contracts for the AP Coach module's 4 exports + scaffolding the validator.

- **Auto-rollback on health-check failure.** apply-changes-NN.bat tags
  `pre-NNN` before push. After Render redeploys, poll `/api/health` for 90s.
  If unhealthy, auto-revert to the tag. This is already documented in
  CLAUDE.md but not actively enforced.

- **Snapshot fixtures.** For each feature, capture 3-5 real production
  input/output pairs. Diff at push time to catch silent regressions.

- **Module boundaries.** Move each feature (Coach Chat, FRQ Scoring, Tutor)
  into its own folder with explicit exports. Cross-feature imports flagged
  by a new Layer 8. Heavy refactor, deferred.

---

## TL;DR

**Run `validate-changes.bat`. Every time. No exceptions.**

If you find yourself wanting to skip a layer because it's slow or feels
unnecessary, that's the bug. Make the layer fast instead.
