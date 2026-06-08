/**
 * Portfolio Filters Module
 * Handles project filtering by category
 */

const SELECTORS = {
  filterBtn: '.filter-btn',
  projectCard: '.project-card',
};

const CLASSES = {
  filterBtn: 'filter-btn',
  active: 'filter-btn--active',
  hidden: 'is-hidden',
};

/**
 * Filter projects by category
 * @param {string} category - Category to filter by ('all' shows everything)
 */
function filterProjects(category) {
  const projects = document.querySelectorAll(SELECTORS.projectCard);

  projects.forEach((project) => {
    const projectCategory = project.dataset.category;
    const isVisible = category === 'all' || projectCategory === category;

    project.classList.toggle(CLASSES.hidden, !isVisible);
    // Also toggle the `hidden` attribute so filtered-out cards are removed
    // from the tab order and accessibility tree regardless of CSS.
    project.toggleAttribute('hidden', !isVisible);
  });
}

/**
 * Update active button state
 * @param {HTMLElement} activeBtn - Button to mark as active
 */
function updateActiveButton(activeBtn) {
  const buttons = document.querySelectorAll(SELECTORS.filterBtn);

  buttons.forEach((btn) => {
    btn.classList.remove(CLASSES.active);
    btn.setAttribute('aria-pressed', 'false');
  });

  activeBtn.classList.add(CLASSES.active);
  activeBtn.setAttribute('aria-pressed', 'true');
}

/**
 * Handle filter button click
 * @param {Event} event - Click event
 */
function handleFilterClick(event) {
  const button = event.target;

  if (!button.classList.contains(CLASSES.filterBtn)) {
    return;
  }

  const category = button.dataset.filter;

  updateActiveButton(button);
  filterProjects(category);
}

/**
 * Initialize portfolio filters
 */
export function initPortfolioFilters() {
  const filtersContainer = document.querySelector('.portfolio__filters');

  if (!filtersContainer) {
    return;
  }

  filtersContainer.addEventListener('click', handleFilterClick);
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolioFilters);
} else {
  initPortfolioFilters();
}
