# Unit Test Coverage Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add happy-dom for DOM-based unit testing, fix regex duplication in existing validation tests, and achieve unit-level coverage for `validateField`, `validateForm`, `filterProjects`, and `updateActiveButton`.

**Architecture:** `happy-dom` provides a lightweight DOM by assigning Window globals to Node's `global` scope via a shared setup module imported first in each test file. Import order guarantees globals exist before any source module that touches the DOM is evaluated. `validateField`/`validateForm` are already exported; `filterProjects` and `updateActiveButton` need `export` added in `portfolio-filters.js`.

**Tech Stack:** Node.js built-in test runner (`node:test`, `node:assert`), `happy-dom` for DOM emulation

---

## File Map

| Action | Path |
|--------|------|
| Modify | `package.json` |
| Create | `tests/unit/setup.js` |
| Modify | `tests/unit/validation.test.js` |
| Modify | `src/js/portfolio-filters.js` |
| Create | `tests/unit/portfolio-filters.test.js` |

---

### Task 1: Install happy-dom

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Install the package**

```bash
npm install --save-dev happy-dom
```

- [ ] **Step 2: Verify it loads**

```bash
node --input-type=module --eval "import { Window } from 'happy-dom'; console.log('OK:', typeof Window);"
```

Expected output: `OK: function`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add happy-dom devDependency for DOM unit testing"
```

---

### Task 2: Create DOM setup module

**Files:**
- Create: `tests/unit/setup.js`

Instantiates a single `happy-dom` Window and assigns its globals to Node's `global` object. Test files import this as their first import, before any source module that accesses the DOM.

- [ ] **Step 1: Create tests/unit/setup.js**

```javascript
import { Window } from 'happy-dom';

const happyWindow = new Window();

global.window = happyWindow;
global.document = happyWindow.document;
global.HTMLElement = happyWindow.HTMLElement;
global.HTMLInputElement = happyWindow.HTMLInputElement;
global.HTMLTextAreaElement = happyWindow.HTMLTextAreaElement;
global.HTMLFormElement = happyWindow.HTMLFormElement;
global.Element = happyWindow.Element;
global.Node = happyWindow.Node;
```

- [ ] **Step 2: Verify globals are assigned**

```bash
node --input-type=module --eval "
import './tests/unit/setup.js';
const el = global.document.createElement('input');
el.value = 'hello';
console.log('value:', el.value);
console.log('classList:', typeof el.classList.add);
"
```

Expected:
```
value: hello
classList: function
```

- [ ] **Step 3: Commit**

```bash
git add tests/unit/setup.js
git commit -m "test: add happy-dom global setup module for unit tests"
```

---

### Task 3: Rewrite validation.test.js

Replace the file entirely. The existing tests copy the regex inline — this version imports the real exported functions and adds full coverage for `validateField` and `validateForm`.

**Files:**
- Modify: `tests/unit/validation.test.js`

**What `validateField` reads from the DOM element:**
`field.value`, `field.type`, `field.hasAttribute('required')`, `field.minLength`, `field.maxLength`

**What `validateField` writes to the DOM:**
- `field.classList` — adds/removes `is-invalid`
- `field.setAttribute('aria-invalid', 'true'|'false')`
- `document.getElementById(field.id + '-error').textContent` — sets/clears error message

Both the field and its paired error span must exist in `document.body` before calling `validateField`.

- [ ] **Step 1: Replace tests/unit/validation.test.js with the full file**

```javascript
import '../setup.js';
import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import {
  isValidEmail,
  isValidPhone,
  validateField,
  validateForm,
} from '../../src/js/validation.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeField({
  type = 'text',
  id = 'f',
  required = false,
  minlength,
  maxlength,
  value = '',
} = {}) {
  const field = document.createElement('input');
  field.type = type;
  field.id = id;
  field.value = value;
  if (required) field.setAttribute('required', '');
  if (minlength != null) field.setAttribute('minlength', String(minlength));
  if (maxlength != null) field.setAttribute('maxlength', String(maxlength));

  const errorEl = document.createElement('span');
  errorEl.id = `${id}-error`;

  document.body.appendChild(field);
  document.body.appendChild(errorEl);
  return { field, errorEl };
}

