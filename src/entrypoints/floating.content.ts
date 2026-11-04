import { fillApplication } from '@/core/ats';
import { getProfile } from '@/core/storage/storage';

export const AUTO_FILL_MESSAGE = 'AUTO_FILL';

export const FLOATING_HOST_ID = 'kandidat-floating-root';

export const ATS_MATCHES = [
  '*://*.lever.co/*',
  '*://*.greenhouse.io/*',
  '*://*.myworkdayjobs.com/*',
  '*://*.myworkdaysite.com/*',
  '*://*.workday.com/*',
];

const BUTTON_STYLES = `
  :host {
    all: initial;
    position: fixed !important;
    right: 24px !important;
    bottom: 24px !important;
    z-index: 2147483647 !important;
    display: block !important;
    isolation: isolate !important;
  }

  button {
    all: unset;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 20px;
    border-radius: 9999px;
    background: #111827;
    color: #ffffff;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      sans-serif;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
    box-shadow:
      0 10px 25px rgba(0, 0, 0, 0.25),
      0 2px 6px rgba(0, 0, 0, 0.15);
    transition:
      background-color 150ms ease,
      transform 150ms ease,
      box-shadow 150ms ease;
  }

  button:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow:
      0 12px 30px rgba(0, 0, 0, 0.3),
      0 3px 8px rgba(0, 0, 0, 0.18);
  }

  button:focus-visible {
    outline: 3px solid #93c5fd;
    outline-offset: 2px;
  }

  button:active {
    transform: translateY(0);
    background: #1e40af;
  }
`;

async function fillProfile() {
  try {
    const profile = await getProfile();
    if (profile) fillApplication(profile, new URL(location.href));
  } catch (error) {
    console.error('Kandidat autofill failed:', error);
  }
}

export function triggerAutoFill() {
  try {
    void Promise.resolve(browser.runtime.sendMessage(AUTO_FILL_MESSAGE)).catch(
      () => {
        // No extension listener; the local autofill below still runs.
      },
    );
  } catch {
    // Runtime unavailable (e.g. extension reload); keep local autofill working.
  }

  void fillProfile();
}

export function injectFloatingButton(doc: Document = document) {
  if (doc.getElementById(FLOATING_HOST_ID)) return null;

  const host = doc.createElement('div');
  host.id = FLOATING_HOST_ID;

  const shadow = host.attachShadow({ mode: 'open' });

  const style = doc.createElement('style');
  style.textContent = BUTTON_STYLES;

  const button = doc.createElement('button');
  button.type = 'button';
  button.textContent = 'Fill Profile';
  button.setAttribute('aria-label', 'Fill Profile');
  button.title = 'Fill profile with Kandidat';
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    triggerAutoFill();
  });

  shadow.append(style, button);
  (doc.body ?? doc.documentElement).append(host);

  return host;
}

export default defineContentScript({
  matches: ATS_MATCHES,
  main() {
    injectFloatingButton();

    const observer = new MutationObserver(() => {
      if (!document.getElementById(FLOATING_HOST_ID)) {
        injectFloatingButton();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  },
});
