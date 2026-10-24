import { autofill } from '@/core/autofill/autofill';
import { getProfile, onChangeProfile } from '@/core/storage/storage';

export default defineContentScript({
  matches: ['<all_urls>'],
  async main() {
    onChangeProfile((profile) => {
      if (profile) autofill({ profile });
    });
  },
});
