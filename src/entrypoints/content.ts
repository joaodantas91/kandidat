import { fillApplication } from '@/core/ats';
import { getProfile } from '@/core/storage/storage';
import { ATS_MATCHES } from './floating.content';

export default defineContentScript({
  matches: ATS_MATCHES,
  main() {
    browser.runtime.onMessage.addListener(async (message) => {
      if (message === 'AUTO_FILL') {
        try {
          const profile = await getProfile();
          if (profile) {
            fillApplication(profile, new URL(location.href));
          }
        } catch (error) {
          console.error('Autofill failed:', error);
        }
      }
    });
  },
});
