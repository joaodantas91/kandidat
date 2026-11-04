import type { Profile } from '../storage/storage';

export type AtsPlatform = 'lever' | 'greenhouse' | 'workday';

export type AtsAdapter = {
  readonly platform: AtsPlatform;
  readonly matches: (url: URL, root?: ParentNode) => boolean;
  readonly fill?: (profile: Profile, root?: ParentNode) => void;
};
