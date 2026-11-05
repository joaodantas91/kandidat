import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, unmount } from 'svelte';
import IdentitySection from './IdentitySection.svelte';
import LocationSection from './LocationSection.svelte';
import LinksSection from './LinksSection.svelte';
import WorkAuthSection from './WorkAuthSection.svelte';
import CompensationSection from './CompensationSection.svelte';
import ExperienceSection from './ExperienceSection.svelte';
import {
  parseProfileFormData,
  getTextField,
  getLocationFromFormData,
  getLinksFromFormData,
  getWorkAuthFromFormData,
  getCompensationFromFormData,
  getExperienceFromFormData,
} from './formUtils';

describe('Profile Subcomponents', () => {
  let target: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    target = document.createElement('div');
    document.body.appendChild(target);
  });

  describe('IdentitySection.svelte', () => {
    it('renders identity and contact fieldsets with bound values', () => {
      const onDirty = vi.fn();
      const comp = mount(IdentitySection, {
        target,
        props: {
          name: 'Jane Doe',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          phone: '+1234567890',
          onDirty,
        },
      });

      const nameInput = target.querySelector('#name') as HTMLInputElement;
      expect(nameInput.value).toBe('Jane Doe');

      const emailInput = target.querySelector('#email') as HTMLInputElement;
      expect(emailInput.value).toBe('jane@example.com');

      nameInput.value = 'Jane Smith';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      expect(onDirty).toHaveBeenCalled();

      unmount(comp);
    });

    it('syncs with profile object prop', () => {
      const profile = { name: 'Alice Bob', pronouns: 'she/her' };
      const comp = mount(IdentitySection, {
        target,
        props: { profile },
      });

      const nameInput = target.querySelector('#name') as HTMLInputElement;
      expect(nameInput.value).toBe('Alice Bob');

      const pronounsInput = target.querySelector('#pronouns') as HTMLInputElement;
      expect(pronounsInput.value).toBe('she/her');

      unmount(comp);
    });
  });

  describe('LocationSection.svelte', () => {
    it('renders location fields and triggers onDirty', () => {
      const onDirty = vi.fn();
      const comp = mount(LocationSection, {
        target,
        props: {
          city: 'London',
          country: 'UK',
          onDirty,
        },
      });

      const cityInput = target.querySelector('#city') as HTMLInputElement;
      expect(cityInput.value).toBe('London');

      cityInput.value = 'Manchester';
      cityInput.dispatchEvent(new Event('input', { bubbles: true }));
      expect(onDirty).toHaveBeenCalled();

      unmount(comp);
    });
  });

  describe('LinksSection.svelte', () => {
    it('renders links fields and triggers onDirty', () => {
      const onDirty = vi.fn();
      const comp = mount(LinksSection, {
        target,
        props: {
          linkedin: 'https://linkedin.com/in/test',
          github: 'https://github.com/test',
          onDirty,
        },
      });

      const linkedinInput = target.querySelector('#linkedin') as HTMLInputElement;
      expect(linkedinInput.value).toBe('https://linkedin.com/in/test');

      linkedinInput.value = 'https://linkedin.com/in/new';
      linkedinInput.dispatchEvent(new Event('input', { bubbles: true }));
      expect(onDirty).toHaveBeenCalled();

      unmount(comp);
    });
  });

  describe('WorkAuthSection.svelte', () => {
    it('renders work authorization fields and triggers onDirty', () => {
      const onDirty = vi.fn();
      const comp = mount(WorkAuthSection, {
        target,
        props: {
          authorizedToWork: true,
          sponsorshipRequired: 'now',
          citizenship: 'US',
          onDirty,
        },
      });

      const authInput = target.querySelector('#authorizedToWork') as HTMLInputElement;
      expect(authInput.checked).toBe(true);

      const sponsorSelect = target.querySelector('#sponsorshipRequired') as HTMLSelectElement;
      expect(sponsorSelect.value).toBe('now');

      authInput.checked = false;
      authInput.dispatchEvent(new Event('change', { bubbles: true }));
      expect(onDirty).toHaveBeenCalled();

      unmount(comp);
    });
  });

  describe('CompensationSection.svelte', () => {
    it('renders compensation inputs and triggers onDirty', () => {
      const onDirty = vi.fn();
      const comp = mount(CompensationSection, {
        target,
        props: {
          currency: 'EUR',
          desiredSalary: 95000,
          salaryPeriod: 'annual',
          onDirty,
        },
      });

      const currencyInput = target.querySelector('#currency') as HTMLInputElement;
      expect(currencyInput.value).toBe('EUR');

      const salaryInput = target.querySelector('#desiredSalary') as HTMLInputElement;
      expect(salaryInput.value).toBe('95000');

      salaryInput.value = '100000';
      salaryInput.dispatchEvent(new Event('input', { bubbles: true }));
      expect(onDirty).toHaveBeenCalled();

      unmount(comp);
    });
  });

  describe('ExperienceSection.svelte', () => {
    it('renders experience inputs and triggers onDirty', () => {
      const onDirty = vi.fn();
      const comp = mount(ExperienceSection, {
        target,
        props: {
          currentCompany: 'Tech Corp',
          currentTitle: 'Staff Engineer',
          yearsOfExperience: 10,
          summary: 'Experienced developer',
          onDirty,
        },
      });

      const companyInput = target.querySelector('#currentCompany') as HTMLInputElement;
      expect(companyInput.value).toBe('Tech Corp');

      const summaryTextarea = target.querySelector('#summary') as HTMLTextAreaElement;
      expect(summaryTextarea.value).toBe('Experienced developer');

      companyInput.value = 'New Corp';
      companyInput.dispatchEvent(new Event('input', { bubbles: true }));
      expect(onDirty).toHaveBeenCalled();

      unmount(comp);
    });
  });

  describe('formUtils', () => {
    it('correctly parses empty form data', () => {
      const form = document.createElement('form');
      const data = new FormData(form);
      const profile = parseProfileFormData(data);

      expect(profile.name).toBe('');
      expect(profile.location).toBeUndefined();
      expect(profile.links).toBeUndefined();
      expect(profile.workAuthorization).toBeUndefined();
      expect(profile.compensation).toBeUndefined();
      expect(profile.experience).toBeUndefined();
    });

    it('correctly parses populated form data', () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <input name="name" value="Jane Doe" />
        <input name="city" value="Paris" />
        <input name="country" value="France" />
        <input name="github" value="https://github.com/janedoe" />
        <input name="authorizedToWork" type="checkbox" checked />
        <select name="sponsorshipRequired"><option value="none" selected>None</option></select>
        <input name="desiredSalary" value="120000" />
        <input name="currentCompany" value="Stripe" />
      `;
      const data = new FormData(form);
      const profile = parseProfileFormData(data);

      expect(profile.name).toBe('Jane Doe');
      expect(profile.location?.city).toBe('Paris');
      expect(profile.location?.country).toBe('France');
      expect(profile.links?.github).toBe('https://github.com/janedoe');
      expect(profile.workAuthorization?.authorizedToWork).toBe(true);
      expect(profile.workAuthorization?.sponsorshipRequired).toBe('none');
      expect(profile.compensation?.desiredSalary).toBe(120000);
      expect(profile.experience?.currentCompany).toBe('Stripe');
    });
  });
});