function makeForm(fieldDefs) {
  const form = document.createElement('form');
  fieldDefs.forEach(({ type = 'text', id, required = false, value = '' }) => {
    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.name = id;
    input.value = value;
    if (required) input.setAttribute('required', '');

    const errorEl = document.createElement('span');
    errorEl.id = `${id}-error`;

    form.appendChild(input);
    form.appendChild(errorEl);
  });
  document.body.appendChild(form);
  return form;
}

// ─── isValidEmail ─────────────────────────────────────────────────────────────

describe('isValidEmail', () => {
  it('accepts valid email addresses', () => {
    assert.strictEqual(isValidEmail('test@example.com'), true);
    assert.strictEqual(isValidEmail('user.name@domain.org'), true);
    assert.strictEqual(isValidEmail('user+tag@example.co.uk'), true);
  });

  it('rejects invalid email addresses', () => {
    assert.strictEqual(isValidEmail('invalid'), false);
    assert.strictEqual(isValidEmail('invalid@'), false);
    assert.strictEqual(isValidEmail('@example.com'), false);
    assert.strictEqual(isValidEmail('user @example.com'), false);
    assert.strictEqual(isValidEmail('user@example'), false);
  });
});

// ─── isValidPhone ─────────────────────────────────────────────────────────────

describe('isValidPhone', () => {
  it('accepts valid phone numbers', () => {
    assert.strictEqual(isValidPhone('1234567890'), true);
    assert.strictEqual(isValidPhone('+1 (555) 123-4567'), true);
    assert.strictEqual(isValidPhone('555-123-4567'), true);
    assert.strictEqual(isValidPhone('+44 20 7946 0958'), true);
  });

  it('rejects invalid phone numbers', () => {
    assert.strictEqual(isValidPhone('123'), false);
    assert.strictEqual(isValidPhone('abc'), false);
    assert.strictEqual(isValidPhone('12345'), false);
  });
});

// ─── validateField ────────────────────────────────────────────────────────────

describe('validateField', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  it('returns invalid for empty required field', () => {
    const { field, errorEl } = makeField({ required: true, value: '' });
    const result = validateField(field);
    assert.strictEqual(result.isValid, false);
    assert.ok(field.classList.contains('is-invalid'));
    assert.strictEqual(field.getAttribute('aria-invalid'), 'true');
    assert.ok(errorEl.textContent.length > 0);
  });

  it('returns valid for non-empty required field', () => {
    const { field, errorEl } = makeField({ required: true, value: 'Alice' });
    const result = validateField(field);
    assert.strictEqual(result.isValid, true);
    assert.ok(!field.classList.contains('is-invalid'));
    assert.strictEqual(field.getAttribute('aria-invalid'), 'false');
    assert.strictEqual(errorEl.textContent, '');
  });

  it('returns invalid for malformed email', () => {
    const { field } = makeField({ type: 'email', id: 'email', value: 'notanemail' });
    const result = validateField(field);
    assert.strictEqual(result.isValid, false);
    assert.ok(field.classList.contains('is-invalid'));
  });

  it('returns valid for well-formed email', () => {
    const { field } = makeField({ type: 'email', id: 'email', value: 'user@example.com' });
    const result = validateField(field);
    assert.strictEqual(result.isValid, true);
    assert.ok(!field.classList.contains('is-invalid'));
  });

  it('returns invalid for phone number that is too short', () => {
    const { field } = makeField({ type: 'tel', id: 'phone', value: '123' });
    const result = validateField(field);
    assert.strictEqual(result.isValid, false);
  });

  it('returns valid for well-formed phone number', () => {
    const { field } = makeField({ type: 'tel', id: 'phone', value: '+1 (555) 123-4567' });
    const result = validateField(field);
    assert.strictEqual(result.isValid, true);
  });

  it('returns invalid when value is shorter than minlength', () => {
    const { field } = makeField({ minlength: 10, value: 'hi' });
    const result = validateField(field);
    assert.strictEqual(result.isValid, false);
  });

  it('returns valid when value meets minlength', () => {
    const { field } = makeField({ minlength: 3, value: 'hello' });
    const result = validateField(field);
    assert.strictEqual(result.isValid, true);
  });

  it('returns invalid when value exceeds maxlength', () => {
    const { field } = makeField({ maxlength: 5, value: 'toolongvalue' });
    const result = validateField(field);
    assert.strictEqual(result.isValid, false);
  });

  it('returns valid when value is within maxlength', () => {
    const { field } = makeField({ maxlength: 20, value: 'hello' });
    const result = validateField(field);
    assert.strictEqual(result.isValid, true);
  });
});

