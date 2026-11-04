<script lang="ts">
  import { onMount } from 'svelte';
  import { getProfile, setProfile } from '@/core/storage/storage';
  import { showToast } from '@/lib/toastStore';
  import type { Profile, ProfileLocation, ProfileLinks, WorkAuthorization, Compensation, Experience } from '@/core/storage/storage';

  let profile: Profile | null = $state(null);
  let isDirty: boolean = $state(true);
  let isSaving: boolean = $state(false);

  let name: string = $state('');
  let firstName: string = $state('');
  let middleName: string = $state('');
  let lastName: string = $state('');
  let preferredName: string = $state('');
  let pronouns: string = $state('');
  let email: string = $state('');
  let alternateEmail: string = $state('');
  let phone: string = $state('');
  let alternatePhone: string = $state('');

  let addressLine1: string = $state('');
  let addressLine2: string = $state('');
  let city: string = $state('');
  let state: string = $state('');
  let postalCode: string = $state('');
  let country: string = $state('');
  let countryCode: string = $state('');

  let linkedin: string = $state('');
  let github: string = $state('');
  let portfolio: string = $state('');
  let website: string = $state('');
  let twitter: string = $state('');
  let stackoverflow: string = $state('');
  let dribbble: string = $state('');
  let other: string = $state('');

  let authorizedToWork: boolean = $state(false);
  let sponsorshipRequired: string | undefined = $state(undefined);
  let workPermitType: string = $state('');
  let citizenship: string = $state('');
  let willingToRelocate: boolean = $state(false);
  let willingToTravel: boolean = $state(false);

  let currency: string = $state('');
  let desiredSalary: string = $state('');
  let minimumSalary: string = $state('');
  let currentSalary: string = $state('');
  let salaryPeriod: string = $state('');

  let currentCompany: string = $state('');
  let currentTitle: string = $state('');
  let yearsOfExperience: string = $state('');
  let highestDegree: string = $state('');
  let university: string = $state('');
  let fieldOfStudy: string = $state('');
  let graduationYear: string = $state('');
  let noticePeriod: string = $state('');
  let availableStartDate: string = $state('');
  let summary: string = $state('');

  function markDirty() {
    isDirty = true;
  }

  async function loadProfileData() {
    profile = await getProfile();
    if (profile) {
      name = profile.name ?? '';
      firstName = profile.firstName ?? '';
      middleName = profile.middleName ?? '';
      lastName = profile.lastName ?? '';
      preferredName = profile.preferredName ?? '';
      pronouns = profile.pronouns ?? '';
      email = profile.email ?? '';
      alternateEmail = profile.alternateEmail ?? '';
      phone = profile.phone ?? '';
      alternatePhone = profile.alternatePhone ?? '';

      addressLine1 = profile.location?.addressLine1 ?? '';
      addressLine2 = profile.location?.addressLine2 ?? '';
      city = profile.location?.city ?? '';
      state = profile.location?.state ?? '';
      postalCode = profile.location?.postalCode ?? '';
      country = profile.location?.country ?? '';
      countryCode = profile.location?.countryCode ?? '';

      linkedin = profile.links?.linkedin ?? '';
      github = profile.links?.github ?? '';
      portfolio = profile.links?.portfolio ?? '';
      website = profile.links?.website ?? '';
      twitter = profile.links?.twitter ?? '';
      stackoverflow = profile.links?.stackoverflow ?? '';
      dribbble = profile.links?.dribbble ?? '';
      other = profile.links?.other ?? '';

      authorizedToWork = profile.workAuthorization?.authorizedToWork ?? false;
      sponsorshipRequired = profile.workAuthorization?.sponsorshipRequired ?? '';
      workPermitType = profile.workAuthorization?.workPermitType ?? '';
      citizenship = profile.workAuthorization?.citizenship ?? '';
      willingToRelocate = profile.workAuthorization?.willingToRelocate ?? false;
      willingToTravel = profile.workAuthorization?.willingToTravel ?? false;

      currency = profile.compensation?.currency ?? '';
      desiredSalary = profile.compensation?.desiredSalary !== undefined ? String(profile.compensation.desiredSalary) : '';
      minimumSalary = profile.compensation?.minimumSalary !== undefined ? String(profile.compensation.minimumSalary) : '';
      currentSalary = profile.compensation?.currentSalary !== undefined ? String(profile.compensation.currentSalary) : '';
      salaryPeriod = profile.compensation?.salaryPeriod ?? '';

      currentCompany = profile.experience?.currentCompany ?? '';
      currentTitle = profile.experience?.currentTitle ?? '';
      yearsOfExperience = profile.experience?.yearsOfExperience !== undefined ? String(profile.experience.yearsOfExperience) : '';
      highestDegree = profile.experience?.highestDegree ?? '';
      university = profile.experience?.university ?? '';
      fieldOfStudy = profile.experience?.fieldOfStudy ?? '';
      graduationYear = profile.experience?.graduationYear !== undefined ? String(profile.experience.graduationYear) : '';
      noticePeriod = profile.experience?.noticePeriod ?? '';
      availableStartDate = profile.experience?.availableStartDate ?? '';
      summary = profile.experience?.summary ?? '';
    }
    isDirty = false;
  }

  onMount(async () => {
    await loadProfileData();
  });

  async function handleReset() {
    await loadProfileData();
    showToast('Profile reloaded', 'info');
  }

  function getTextField(data: FormData, field: string): string | null {
    const value = data.get(field);
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  function getLocationFromFormData(data: FormData): ProfileLocation | null {
    const addressLine1Val = getTextField(data, 'addressLine1');
    const addressLine2Val = getTextField(data, 'addressLine2');
    const cityVal = getTextField(data, 'city');
    const stateVal = getTextField(data, 'state');
    const postalCodeVal = getTextField(data, 'postalCode');
    const countryVal = getTextField(data, 'country');
    const countryCodeVal = getTextField(data, 'countryCode');

    if (!addressLine1Val && !cityVal && !postalCodeVal && !countryVal) {
      return null;
    }

    return {
      addressLine1: addressLine1Val ?? undefined,
      addressLine2: addressLine2Val ?? undefined,
      city: cityVal ?? undefined,
      state: stateVal ?? undefined,
      postalCode: postalCodeVal ?? undefined,
      country: countryVal ?? undefined,
      countryCode: countryCodeVal ?? undefined,
    };
  }

  function getLinksFromFormData(data: FormData): ProfileLinks | null {
    const linkedinVal = getTextField(data, 'linkedin');
    const githubVal = getTextField(data, 'github');
    const portfolioVal = getTextField(data, 'portfolio');
    const websiteVal = getTextField(data, 'website');
    const twitterVal = getTextField(data, 'twitter');
    const stackoverflowVal = getTextField(data, 'stackoverflow');
    const dribbbleVal = getTextField(data, 'dribbble');
    const otherVal = getTextField(data, 'other');

    const hasAny = [linkedinVal, githubVal, portfolioVal, websiteVal, twitterVal, stackoverflowVal, dribbbleVal, otherVal].some(
      (v) => v,
    );

    if (!hasAny) {
      return null;
    }

    return {
      linkedin: linkedinVal ?? undefined,
      github: githubVal ?? undefined,
      portfolio: portfolioVal ?? undefined,
      website: websiteVal ?? undefined,
      twitter: twitterVal ?? undefined,
      stackoverflow: stackoverflowVal ?? undefined,
      dribbble: dribbbleVal ?? undefined,
      other: otherVal ?? undefined,
    };
  }

  function getWorkAuthFromFormData(data: FormData): WorkAuthorization | null {
    const authorizedToWorkVal = data.get('authorizedToWork') === 'on';
    const sponsorshipRequiredVal = data.get('sponsorshipRequired') as
      | 'none' | 'now' | 'future' | 'now_or_future'
      | undefined;
    const workPermitTypeVal = getTextField(data, 'workPermitType');
    const citizenshipVal = getTextField(data, 'citizenship');
    const willingToRelocateVal = data.get('willingToRelocate') === 'on';
    const willingToTravelVal = data.get('willingToTravel') === 'on';

    const hasAny = [authorizedToWorkVal, sponsorshipRequiredVal, workPermitTypeVal, citizenshipVal, willingToRelocateVal, willingToTravelVal].some(
      (v) => v !== undefined && v !== null && v !== false && v !== '',
    );

    if (!hasAny) {
      return null;
    }

    return {
      authorizedToWork: authorizedToWorkVal,
      sponsorshipRequired: sponsorshipRequiredVal || undefined,
      workPermitType: workPermitTypeVal ?? undefined,
      citizenship: citizenshipVal ?? undefined,
      willingToRelocate: willingToRelocateVal,
      willingToTravel: willingToTravelVal,
    };
  }

  function getCompensationFromFormData(data: FormData): Compensation | null {
    const currencyVal = getTextField(data, 'currency');
    const desiredSalaryVal = getTextField(data, 'desiredSalary');
    const minimumSalaryVal = getTextField(data, 'minimumSalary');
    const currentSalaryVal = getTextField(data, 'currentSalary');
    const salaryPeriodVal = data.get('salaryPeriod') as 'annual' | 'monthly' | 'hourly' | undefined;

    const hasAny = [currencyVal, desiredSalaryVal, minimumSalaryVal, currentSalaryVal, salaryPeriodVal].some(
      (v) => v,
    );

    if (!hasAny) {
      return null;
    }

    return {
      currency: currencyVal ?? undefined,
      desiredSalary: desiredSalaryVal ? Number(desiredSalaryVal) : undefined,
      minimumSalary: minimumSalaryVal ? Number(minimumSalaryVal) : undefined,
      currentSalary: currentSalaryVal ? Number(currentSalaryVal) : undefined,
      salaryPeriod: salaryPeriodVal || undefined,
    };
  }

  function getExperienceFromFormData(data: FormData): Experience | null {
    const currentCompanyVal = getTextField(data, 'currentCompany');
    const currentTitleVal = getTextField(data, 'currentTitle');
    const yearsOfExperienceVal = getTextField(data, 'yearsOfExperience');
    const highestDegreeVal = getTextField(data, 'highestDegree');
    const universityVal = getTextField(data, 'university');
    const fieldOfStudyVal = getTextField(data, 'fieldOfStudy');
    const graduationYearVal = getTextField(data, 'graduationYear');
    const noticePeriodVal = getTextField(data, 'noticePeriod');
    const availableStartDateVal = getTextField(data, 'availableStartDate');
    const summaryVal = getTextField(data, 'summary');

    const hasAny = [
      currentCompanyVal,
      currentTitleVal,
      yearsOfExperienceVal,
      highestDegreeVal,
      universityVal,
      fieldOfStudyVal,
      graduationYearVal,
      noticePeriodVal,
      availableStartDateVal,
      summaryVal,
    ].some((v) => v);

    if (!hasAny) {
      return null;
    }

    return {
      currentCompany: currentCompanyVal ?? undefined,
      currentTitle: currentTitleVal ?? undefined,
      yearsOfExperience: yearsOfExperienceVal ? Number(yearsOfExperienceVal) : undefined,
      highestDegree: highestDegreeVal ?? undefined,
      university: universityVal ?? undefined,
      fieldOfStudy: fieldOfStudyVal ?? undefined,
      graduationYear: graduationYearVal ? Number(graduationYearVal) : undefined,
      noticePeriod: noticePeriodVal ?? undefined,
      availableStartDate: availableStartDateVal ?? undefined,
      summary: summaryVal ?? undefined,
    };
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }
    const data = new FormData(form);

    isSaving = true;
    try {
      name = getTextField(data, 'name') || '';
      firstName = getTextField(data, 'firstName') ?? '';
      middleName = getTextField(data, 'middleName') ?? '';
      lastName = getTextField(data, 'lastName') ?? '';
      preferredName = getTextField(data, 'preferredName') ?? '';
      pronouns = getTextField(data, 'pronouns') ?? '';
      email = getTextField(data, 'email') ?? '';
      alternateEmail = getTextField(data, 'alternateEmail') ?? '';
      phone = getTextField(data, 'phone') ?? '';
      alternatePhone = getTextField(data, 'alternatePhone') ?? '';

      const location = getLocationFromFormData(data);
      if (location) {
        addressLine1 = location.addressLine1 ?? '';
        addressLine2 = location.addressLine2 ?? '';
        city = location.city ?? '';
        state = location.state ?? '';
        postalCode = location.postalCode ?? '';
        country = location.country ?? '';
        countryCode = location.countryCode ?? '';
      }

      const links = getLinksFromFormData(data);
      if (links) {
        linkedin = links.linkedin ?? '';
        github = links.github ?? '';
        portfolio = links.portfolio ?? '';
        website = links.website ?? '';
        twitter = links.twitter ?? '';
        stackoverflow = links.stackoverflow ?? '';
        dribbble = links.dribbble ?? '';
        other = links.other ?? '';
      }

      const workAuth = getWorkAuthFromFormData(data);
      if (workAuth) {
        authorizedToWork = workAuth.authorizedToWork ?? false;
        sponsorshipRequired = workAuth.sponsorshipRequired ?? '';
        workPermitType = workAuth.workPermitType ?? '';
        citizenship = workAuth.citizenship ?? '';
        willingToRelocate = workAuth.willingToRelocate ?? false;
        willingToTravel = workAuth.willingToTravel ?? false;
      }

      const compensation = getCompensationFromFormData(data);
      if (compensation) {
        currency = compensation.currency ?? '';
        desiredSalary = compensation.desiredSalary !== undefined ? String(compensation.desiredSalary) : '';
        minimumSalary = compensation.minimumSalary !== undefined ? String(compensation.minimumSalary) : '';
        currentSalary = compensation.currentSalary !== undefined ? String(compensation.currentSalary) : '';
        salaryPeriod = compensation.salaryPeriod ?? '';
      }

      const experience = getExperienceFromFormData(data);
      if (experience) {
        currentCompany = experience.currentCompany ?? '';
        currentTitle = experience.currentTitle ?? '';
        yearsOfExperience = experience.yearsOfExperience !== undefined ? String(experience.yearsOfExperience) : '';
        highestDegree = experience.highestDegree ?? '';
        university = experience.university ?? '';
        fieldOfStudy = experience.fieldOfStudy ?? '';
        graduationYear = experience.graduationYear !== undefined ? String(experience.graduationYear) : '';
        noticePeriod = experience.noticePeriod ?? '';
        availableStartDate = experience.availableStartDate ?? '';
        summary = experience.summary ?? '';
      }

      profile = {
        name,
        firstName: firstName || undefined,
        middleName: middleName || undefined,
        lastName: lastName || undefined,
        preferredName: preferredName || undefined,
        pronouns: pronouns || undefined,
        email: email || undefined,
        alternateEmail: alternateEmail || undefined,
        phone: phone || undefined,
        alternatePhone: alternatePhone || undefined,
        location: location ?? undefined,
        links: links ?? undefined,
        workAuthorization: workAuth ?? undefined,
        compensation: compensation ?? undefined,
        experience: experience ?? undefined,
      };

      await setProfile(profile);
      isDirty = false;
      showToast('Profile saved successfully', 'success');
    } finally {
      isSaving = false;
    }
  }
