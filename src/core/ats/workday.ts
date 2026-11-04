import type { Profile } from '../storage/storage';
import { resolveLocation, resolveLinks, resolveWorkAuthorization, setFieldValue, splitName } from '../ats/fieldMapping';

export { splitName };

export const WORKDAY_FIELD_SELECTORS = {
  firstName: '[data-automation-id="legalNameSection_firstName"]',
  lastName: '[data-automation-id="legalNameSection_lastName"]',
  email: '[data-automation-id="email"]',
  phone: '[data-automation-id="phone-number"]',
  addressLine1: '[data-automation-id="addressSection_addressLine1"]',
  addressLine2: '[data-automation-id="addressSection_addressLine2"]',
  city: '[data-automation-id="addressSection_city"]',
  postalCode: '[data-automation-id="addressSection_postalCode"]',
  countryRegion: '[data-automation-id="countryRegion"]',
} as const;

const LINK_SELECTORS = {
  linkedin: '[data-automation-id="linkedin"]',
  github: '[data-automation-id="github"]',
  portfolio: '[data-automation-id="portfolio"]',
  website: '[data-automation-id="website"]',
};

const findInput = (root: ParentNode, selector: string) => {
  return root.querySelector<HTMLInputElement>(selector);
};

const fillField = (
  root: ParentNode,
  selector: string,
  value: string | undefined,
) => {
  if (!value) return;

  const input = root.querySelector<HTMLInputElement>(selector);
  if (input && (input.value || '').trim().length === 0) setFieldValue(input, value);
};

export const fillWorkday = (profile: Profile, root: ParentNode = document) => {
  const { firstName, lastName } = splitName(profile.name);

  fillField(root, WORKDAY_FIELD_SELECTORS.firstName, firstName);
  fillField(root, WORKDAY_FIELD_SELECTORS.lastName, lastName);
  fillField(root, WORKDAY_FIELD_SELECTORS.email, profile.email);
  fillField(root, WORKDAY_FIELD_SELECTORS.phone, profile.phone);

  fillField(root, WORKDAY_FIELD_SELECTORS.addressLine1, '');
  fillField(root, WORKDAY_FIELD_SELECTORS.addressLine2, '');
  fillField(root, WORKDAY_FIELD_SELECTORS.city, '');
  fillField(root, WORKDAY_FIELD_SELECTORS.postalCode, '');
  fillField(root, WORKDAY_FIELD_SELECTORS.countryRegion, '');

  const location = resolveLocation(profile, 'full');
  const locationParts = location.split(',');
  if (locationParts.length >= 1) {
    const addr1 = locationParts[0]!.trim();
    if (addr1) fillField(root, WORKDAY_FIELD_SELECTORS.addressLine1, addr1);
  }
  if (locationParts.length >= 2) {
    const addr2 = locationParts[1]!.trim();
    if (addr2) fillField(root, WORKDAY_FIELD_SELECTORS.addressLine2, addr2);
  }
  if (locationParts.length >= 3) {
    const city = locationParts[2]!.trim();
    if (city) fillField(root, WORKDAY_FIELD_SELECTORS.city, city);
  }
  if (locationParts.length >= 5) {
    const postal = locationParts[4]!.trim();
    if (postal) fillField(root, WORKDAY_FIELD_SELECTORS.postalCode, postal);
  }
  if (locationParts.length >= 6) {
    const country = locationParts[5]!.trim();
    if (country) fillField(root, WORKDAY_FIELD_SELECTORS.countryRegion, country);
  }

  for (const [key, selector] of Object.entries(LINK_SELECTORS)) {
    const input = findInput(root, selector);
    if (input && (input.value || '').trim().length === 0) {
      const links = resolveLinks(profile);
      setFieldValue(input, links[key] || '');
    }
  }

  const authRadios = root.querySelectorAll<
    HTMLInputElement
  >('input[type="radio"], input[type="select"]');
  for (const radio of authRadios) {
    const labelText = radio.labels?.[0]?.textContent || radio.closest('label')?.textContent || '';
    const wa = resolveWorkAuthorization(profile, labelText);
    if (wa === 'yes' || wa === 'no') {
      if (radio.type === 'radio') {
        const lowerLabel = labelText.toLowerCase();
        const isYesRadio = radio.value === 'yes' || lowerLabel.includes('yes');
        const isNoRadio = radio.value === 'no' || (lowerLabel.includes('no') && !lowerLabel.includes('sponsorship'));
        if (wa === 'yes' && isYesRadio) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (wa === 'no' && isNoRadio && profile.workAuthorization?.authorizedToWork === false) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else {
        setFieldValue(radio, wa);
      }
    }
  }
};