// ─── validateForm ─────────────────────────────────────────────────────────────

describe('validateForm', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  it('returns valid when all required fields are filled', () => {
    const form = makeForm([
      { id: 'name', required: true, value: 'Alice' },
      { id: 'email', type: 'email', required: true, value: 'alice@example.com' },
    ]);
    const result = validateForm(form);
    assert.strictEqual(result.isValid, true);
    assert.deepStrictEqual(result.errors, []);
  });

  it('returns invalid when a required field is empty', () => {
    const form = makeForm([
      { id: 'name', required: true, value: '' },
      { id: 'email', type: 'email', required: true, value: 'alice@example.com' },
    ]);
    const result = validateForm(form);
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.errors.length, 1);
    assert.strictEqual(result.errors[0].field, 'name');
  });

  it('collects errors for all invalid fields', () => {
    const form = makeForm([
      { id: 'name', required: true, value: '' },
      { id: 'email', type: 'email', required: true, value: 'bademail' },
    ]);
    const result = validateForm(form);
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.errors.length, 2);
    const fieldNames = result.errors.map((e) => e.field);
    assert.ok(fieldNames.includes('name'));
    assert.ok(fieldNames.includes('email'));
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:unit
```

Expected: all suites pass, no failures.

- [ ] **Step 3: Commit**

```bash
git add tests/unit/validation.test.js
git commit -m "test: rewrite validation tests with real function imports and full DOM coverage"
```

---

### Task 4: Export filterProjects and updateActiveButton

These two functions are private in `portfolio-filters.js`. Adding `export` makes them importable by tests without changing runtime behaviour — the auto-init at the bottom of the file still calls them normally.

**Files:**
- Modify: `src/js/portfolio-filters.js`

- [ ] **Step 1: Export filterProjects**

In `src/js/portfolio-filters.js` change line 21:

```javascript
function filterProjects(category) {
```

to:

```javascript
export function filterProjects(category) {
```

- [ ] **Step 2: Export updateActiveButton**

In `src/js/portfolio-filters.js` change line 39:

```javascript
function updateActiveButton(activeBtn) {
```

to:

```javascript
export function updateActiveButton(activeBtn) {
```

- [ ] **Step 3: Confirm existing unit tests still pass**

```bash
npm run test:unit
```

Expected: no failures.

- [ ] **Step 4: Commit**

```bash
git add src/js/portfolio-filters.js
git commit -m "refactor: export filterProjects and updateActiveButton for unit testability"
```

---

### Task 5: Create portfolio-filters.test.js

**Files:**
- Create: `tests/unit/portfolio-filters.test.js`

**What `filterProjects` does to the DOM:**
- `document.querySelectorAll('.project-card')` — finds all cards
- `card.classList.toggle('is-hidden', !isVisible)` — hides/shows each card
- `card.toggleAttribute('hidden', !isVisible)` — removes card from tab order

**What `updateActiveButton` does to the DOM:**
- `document.querySelectorAll('.filter-btn')` — finds all buttons
- Removes `filter-btn--active` and sets `aria-pressed="false"` on every button
- Adds `filter-btn--active` and sets `aria-pressed="true"` on the active button

Both functions query `document` directly, so elements must be appended to `document.body` before calling them. `afterEach` resets `document.body.innerHTML` between tests to prevent state leaking.

- [ ] **Step 1: Create tests/unit/portfolio-filters.test.js**

```javascript
import '../setup.js';
import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import { filterProjects, updateActiveButton } from '../../src/js/portfolio-filters.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeCards(categories) {
  categories.forEach((cat) => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.dataset.category = cat;
    document.body.appendChild(card);
  });
}

function makeButtons(categories) {
  const allBtn = document.createElement('button');
  allBtn.className = 'filter-btn filter-btn--active';
  allBtn.dataset.filter = 'all';
  allBtn.setAttribute('aria-pressed', 'true');
  document.body.appendChild(allBtn);

  categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.filter = cat;
    btn.setAttribute('aria-pressed', 'false');
    document.body.appendChild(btn);
  });
}

// ─── filterProjects ───────────────────────────────────────────────────────────

describe('filterProjects', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  it('shows only cards matching the filter category', () => {
    makeCards(['web', 'mobile', 'web']);
    filterProjects('web');
    const cards = [...document.querySelectorAll('.project-card')];
    assert.strictEqual(cards[0].classList.contains('is-hidden'), false);
    assert.strictEqual(cards[1].classList.contains('is-hidden'), true);
    assert.strictEqual(cards[2].classList.contains('is-hidden'), false);
  });

  it('shows all cards when category is "all"', () => {
    makeCards(['web', 'mobile', 'cloud']);
    filterProjects('all');
    const cards = [...document.querySelectorAll('.project-card')];
    cards.forEach((card) => {
      assert.strictEqual(card.classList.contains('is-hidden'), false);
      assert.ok(!card.hasAttribute('hidden'));
    });
  });

  it('sets the hidden attribute on filtered-out cards', () => {
    makeCards(['web', 'mobile']);
    filterProjects('mobile');
    const cards = [...document.querySelectorAll('.project-card')];
    assert.ok(cards[0].hasAttribute('hidden'));
    assert.ok(!cards[1].hasAttribute('hidden'));
  });

  it('removes the hidden attribute when a card becomes visible again', () => {
    makeCards(['web', 'mobile']);
    filterProjects('web');
    filterProjects('all');
    const cards = [...document.querySelectorAll('.project-card')];
    cards.forEach((card) => {
      assert.ok(!card.hasAttribute('hidden'));
    });
  });
});