</script>

<form onsubmit={handleSubmit} class="profile-form">
  <fieldset class="profile-fieldset" aria-labelledby="identity-legend">
    <legend id="identity-legend">Identity</legend>
    <div class="form-grid">
      <div class="form-group grid-full">
        <label for="name">Name *</label>
        <input
          id="name"
          name="name"
          type="text"
          bind:value={name}
          oninput={markDirty}
          required
        />
      </div>

      <div class="form-group">
        <label for="firstName">First Name</label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          bind:value={firstName}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="middleName">Middle Name</label>
        <input
          id="middleName"
          name="middleName"
          type="text"
          bind:value={middleName}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="lastName">Last Name</label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          bind:value={lastName}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="preferredName">Preferred Name</label>
        <input
          id="preferredName"
          name="preferredName"
          type="text"
          bind:value={preferredName}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="pronouns">Pronouns</label>
        <input
          id="pronouns"
          name="pronouns"
          type="text"
          bind:value={pronouns}
          oninput={markDirty}
        />
      </div>
    </div>
  </fieldset>

  <fieldset class="profile-fieldset" aria-labelledby="contact-legend">
    <legend id="contact-legend">Contact</legend>
    <div class="form-grid">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          bind:value={email}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="alternateEmail">Alternate Email</label>
        <input
          id="alternateEmail"
          name="alternateEmail"
          type="email"
          bind:value={alternateEmail}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="phone">Phone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          bind:value={phone}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="alternatePhone">Alternate Phone</label>
        <input
          id="alternatePhone"
          name="alternatePhone"
          type="tel"
          bind:value={alternatePhone}
          oninput={markDirty}
        />
      </div>
    </div>
  </fieldset>

  <fieldset class="profile-fieldset" aria-labelledby="location-legend">
    <legend id="location-legend">Location</legend>
    <div class="form-grid">
      <div class="form-group grid-full">
        <label for="addressLine1">Address Line 1</label>
        <input
          id="addressLine1"
          name="addressLine1"
          type="text"
          bind:value={addressLine1}
          oninput={markDirty}
        />
      </div>

      <div class="form-group grid-full">
        <label for="addressLine2">Address Line 2</label>
        <input
          id="addressLine2"
          name="addressLine2"
          type="text"
          bind:value={addressLine2}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="city">City</label>
        <input
          id="city"
          name="city"
          type="text"
          bind:value={city}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="state">State / Province</label>
        <input
          id="state"
          name="state"
          type="text"
          bind:value={state}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="postalCode">Postal Code</label>
        <input
          id="postalCode"
          name="postalCode"
          type="text"
          bind:value={postalCode}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="country">Country</label>
        <input
          id="country"
          name="country"
          type="text"
          bind:value={country}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="countryCode">Country Code (ISO)</label>
        <input
          id="countryCode"
          name="countryCode"
          type="text"
          bind:value={countryCode}
          oninput={markDirty}
        />
      </div>
    </div>
  </fieldset>

  <fieldset class="profile-fieldset" aria-labelledby="links-legend">
    <legend id="links-legend">Links</legend>
    <div class="form-grid">
      <div class="form-group grid-full">
        <label for="linkedin">LinkedIn</label>
        <input
          id="linkedin"
          name="linkedin"
          type="url"
          bind:value={linkedin}
          oninput={markDirty}
        />
      </div>

      <div class="form-group grid-full">
        <label for="github">GitHub</label>
        <input
          id="github"
          name="github"
          type="url"
          bind:value={github}
          oninput={markDirty}
        />
      </div>

      <div class="form-group grid-full">
        <label for="portfolio">Portfolio</label>
        <input
          id="portfolio"
          name="portfolio"
          type="url"
          bind:value={portfolio}
          oninput={markDirty}
        />
      </div>

      <div class="form-group grid-full">
        <label for="website">Website</label>
        <input
          id="website"
          name="website"
          type="url"
          bind:value={website}
          oninput={markDirty}
        />
      </div>

      <div class="form-group grid-full">
        <label for="twitter">Twitter / X</label>
        <input
          id="twitter"
          name="twitter"
          type="url"
          bind:value={twitter}
          oninput={markDirty}
        />
      </div>

      <div class="form-group grid-full">
        <label for="stackoverflow">Stack Overflow</label>
        <input
          id="stackoverflow"
          name="stackoverflow"
          type="url"
          bind:value={stackoverflow}
          oninput={markDirty}
        />
      </div>

      <div class="form-group grid-full">
        <label for="dribbble">Dribbble</label>
        <input
          id="dribbble"
          name="dribbble"
          type="url"
          bind:value={dribbble}
          oninput={markDirty}
        />
      </div>

      <div class="form-group grid-full">
        <label for="other">Other Link</label>
        <input
          id="other"
          name="other"
          type="text"
          bind:value={other}
          oninput={markDirty}
        />
      </div>
    </div>
  </fieldset>

  <fieldset class="profile-fieldset" aria-labelledby="workAuth-legend">
    <legend id="workAuth-legend">Work Authorization</legend>
    <div class="form-grid">
      <div class="form-group checkbox-row grid-full">
        <input
          id="authorizedToWork"
          type="checkbox"
          name="authorizedToWork"
          checked={authorizedToWork}
          onchange={(e) => {
            authorizedToWork = (e.target as HTMLInputElement).checked;
            markDirty();
          }}
        />
        <label for="authorizedToWork">Authorized to Work</label>
      </div>

      <div class="form-group">
        <label for="sponsorshipRequired">Sponsorship Required</label>
        <select
          id="sponsorshipRequired"
          name="sponsorshipRequired"
          bind:value={sponsorshipRequired}
          onchange={markDirty}
        >
          <option value="">None / Unspecified</option>
          <option value="none">None</option>
          <option value="now">Now</option>
          <option value="future">Future</option>
          <option value="now_or_future">Now or Future</option>
        </select>
      </div>

      <div class="form-group">
        <label for="workPermitType">Work Permit Type</label>
        <input
          id="workPermitType"
          name="workPermitType"
          type="text"
          bind:value={workPermitType}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="citizenship">Citizenship</label>
        <input
          id="citizenship"
          name="citizenship"
          type="text"
          bind:value={citizenship}
          oninput={markDirty}
        />
      </div>

      <div class="form-group checkbox-row grid-full">
        <input
          id="willingToRelocate"
          type="checkbox"
          name="willingToRelocate"
          checked={willingToRelocate}
          onchange={(e) => {
            willingToRelocate = (e.target as HTMLInputElement).checked;
            markDirty();
          }}
        />
        <label for="willingToRelocate">Willing to Relocate</label>
      </div>

      <div class="form-group checkbox-row grid-full">
        <input
          id="willingToTravel"
          type="checkbox"
          name="willingToTravel"
          checked={willingToTravel}
          onchange={(e) => {
            willingToTravel = (e.target as HTMLInputElement).checked;
            markDirty();
          }}
        />
        <label for="willingToTravel">Willing to Travel</label>
      </div>
    </div>
  </fieldset>

  <fieldset class="profile-fieldset" aria-labelledby="compensation-legend">
    <legend id="compensation-legend">Compensation</legend>
    <div class="form-grid">
      <div class="form-group">
        <label for="currency">Currency</label>
        <input
          id="currency"
          name="currency"
          type="text"
          bind:value={currency}
          oninput={markDirty}
          placeholder="USD"
        />
      </div>

      <div class="form-group">
        <label for="salaryPeriod">Salary Period</label>
        <select
          id="salaryPeriod"
          name="salaryPeriod"
          bind:value={salaryPeriod}
          onchange={markDirty}
        >
          <option value="">Select period</option>
          <option value="annual">Annual</option>
          <option value="monthly">Monthly</option>
          <option value="hourly">Hourly</option>
        </select>
      </div>

      <div class="form-group">
        <label for="desiredSalary">Desired Salary</label>
        <input
          id="desiredSalary"
          name="desiredSalary"
          type="number"
          bind:value={desiredSalary}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="minimumSalary">Minimum Salary</label>
        <input
          id="minimumSalary"
          name="minimumSalary"
          type="number"
          bind:value={minimumSalary}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="currentSalary">Current Salary</label>
        <input
          id="currentSalary"
          name="currentSalary"
          type="number"
          bind:value={currentSalary}
          oninput={markDirty}
        />
      </div>
    </div>
  </fieldset>

  <fieldset class="profile-fieldset" aria-labelledby="experience-legend">
    <legend id="experience-legend">Experience</legend>
    <div class="form-grid">
      <div class="form-group">
        <label for="currentCompany">Current Company</label>
        <input
          id="currentCompany"
          name="currentCompany"
          type="text"
          bind:value={currentCompany}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="currentTitle">Current Title</label>
        <input
          id="currentTitle"
          name="currentTitle"
          type="text"
          bind:value={currentTitle}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="yearsOfExperience">Years of Experience</label>
        <input
          id="yearsOfExperience"
          name="yearsOfExperience"
          type="number"
          bind:value={yearsOfExperience}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="highestDegree">Highest Degree</label>
        <input
          id="highestDegree"
          name="highestDegree"
          type="text"
          bind:value={highestDegree}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="university">University</label>
        <input
          id="university"
          name="university"
          type="text"
          bind:value={university}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="fieldOfStudy">Field of Study</label>
        <input
          id="fieldOfStudy"
          name="fieldOfStudy"
          type="text"
          bind:value={fieldOfStudy}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="graduationYear">Graduation Year</label>
        <input
          id="graduationYear"
          name="graduationYear"
          type="number"
          bind:value={graduationYear}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="noticePeriod">Notice Period</label>
        <input
          id="noticePeriod"
          name="noticePeriod"
          type="text"
          bind:value={noticePeriod}
          oninput={markDirty}
        />
      </div>

      <div class="form-group">
        <label for="availableStartDate">Available Start Date</label>
        <input
          id="availableStartDate"
          name="availableStartDate"
          type="text"
          bind:value={availableStartDate}
          oninput={markDirty}
          placeholder="YYYY-MM-DD"
        />
      </div>

      <div class="form-group grid-full">
        <label for="summary">Professional Summary</label>
        <textarea
          id="summary"
          name="summary"
          rows="4"
          bind:value={summary}
          oninput={markDirty}
        ></textarea>
      </div>
    </div>
  </fieldset>

  <div class="form-actions">
    <button
      type="submit"
      class="save-btn"
      disabled={!isDirty || isSaving}
    >
      {isSaving ? 'Saving...' : 'Save Profile'}
    </button>
    <button
      type="button"
      class="reset-btn"
      onclick={handleReset}
    >
      Reset / Reload
    </button>
  </div>
