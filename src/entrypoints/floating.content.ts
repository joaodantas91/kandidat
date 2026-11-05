import tokensCss from '/src/styles/tokens.css?raw';
import componentsCss from '/src/styles/components.css?raw';
import { mount } from 'svelte';
import { fillApplication } from '@/core/ats';
import { getProfile } from '@/core/storage/storage';
import { ATS_MATCHES } from '@/core/ats/matches';
import { detectFields } from '@/core/autofill/fieldDetector';
import QuickFillBar from '@/lib/components/QuickFillBar.svelte';

export { ATS_MATCHES };

export const AUTO_FILL_MESSAGE = 'AUTO_FILL';

export const FLOATING_HOST_ID = 'kandidat-floating-root';

const HOST_STYLES = `
  :host {
    all: initial;
    position: fixed !important;
    right: 24px !important;
    bottom: 24px !important;
    z-index: 2147483647 !important;
    display: block !important;
    isolation: isolate !important;
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

let floatingHost: HTMLDivElement | null = null;
let fieldCheckInterval: ReturnType<typeof setInterval> | null = null;

async function injectFloatingBar(doc: Document = document) {
  if (doc.getElementById(FLOATING_HOST_ID)) return null;

  const hasFields = detectFields(doc);
  if (Object.keys(hasFields).length === 0) return null;

  const host = doc.createElement('div');
  host.id = FLOATING_HOST_ID;

  const shadow = host.attachShadow({ mode: 'open' });

  const style = doc.createElement('style');
  style.textContent = HOST_STYLES;
  shadow.appendChild(style);

  const container = doc.createElement('div');
  shadow.appendChild(container);

  const tokensStyle = doc.createElement('style');
  tokensStyle.textContent = tokensCss;
  shadow.appendChild(tokensStyle);

  const componentsStyle = doc.createElement('style');
  componentsStyle.textContent = componentsCss;
  shadow.appendChild(componentsStyle);

  mount(QuickFillBar, { target: container });

  (doc.body ?? doc.documentElement).append(host);

  floatingHost = host;
  return host;
}

function removeFloatingBar() {
  if (floatingHost && floatingHost.parentNode) {
    floatingHost.parentNode.removeChild(floatingHost);
    floatingHost = null;
  }
}

async function checkAndUpdateBar(doc: Document = document) {
  const hasFields = detectFields(doc);
  const hasHost = doc.getElementById(FLOATING_HOST_ID);

  if (Object.keys(hasFields).length > 0) {
    if (!hasHost) {
      await injectFloatingBar(doc);
    }
  } else {
    if (hasHost) {
      removeFloatingBar();
    }
  }
}

export default defineContentScript({
  matches: ATS_MATCHES,
  main() {
    void checkAndUpdateBar();

    fieldCheckInterval = setInterval(() => {
      void checkAndUpdateBar();
    }, 2000);

    const observer = new MutationObserver(() => {
      void checkAndUpdateBar();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (fieldCheckInterval) clearInterval(fieldCheckInterval);
      removeFloatingBar();
      observer.disconnect();
    };
  },
});