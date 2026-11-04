import type { Profile } from '../storage/storage';
import { autofill } from '../autofill/autofill';
import { detectAts } from './platform';
import { fillGreenhouse } from './greenhouse';
import { fillLever } from './lever';
import { fillWorkday } from './workday';
import type { AtsPlatform } from './types';

const FILLERS: Record<
  AtsPlatform,
  (profile: Profile, root?: ParentNode) => void
> = {
  lever: fillLever,
  greenhouse: fillGreenhouse,
  workday: fillWorkday,
};

export const fillApplication = (
  profile: Profile,
  url: URL,
  root?: ParentNode,
) => {
  try {
    const adapter = detectAts(url, root);
    if (adapter) {
      FILLERS[adapter.platform](profile, root);
      return;
    }
  } catch (error) {
    console.error('ATS autofill failed:', error);
  }

  autofill({ profile, root });
};
