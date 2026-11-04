import { storage } from '#imports';
import type { WatchCallback } from 'wxt/utils/storage';

export const DEFAULT_BLACKLIST_KEYWORDS: string[] = [
  'aberto a oportunidades',
  'procurando recolocação',
  'open to work',
  'curso',
  'mentoria',
  'bootcamp',
  'bairesdev',
  'turing',
  'crossover',
];

export interface Settings {
  blacklistKeywords: string[];
  autoFilterEnabled?: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  blacklistKeywords: DEFAULT_BLACKLIST_KEYWORDS,
  autoFilterEnabled: true,
};

const settings = storage.defineItem<Settings>('local:settings', {
  fallback: DEFAULT_SETTINGS,
});

export const getSettings = async (): Promise<Settings> => {
  return await settings.getValue();
};

export const setSettings = async (value: Settings): Promise<void> => {
  await settings.setValue(value);
};

export const getBlacklistKeywords = async (): Promise<string[]> => {
  const current = await getSettings();
  return current?.blacklistKeywords ?? DEFAULT_BLACKLIST_KEYWORDS;
};

export const setBlacklistKeywords = async (
  keywords: string[],
): Promise<void> => {
  const current = await getSettings();
  await setSettings({
    ...current,
    blacklistKeywords: keywords,
  });
};

export const addBlacklistKeyword = async (
  keyword: string,
): Promise<string[]> => {
  const trimmed = keyword.trim().toLowerCase();
  if (!trimmed) {
    return await getBlacklistKeywords();
  }
  const current = await getBlacklistKeywords();
  if (!current.includes(trimmed)) {
    const updated = [...current, trimmed];
    await setBlacklistKeywords(updated);
    return updated;
  }
  return current;
};

export const removeBlacklistKeyword = async (
  keyword: string,
): Promise<string[]> => {
  const trimmed = keyword.trim().toLowerCase();
  const current = await getBlacklistKeywords();
  const updated = current.filter((k) => k !== trimmed);
  await setBlacklistKeywords(updated);
  return updated;
};

export const resetSettings = async (): Promise<Settings> => {
  await setSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
};

export const onChangeSettings = async (cb: WatchCallback<Settings>) => {
  return settings.watch(cb);
};
