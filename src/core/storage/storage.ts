import { storage } from '#imports';
import type { WatchCallback } from 'wxt/utils/storage';
import { splitName } from '../dom/setter';

export type ProfileLocation = {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  countryCode?: string;
};

export type ProfileLinks = {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
  twitter?: string;
  stackoverflow?: string;
  dribbble?: string;
  other?: string;
};

export type WorkAuthorization = {
  authorizedToWork?: boolean;
  sponsorshipRequired?: 'none' | 'now' | 'future' | 'now_or_future';
  workPermitType?: string;
  citizenship?: string;
  willingToRelocate?: boolean;
  willingToTravel?: boolean;
};

export type Compensation = {
  currency?: string;
  desiredSalary?: number;
  minimumSalary?: number;
  currentSalary?: number;
  salaryPeriod?: 'annual' | 'monthly' | 'hourly';
};

export type Experience = {
  currentCompany?: string;
  currentTitle?: string;
  yearsOfExperience?: number;
  highestDegree?: string;
  university?: string;
  fieldOfStudy?: string;
  graduationYear?: number;
  noticePeriod?: string;
  availableStartDate?: string;
  summary?: string;
};

export type Profile = {
  name: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  preferredName?: string;
  pronouns?: string;
  email?: string;
  alternateEmail?: string;
  phone?: string;
  alternatePhone?: string;
  location?: ProfileLocation;
  links?: ProfileLinks;
  workAuthorization?: WorkAuthorization;
  compensation?: Compensation;
  experience?: Experience;
  org?: string;
  linkedin?: string;
  schemaVersion?: number;
};

export const PROFILE_SCHEMA_VERSION = 2;

export class ProfileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileValidationError';
  }
}

export const deriveFullName = (profile: Partial<Profile>): string => {
  if (profile.name) return profile.name;
  const { firstName, lastName } = profile;
  return (firstName || '') + ' ' + (lastName || '');
};

export const normalizeProfile = (value: any): Profile => {
  if (!value) return {} as Profile;

  let profile = { ...value };

  const trimStrings = (obj: any) => {
    if (typeof obj !== 'object' || obj === null) return;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        trimStrings(obj[key]);
      }
    }
  };
  trimStrings(profile);

  const cleaned: any = {};
  for (const key of Object.keys(profile)) {
    if (key === 'org' || key === 'linkedin') continue;
    if (profile[key] === '' || profile[key] === null || profile[key] === undefined) continue;
    cleaned[key] = profile[key];
  }

  const orgValue = profile.org;
  const linkedinValue = profile.linkedin;

  if (orgValue && !cleaned.experience) {
    cleaned.experience = { currentCompany: orgValue };
  }
  if (profile.experience?.currentCompany && !cleaned.org) {
    cleaned.org = profile.experience.currentCompany;
  }
  if (linkedinValue && !cleaned.links) {
    cleaned.links = { linkedin: linkedinValue };
  }
  if (profile.links?.linkedin && !cleaned.linkedin) {
    cleaned.linkedin = profile.links.linkedin;
  }

  if (!cleaned.name) {
    const fullName = deriveFullName(cleaned);
    cleaned.name = fullName.trim();
  }

  return cleaned as Profile;
};

const profile = storage.defineItem<Profile>('local:profile', {
  fallback: {
    name: '',
    schemaVersion: 1,
  },
});

export { profile };

export const getProfile = async (): Promise<Profile | null> => {
  const value = await profile.getValue();
  if (!value || !value.name) return null;
  return normalizeProfile(value);
};

export const setProfile = async (profileValue: Profile): Promise<void> => {
  const normalized = normalizeProfile(profileValue);
  if (!normalized.name.trim()) {
    throw new ProfileValidationError('Profile name must not be empty');
  }
  normalized.schemaVersion = PROFILE_SCHEMA_VERSION;
  await profile.setValue(normalized);
};

export const updateProfile = async (patch: Partial<Profile>): Promise<Profile> => {
  const existing = await profile.getValue();
  if (!existing) {
    await setProfile(patch as Profile);
    return await getProfile();
  }
  const merged = { ...existing, ...patch };
  const normalized = normalizeProfile(merged);
  if (!normalized.name.trim()) {
    throw new ProfileValidationError('Profile name must not be empty');
  }
  normalized.schemaVersion = PROFILE_SCHEMA_VERSION;
  await profile.setValue(normalized);
  return normalized;
};

export const onChangeProfile = async (cb: WatchCallback<Profile | null>) => {
  return profile.watch(cb);
};