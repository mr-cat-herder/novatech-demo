import './setup.js';
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