// ─── updateActiveButton ───────────────────────────────────────────────────────

describe('updateActiveButton', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  it('adds active class to the clicked button', () => {
    makeButtons(['web', 'mobile']);
    const webBtn = [...document.querySelectorAll('.filter-btn')].find(
      (b) => b.dataset.filter === 'web'
    );
    updateActiveButton(webBtn);
    assert.ok(webBtn.classList.contains('filter-btn--active'));
  });

  it('removes active class from the previously active button', () => {
    makeButtons(['web', 'mobile']);
    const buttons = [...document.querySelectorAll('.filter-btn')];
    const allBtn = buttons.find((b) => b.dataset.filter === 'all');
    const webBtn = buttons.find((b) => b.dataset.filter === 'web');
    updateActiveButton(webBtn);
    assert.ok(!allBtn.classList.contains('filter-btn--active'));
  });

  it('sets aria-pressed="true" on the active button', () => {
    makeButtons(['web', 'mobile']);
    const webBtn = [...document.querySelectorAll('.filter-btn')].find(
      (b) => b.dataset.filter === 'web'
    );
    updateActiveButton(webBtn);
    assert.strictEqual(webBtn.getAttribute('aria-pressed'), 'true');
  });

  it('sets aria-pressed="false" on all other buttons', () => {
    makeButtons(['web', 'mobile']);
    const buttons = [...document.querySelectorAll('.filter-btn')];
    const webBtn = buttons.find((b) => b.dataset.filter === 'web');
    updateActiveButton(webBtn);
    buttons
      .filter((b) => b !== webBtn)
      .forEach((b) => {
        assert.strictEqual(b.getAttribute('aria-pressed'), 'false');
      });
  });
});
```

- [ ] **Step 2: Run all unit tests**

```bash
npm run test:unit
```

Expected:
```
# tests 25
# suites 6
# pass 25
# fail 0
```

- [ ] **Step 3: Commit**

```bash
git add tests/unit/portfolio-filters.test.js
git commit -m "test: add portfolio filter unit tests with happy-dom DOM emulation"
```
