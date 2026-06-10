# Unit Test Coverage Expansion — Design Spec

**Date:** 2026-06-10
**Status:** Approved

## Problem

Existing unit tests in `tests/unit/validation.test.js` test inline copies of the regex patterns rather than importing the exported functions. If `isValidEmail` or `isValidPhone` were changed, the tests would still pass. Additionally, `portfolio-filters.js` has zero test coverage at any level, and the core `validateField`/`validateForm` functions are untested at the unit level.

## Approach

Add `happy-dom` as a devDependency to provide a lightweight DOM environment for the Node built-in test runner. No test framework changes — keep `node:test` and `node:assert`.

## DOM Setup

A shared `tests/unit/setup.js` module instantiates a `happy-dom` Window and assigns its globals (`document`, `window`, `HTMLElement`, etc.) to Node's `global` object. Each test file that requires DOM access imports this module at the top.

## Scope

| Module | Action |
|--------|--------|
| `validation.js` | Rewrite + expand existing test file |
| `portfolio-filters.js` | New test file; export two internal functions |
| `navigation.js` | Skip — fully covered by E2E |
| `contact-form.js` | Skip — fully covered by E2E |

## Code Change Required

`filterProjects` and `updateActiveButton` in `src/js/portfolio-filters.js` must be exported so they can be imported in tests. This follows the same pattern already used by `validateField`/`validateForm` in `validation.js`.

## Test Cases

### `tests/unit/validation.test.js` (rewrite)

**`isValidEmail` / `isValidPhone`**
- Import real exported functions (remove inline regex duplication)
- Valid and invalid cases preserved from existing tests

**`validateField`**
- Required field, empty value → `is-invalid` class, `aria-invalid="true"`, error text set
- Required field, valid value → no `is-invalid` class, `aria-invalid="false"`, error text cleared
- `type="email"`, invalid format → invalid state
- `type="email"`, valid format → valid state
- `type="tel"`, invalid format → invalid state
- `type="tel"`, valid format → valid state
- `minLength` constraint, value too short → invalid state
- `minLength` constraint, value meets minimum → valid state
- `maxLength` constraint, value too long → invalid state
- `maxLength` constraint, value within limit → valid state

**`validateForm`**
- All valid fields → `{ isValid: true, errors: [] }`
- One invalid required field → `{ isValid: false, errors: [{ field, message }] }`
- Multiple invalid fields → errors array contains all failures

### `tests/unit/portfolio-filters.test.js` (new)

**`filterProjects`**
- Filter by specific category → matching cards visible, non-matching cards hidden
- Filter by `'all'` → all cards visible
- Hidden cards have the `hidden` attribute set (removed from tab order)
- Visible cards do not have the `hidden` attribute

**`updateActiveButton`**
- Active class moves from previous button to clicked button
- `aria-pressed="true"` set on clicked button
- `aria-pressed="false"` set on all other buttons

## File Structure After Implementation

```
tests/
  unit/
    setup.js                        ← new: happy-dom global setup
    validation.test.js              ← rewrite
    portfolio-filters.test.js       ← new
```

## Dependencies

```json
"happy-dom": "^12.0.0"
```

Added to `devDependencies` only.
