import { storage } from '#imports';
import type { WatchCallback } from 'wxt/utils/storage';

export type Profile = {
  name: string;
  email?: string;
  phone?: string;
  linkedin?: string;
};

const profile = storage.defineItem<Profile>('local:profile');

export const setProfile = async (profileValue: Profile) => {
  await profile.setValue(profileValue);
};

export const getProfile = async () => {
  return await profile.getValue();
};

export const onChangeProfile = async (cb: WatchCallback<Profile | null>) => {
  return profile.watch(cb);
};
