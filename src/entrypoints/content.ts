import { autofill } from '@/core/autofill/autofill';
import { getProfile } from '@/core/storage/storage';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    browser.runtime.onMessage.addListener(async (message) => {
      if (message === 'AUTO_FILL') {
        try {
          const profile = await getProfile();
          if (profile) {
            autofill({ profile });
          }
        } catch (error) {
          console.error('Autofill failed:', error);
        }
      }
    });
  },
});
