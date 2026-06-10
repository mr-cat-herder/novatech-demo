import './setup.js';
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
