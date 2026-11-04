import {
  DEFAULT_BLACKLIST_KEYWORDS,
  getSettings,
} from '@/core/storage/settings';

export default defineContentScript({
  matches: [
    '*://*.linkedin.com/jobs/*',
    '*://*.linkedin.com/search/results/content/*',
  ],
  async main() {
    let keywords = DEFAULT_BLACKLIST_KEYWORDS;
    let autoFilterEnabled = true;

    try {
      const settings = await getSettings();
      keywords = settings.blacklistKeywords ?? DEFAULT_BLACKLIST_KEYWORDS;
      autoFilterEnabled = settings.autoFilterEnabled ?? true;
    } catch {
      // fallback to defaults
    }

    if (!autoFilterEnabled) {
      return;
    }

    function filterPosts(root: ParentNode = document) {
      const selectors = [
        '.feed-shared-update-v2',
        '.jobs-search-results__list-item',
        'li.ember-view',
      ];

      const elements = root.querySelectorAll<HTMLElement>(selectors.join(', '));

      for (const el of elements) {
        if (el.dataset.kandidatFiltered) continue;
        const text = el.innerText?.toLowerCase();
        if (!text) continue;

        const isSpam = keywords.some((keyword) =>
          text.includes(keyword.toLowerCase()),
        );
        if (isSpam) {
          el.style.display = 'none';
          el.dataset.kandidatFiltered = 'hidden';
        } else {
          el.dataset.kandidatFiltered = 'clean';
        }
      }
    }

    // Initial filter pass
    filterPosts();

    // Observe dynamic infinite scroll
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          filterPosts();
          break;
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  },
});
