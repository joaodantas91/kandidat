import type { Profile } from '../storage/storage';
export type FieldIdentity = {
  name: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
};

export type FieldLocationShort = 'City, State, Country';
export type FieldLocationFull =
  | string
  | {
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };

export type FieldLinks = {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
  twitter?: string;
  [key: string]: string | undefined;
};

export const resolveIdentity = (profile: Profile): FieldIdentity => {
  const nameParts = profile.name.trim().split(/\s+/);
  const hasExplicitFirst = profile.firstName !== undefined && profile.firstName !== '';
  const hasExplicitLast = profile.lastName !== undefined && profile.lastName !== '';

  let firstName: string;
  let lastName: string;

  if (hasExplicitFirst && hasExplicitLast) {
    firstName = profile.firstName || '';
    lastName = profile.lastName || '';
  } else if (hasExplicitFirst && !hasExplicitLast) {
    firstName = profile.firstName || '';
    lastName = nameParts.pop() || '';
  } else if (!hasExplicitFirst && hasExplicitLast) {
    firstName = nameParts.shift() || '';
    lastName = profile.lastName || '';
  } else {
    firstName = nameParts.shift() || '';
    lastName = nameParts.pop() || '';
    if (firstName === lastName && nameParts.length === 0) {
      lastName = '';
    }
  }

  const middleName = profile.middleName
    ? profile.middleName
    : nameParts.length > 0 ? nameParts.join(' ') : undefined;

  const preferredName = profile.preferredName;

  return {
    name: profile.name,
    firstName,
    lastName,
    middleName,
    preferredName,
  };
};

export const resolveLocation = (profile: Profile, mode: 'short' | 'full'): string => {
  const location = profile.location;

  if (!location) return '';

  if (typeof location === 'string') {
    if (mode === 'short') return location;
    if (mode === 'full') return location;
  }

  if (mode === 'short') {
    const parts = [location.city, location.state, location.country]
      .filter(Boolean);
    return parts.join(', ');
  }

  if (mode === 'full') {
    const parts: string[] = [];

    if (location.addressLine1) parts.push(location.addressLine1);
    if (location.addressLine2) parts.push(location.addressLine2);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.postalCode) parts.push(location.postalCode);
    if (location.country) parts.push(location.country);

    return parts.join(', ');
  }

  return '';
};

export const resolveLinks = (profile: Profile): FieldLinks => {
  const links: FieldLinks = {};

  if (profile.links) {
    if (profile.links.linkedin) links.linkedin = profile.links.linkedin;
    if (profile.links.github) links.github = profile.links.github;
    if (profile.links.portfolio) links.portfolio = profile.links.portfolio;
    if (profile.links.website) links.website = profile.links.website;
    if (profile.links.twitter) links.twitter = profile.links.twitter;
  }

  if (profile.linkedin && !links.linkedin) {
    links.linkedin = profile.linkedin;
  }

  const seen = new Set<string>();
  const dedupe = (key: string, value: string) => {
    if (!seen.has(key) && value && value.trim()) {
      seen.add(key);
      return (links[key] = value);
    }
    return links[key];
  };

  if (profile.links?.linkedin) dedupe('linkedin', profile.links.linkedin);
  if (profile.links?.github) dedupe('github', profile.links.github);
  if (profile.links?.portfolio) dedupe('portfolio', profile.links.portfolio);
  if (profile.links?.website) dedupe('website', profile.links.website);
  if (profile.links?.twitter) dedupe('twitter', profile.links.twitter);

  return links;
};

export const resolveWorkAuthorization = (
  profile: Profile,
  questionText: string,
): 'yes' | 'no' | undefined => {
  const wa = profile.workAuthorization;

  if (!wa) return undefined;

  const lower = questionText.toLowerCase().trim();

  const authPatterns = [
    /legally\s+authorized/,
    /authorized\s+to\s+work/,
    /work\s+authorization/,
  ];

  const sponsorshipPatterns = [
    /sponsorship/,
    /work\s+permit/,
    /now\s+or\s+future/,
    /now_or_future/,
  ];

  const hasAuthPattern = authPatterns.some((p) => p.test(lower));
  const hasSponsorshipPattern = sponsorshipPatterns.some((p) => p.test(lower));

  if (hasAuthPattern && !hasSponsorshipPattern) {
    if (wa.authorizedToWork === true) return 'yes';
    if (wa.authorizedToWork === false) return 'no';
  }

  if (hasSponsorshipPattern) {
    if (wa.sponsorshipRequired === 'none') return 'no';
    if (wa.sponsorshipRequired === 'now') return 'no';
    if (wa.sponsorshipRequired === 'future') return undefined;
    if (wa.sponsorshipRequired === 'now_or_future') return undefined;
    if (wa.sponsorshipRequired === undefined) return undefined;
  }

  if (hasAuthPattern && hasSponsorshipPattern) {
    if (wa.authorizedToWork === true && wa.sponsorshipRequired === 'none') return 'yes';
    if (wa.authorizedToWork === false || wa.sponsorshipRequired !== 'none') return 'no';
  }

  return undefined;
};

export const splitName = (name: string) => {
  const [firstName = '', ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
};

export const setFieldValue = (
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  value: string,
) => {
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
};