</form>

<style>
  .profile-form {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .profile-fieldset {
    background: #111;
    border: 1px solid #282828;
    border-radius: 6px;
    padding: 20px;
    margin-bottom: 20px;
    box-sizing: border-box;
  }

  legend {
    text-transform: uppercase;
    font-weight: 600;
    color: #eaeaea;
    font-size: 0.85rem;
    letter-spacing: 0.05em;
    padding: 0 6px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-top: 12px;
  }

  .grid-full {
    grid-column: 1 / -1;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group label {
    font-size: 0.85rem;
    color: #aaa;
    font-weight: 500;
  }

  input[type='text'],
  input[type='email'],
  input[type='tel'],
  input[type='url'],
  input[type='number'],
  select,
  textarea {
    background: #1a1a1a;
    border: 1px solid #333;
    color: #eaeaea;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 0.95rem;
    box-sizing: border-box;
    width: 100%;
    transition: border-color 0.15s ease;
  }

  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: #fff;
  }

  .checkbox-row {
    flex-direction: row;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    margin-top: 4px;
  }

  .checkbox-row input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: #2c7be5;
    cursor: pointer;
  }

  .checkbox-row label {
    cursor: pointer;
    color: #eaeaea;
    font-size: 0.9rem;
  }

  .form-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-top: 8px;
    margin-bottom: 24px;
  }

  .save-btn {
    background: #2c7be5;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 8px 18px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .save-btn:hover:not(:disabled) {
    background: #3a8ff5;
  }

  .save-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #222;
    color: #666;
  }

  .reset-btn {
    background: transparent;
    border: 1px solid #444;
    color: #aaa;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 0.95rem;
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease;
  }

  .reset-btn:hover {
    border-color: #888;
    color: #eaeaea;
  }
</style>
