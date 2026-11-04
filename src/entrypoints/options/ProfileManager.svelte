<script lang="ts">
  function getTextField(data: FormData, field: string): string | null {
    const value = data.get(field);
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  function getLocationFromFormData(data: FormData): ProfileLocation | null {
    const addressLine1 = getTextField(data, 'addressLine1');
    const addressLine2 = getTextField(data, 'addressLine2');
    const city = getTextField(data, 'city');
    const state = getTextField(data, 'state');
    const postalCode = getTextField(data, 'postalCode');
    const country = getTextField(data, 'country');
    const countryCode = getTextField(data, 'countryCode');

    if (!addressLine1 && !city && !postalCode && !country) {
      return null;
    }

    return {
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      countryCode,
    };
  }

  function getLinksFromFormData(data: FormData): ProfileLinks | null {
    const linkedin = getTextField(data, 'linkedin');
    const github = getTextField(data, 'github');
    const portfolio = getTextField(data, 'portfolio');
    const website = getTextField(data, 'website');
    const twitter = getTextField(data, 'twitter');
    const stackoverflow = getTextField(data, 'stackoverflow');
    const dribbble = getTextField(data, 'dribbble');
    const other = getTextField(data, 'other');

    const hasAny = [linkedin, github, portfolio, website, twitter, stackoverflow, dribbble, other].some(
      (v) => v,
    );

    if (!hasAny) {
      return null;
    }

    return { linkedin, github, portfolio, website, twitter, stackoverflow, dribbble, other };
  }

  function getWorkAuthFromFormData(data: FormData): WorkAuthorization | null {
    const authorizedToWork = data.get('authorizedToWork') === 'on';
    const sponsorshipRequired = data.get('sponsorshipRequired') as
      | 'none' | 'now' | 'future' | 'now_or_future'
      | undefined;
    const workPermitType = getTextField(data, 'workPermitType');
    const citizenship = getTextField(data, 'citizenship');
    const willingToRelocate = data.get('willingToRelocate') === 'on';
    const willingToTravel = data.get('willingToTravel') === 'on';

    const hasAny = [authorizedToWork, sponsorshipRequired, workPermitType, citizenship, willingToRelocate, willingToTravel].some(
      (v) => v !== undefined && v !== null,
    );

    if (!hasAny) {
      return null;
    }

    return { authorizedToWork, sponsorshipRequired, workPermitType, citizenship, willingToRelocate, willingToTravel };
  }

  function getCompensationFromFormData(data: FormData): Compensation | null {
    const currency = getTextField(data, 'currency');
    const desiredSalary = getTextField(data, 'desiredSalary');
    const minimumSalary = getTextField(data, 'minimumSalary');
    const currentSalary = getTextField(data, 'currentSalary');
    const salaryPeriod = data.get('salaryPeriod') as 'annual' | 'monthly' | 'hourly' | undefined;

    const hasAny = [currency, desiredSalary, minimumSalary, currentSalary, salaryPeriod].some(
      (v) => v,
    );

    if (!hasAny) {
      return null;
    }

    return {
      currency,
      desiredSalary: desiredSalary ? Number(desiredSalary) : undefined,
      minimumSalary: minimumSalary ? Number(minimumSalary) : undefined,
      currentSalary: currentSalary ? Number(currentSalary) : undefined,
      salaryPeriod,
    };
  }

  function getExperienceFromFormData(data: FormData): Experience | null {
    const currentCompany = getTextField(data, 'currentCompany');
    const currentTitle = getTextField(data, 'currentTitle');
    const yearsOfExperience = getTextField(data, 'yearsOfExperience');
    const highestDegree = getTextField(data, 'highestDegree');
    const university = getTextField(data, 'university');
    const fieldOfStudy = getTextField(data, 'fieldOfStudy');
    const graduationYear = getTextField(data, 'graduationYear');
    const noticePeriod = getTextField(data, 'noticePeriod');
    const availableStartDate = getTextField(data, 'availableStartDate');
    const summary = getTextField(data, 'summary');

    const hasAny = [
      currentCompany,
      currentTitle,
      yearsOfExperience,
      highestDegree,
      university,
      fieldOfStudy,
      graduationYear,
      noticePeriod,
      availableStartDate,
      summary,
    ].some((v) => v);

    if (!hasAny) {
      return null;
    }

    return {
      currentCompany,
      currentTitle,
      yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
      highestDegree,
      university,
      fieldOfStudy,
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      noticePeriod,
      availableStartDate,
      summary,
    };
  }

  import { onMount } from 'svelte';
  import { getProfile, setProfile } from '@/core/storage/storage';
  import { showToast } from '@/lib/toastStore';
  import type { Profile, ProfileLocation, ProfileLinks, WorkAuthorization, Compensation, Experience } from '@/core/storage/storage';

  let profile: Profile | null = null;

  // Local state variables for form binding
  let name: string = '';
  let firstName: string = '';
  let middleName: string = '';
  let lastName: string = '';
  let preferredName: string = '';
  let pronouns: string = '';
  let email: string = '';
  let alternateEmail: string = '';
  let phone: string = '';
  let alternatePhone: string = '';

  let addressLine1: string = '';
  let addressLine2: string = '';
  let city: string = '';
  let state: string = '';
  let postalCode: string = '';
  let country: string = '';
  let countryCode: string = '';

  let linkedin: string = '';
  let github: string = '';
  let portfolio: string = '';
  let website: string = '';
  let twitter: string = '';
  let stackoverflow: string = '';
  let dribbble: string = '';
  let other: string = '';

  let authorizedToWork: boolean = false;
  let sponsorshipRequired: string | undefined;
  let workPermitType: string = '';
  let citizenship: string = '';
  let willingToRelocate: boolean = false;
  let willingToTravel: boolean = false;

  let currency: string = '';
  let desiredSalary: string = '';
  let minimumSalary: string = '';
  let currentSalary: string = '';
  let salaryPeriod: string = '';

  let currentCompany: string = '';
  let currentTitle: string = '';
  let yearsOfExperience: string = '';
  let highestDegree: string = '';
  let university: string = '';
  let fieldOfStudy: string = '';
  let graduationYear: string = '';
  let noticePeriod: string = '';
  let availableStartDate: string = '';
  let summary: string = '';

  onMount(async () => {
    profile = await getProfile();
    if (profile) {
      name = profile.name;
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
      sponsorshipRequired = profile.workAuthorization?.sponsorshipRequired;
      workPermitType = profile.workAuthorization?.workPermitType ?? '';
      citizenship = profile.workAuthorization?.citizenship ?? '';
      willingToRelocate = profile.workAuthorization?.willingToRelocate ?? false;
      willingToTravel = profile.workAuthorization?.willingToTravel ?? false;

      currency = profile.compensation?.currency ?? '';
      desiredSalary = profile.compensation?.desiredSalary ?? '';
      minimumSalary = profile.compensation?.minimumSalary ?? '';
      currentSalary = profile.compensation?.currentSalary ?? '';
      salaryPeriod = profile.compensation?.salaryPeriod ?? '';

      currentCompany = profile.experience?.currentCompany ?? '';
      currentTitle = profile.experience?.currentTitle ?? '';
      yearsOfExperience = profile.experience?.yearsOfExperience ?? '';
      highestDegree = profile.experience?.highestDegree ?? '';
      university = profile.experience?.university ?? '';
      fieldOfStudy = profile.experience?.fieldOfStudy ?? '';
      graduationYear = profile.experience?.graduationYear ?? '';
      noticePeriod = profile.experience?.noticePeriod ?? '';
      availableStartDate = profile.experience?.availableStartDate ?? '';
      summary = profile.experience?.summary ?? '';
    }
  });

  function syncProfileFromForm() {
    profile = {
      name,
      firstName,
      middleName,
      lastName,
      preferredName,
      pronouns,
      email,
      alternateEmail,
      phone,
      alternatePhone,
      location: addressLine1 || city || postalCode || country
        ? { addressLine1, addressLine2, city, state, postalCode, country, countryCode }
        : undefined,
      links: linkedin || github || portfolio || website || twitter || stackoverflow || dribbble || other
        ? { linkedin, github, portfolio, website, twitter, stackoverflow, dribbble, other }
        : undefined,
      workAuthorization: {
        authorizedToWork,
        sponsorshipRequired,
        workPermitType,
        citizenship,
        willingToRelocate,
        willingToTravel,
      },
      compensation: {
        currency,
        desiredSalary: desiredSalary ? Number(desiredSalary) : undefined,
        minimumSalary: minimumSalary ? Number(minimumSalary) : undefined,
        currentSalary: currentSalary ? Number(currentSalary) : undefined,
        salaryPeriod,
      },
      experience: {
        currentCompany,
        currentTitle,
        yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
        highestDegree,
        university,
        fieldOfStudy,
        graduationYear: graduationYear ? Number(graduationYear) : undefined,
        noticePeriod,
        availableStartDate,
        summary,
      },
    };
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }
    const data = new FormData(form);

    name = getTextField(data, 'name') || '';
    firstName = getTextField(data, 'firstName');
    middleName = getTextField(data, 'middleName');
    lastName = getTextField(data, 'lastName');
    preferredName = getTextField(data, 'preferredName');
    pronouns = getTextField(data, 'pronouns');
    email = getTextField(data, 'email');
    alternateEmail = getTextField(data, 'alternateEmail');
    phone = getTextField(data, 'phone');
    alternatePhone = getTextField(data, 'alternatePhone');

    const location = getLocationFromFormData(data);
    if (location) {
      addressLine1 = location.addressLine1;
      addressLine2 = location.addressLine2;
      city = location.city;
      state = location.state;
      postalCode = location.postalCode;
      country = location.country;
      countryCode = location.countryCode;
    }

    const links = getLinksFromFormData(data);
    if (links) {
      linkedin = links.linkedin;
      github = links.github;
      portfolio = links.portfolio;
      website = links.website;
      twitter = links.twitter;
      stackoverflow = links.stackoverflow;
      dribbble = links.dribbble;
      other = links.other;
    }

    const workAuth = getWorkAuthFromFormData(data);
    if (workAuth) {
      authorizedToWork = workAuth.authorizedToWork;
      sponsorshipRequired = workAuth.sponsorshipRequired;
      workPermitType = workAuth.workPermitType;
      citizenship = workAuth.citizenship;
      willingToRelocate = workAuth.willingToRelocate;
      willingToTravel = workAuth.willingToTravel;
    }

    const compensation = getCompensationFromFormData(data);
    if (compensation) {
      currency = compensation.currency;
      desiredSalary = compensation.desiredSalary ? String(compensation.desiredSalary) : '';
      minimumSalary = compensation.minimumSalary ? String(compensation.minimumSalary) : '';
      currentSalary = compensation.currentSalary ? String(compensation.currentSalary) : '';
      salaryPeriod = compensation.salaryPeriod ?? '';
    }

    const experience = getExperienceFromFormData(data);
    if (experience) {
      currentCompany = experience.currentCompany;
      currentTitle = experience.currentTitle;
      yearsOfExperience = experience.yearsOfExperience ? String(experience.yearsOfExperience) : '';
      highestDegree = experience.highestDegree;
      university = experience.university;
      fieldOfStudy = experience.fieldOfStudy;
      graduationYear = experience.graduationYear ? String(experience.graduationYear) : '';
      noticePeriod = experience.noticePeriod;
      availableStartDate = experience.availableStartDate;
      summary = experience.summary;
    }

    syncProfileFromForm();

    await setProfile(profile!);
    showToast('Profile saved successfully', 'success');
  }
</script>

<form onsubmit={handleSubmit} class="profile-form">
  <fieldset class="profile-fieldset" aria-labelledby="identity-legend">
    <legend id="identity-legend">Identity</legend>

    <div class="form-group">
      <label for="name">Name</label>
      <input
        id="name"
        name="name"
        type="text"
        bind:value={name}
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
      />
    </div>

    <div class="form-group">
      <label for="middleName">Middle Name</label>
      <input
        id="middleName"
        name="middleName"
        type="text"
        bind:value={middleName}
      />
    </div>

    <div class="form-group">
      <label for="lastName">Last Name</label>
      <input
        id="lastName"
        name="lastName"
        type="text"
        bind:value={lastName}
      />
    </div>

    <div class="form-group">
      <label for="preferredName">Preferred Name</label>
      <input
        id="preferredName"
        name="preferredName"
        type="text"
        bind:value={preferredName}
      />
    </div>

    <div class="form-group">
      <label for="pronouns">Pronouns</label>
      <input
        id="pronouns"
        name="pronouns"
        type="text"
        bind:value={pronouns}
      />
    </div>
  </fieldset>

  <fieldset class="profile-fieldset" aria-labelledby="contact-legend">
    <legend id="contact-legend">Contact</legend>

    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        bind:value={email}
      />
    </div>

    <div class="form-group">
      <label for="alternateEmail">Alternate Email</label>
      <input
        id="alternateEmail"
        name="alternateEmail"
        type="email"
        bind:value={alternateEmail}
      />
    </div>

    <div class="form-group">
      <label for="phone">Phone</label>
      <input
        id="phone"
        name="phone"
        type="tel"
        bind:value={phone}
      />
    </div>

    <div class="form-group">
      <label for="alternatePhone">Alternate Phone</label>
      <input
        id="alternatePhone"
        name="alternatePhone"
        type="tel"
        bind:value={alternatePhone}
      />
    </div>
  </fieldset>

  <fieldset class="profile-fieldset" aria-labelledby="location-legend">
    <legend id="location-legend">Location</legend>

    <div class="form-group">
      <label for="addressLine1">Address Line 1</label>
      <input
        id="addressLine1"
        name="addressLine1"
        type="text"
        bind:value={addressLine1}
      />
    </div>

    <div class="form-group">
      <label for="addressLine2">Address Line 2</label>
      <input
        id="addressLine2"
        name="addressLine2"
        type="text"
        bind:value={addressLine2}
      />
    </div>

    <div class="form-group">
      <label for="city">City</label>
      <input
        id="city"
        name="city"
        type="text"
        bind:value={city}
      />
    </div>

    <div class="form-group">
      <label for="state">State</label>
      <input
        id="state"
        name="state"
        type="text"
        bind:value={state}
      />
    </div>

    <div class="form-group">
      <label for="postalCode">Postal Code</label>
      <input
        id="postalCode"
        name="postalCode"
        type="text"
        bind:value={postalCode}
      />
    </div>

    <div class="form-group">
      <label for="country">Country</label>
      <input
        id="country"
        name="country"
        type="text"
        bind:value={country}
      />
    </div>

    <div class="form-group">
      <label for="countryCode">Country Code</label>
      <input
        id="countryCode"
        name="countryCode"
        type="text"
        bind:value={countryCode}
      />
    </div>
  </fieldset>

  <fieldset class="profile-fieldset" aria-labelledby="links-legend">
    <legend id="links-legend">Links</legend>

    <div class="form-group">
      <label for="linkedin">LinkedIn</label>
      <input
        id="linkedin"
        name="linkedin"
        type="url"
        bind:value={linkedin}
      />
    </div>

    <div class="form-group">
      <label for="github">GitHub</label>
      <input
        id="github"
        name="github"
        type="url"
        bind:value={github}
      />
    </div>

    <div class="form-group">
      <label for="portfolio">Portfolio</label>
      <input
        id="portfolio"
        name="portfolio"
        type="url"
        bind:value={portfolio}
      />
    </div>

    <div class="form-group">
      <label for="website">Website</label>
      <input
        id="website"
        name="website"
        type="url"
        bind:value={website}
      />
    </div>

    <div class="form-group">
      <label for="twitter">Twitter</label>
      <input
        id="twitter"
        name="twitter"
        type="url"
        bind:value={twitter}
      />
    </div>

    <div class="form-group">
      <label for="stackoverflow">Stack Overflow</label>
      <input
        id="stackoverflow"
        name="stackoverflow"
        type="url"
        bind:value={stackoverflow}
      />
    </div>

    <div class="form-group">
      <label for="dribbble">Dribbble</label>
      <input
        id="dribbble"
        name="dribbble"
        type="url"
        bind:value={dribbble}
      />
    </div>

    <div class="form-group">
      <label for="other">Other</label>
      <input
        id="other"
        name="other"
        type="text"
        bind:value={other}
      />
    </div>
  </fieldset>

  <fieldset class="profile-fieldset" aria-labelledby="workAuth-legend">
    <legend id="workAuth-legend">Work Authorization</legend>

    <div class="form-group">
<input
        type="checkbox"
        name="authorizedToWork"
        bind:checked={authorizedToWork}
/>

      <span>Authorized to Work</span>
    </div>

    <div class="form-group">
      <label for="sponsorshipRequired">Sponsorship Required</label>
      <select
        id="sponsorshipRequired"
        name="sponsorshipRequired"
        bind:value={sponsorshipRequired}
      >
        <option value="">None</option>
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
      />
    </div>

    <div class="form-group">
      <label for="citizenship">Citizenship</label>
      <input
        id="citizenship"
        name="citizenship"
        type="text"
        bind:value={citizenship}
      />
    </div>

    <div class="form-group">
      <input type="checkbox" />
      <span>Willing to Relocate</span>
    </div>

    <div class="form-group">
      <input type="checkbox" />
      <span>Willing to Travel</span>
    </div>
  </fieldset>

  <fieldset class="profile-fieldset" aria-labelledby="compensation-legend">
    <legend id="compensation-legend">Compensation</legend>

    <div class="form-group">
      <label for="currency">Currency</label>
      <input
        id="currency"
        name="currency"
        type="text"
        bind:value={currency}
      />
    </div>

    <div class="form-group">
      <label for="desiredSalary">Desired Salary</label>
      <input
        id="desiredSalary"
        name="desiredSalary"
        type="number"
        bind:value={desiredSalary}
      />
    </div>

    <div class="form-group">
      <label for="minimumSalary">Minimum Salary</label>
      <input
        id="minimumSalary"
        name="minimumSalary"
        type="number"
        bind:value={minimumSalary}
      />
    </div>

    <div class="form-group">
      <label for="currentSalary">Current Salary</label>
      <input
        id="currentSalary"
        name="currentSalary"
        type="number"
        bind:value={currentSalary}
      />
    </div>

    <div class="form-group">
      <label for="salaryPeriod">Salary Period</label>
      <select
        id="salaryPeriod"
        name="salaryPeriod"
        bind:value={salaryPeriod}
      >
        <option value="">Select period</option>
        <option value="annual">Annual</option>
        <option value="monthly">Monthly</option>
        <option value="hourly">Hourly</option>
      </select>
    </div>
  </fieldset>

  <fieldset class="profile-fieldset" aria-labelledby="experience-legend">
    <legend id="experience-legend">Experience</legend>

    <div class="form-group">
      <label for="currentCompany">Current Company</label>
      <input
        id="currentCompany"
        name="currentCompany"
        type="text"
        bind:value={currentCompany}
      />
    </div>

    <div class="form-group">
      <label for="currentTitle">Current Title</label>
      <input
        id="currentTitle"
        name="currentTitle"
        type="text"
        bind:value={currentTitle}
      />
    </div>

    <div class="form-group">
      <label for="yearsOfExperience">Years of Experience</label>
      <input
        id="yearsOfExperience"
        name="yearsOfExperience"
        type="number"
        bind:value={yearsOfExperience}
      />
    </div>

    <div class="form-group">
      <label for="highestDegree">Highest Degree</label>
      <input
        id="highestDegree"
        name="highestDegree"
        type="text"
        bind:value={highestDegree}
      />
    </div>

    <div class="form-group">
      <label for="university">University</label>
      <input
        id="university"
        name="university"
        type="text"
        bind:value={university}
      />
    </div>

    <div class="form-group">
      <label for="fieldOfStudy">Field of Study</label>
      <input
        id="fieldOfStudy"
        name="fieldOfStudy"
        type="text"
        bind:value={fieldOfStudy}
      />
    </div>

    <div class="form-group">
      <label for="graduationYear">Graduation Year</label>
      <input
        id="graduationYear"
        name="graduationYear"
        type="number"
        bind:value={graduationYear}
      />
    </div>

    <div class="form-group">
      <label for="noticePeriod">Notice Period</label>
      <input
        id="noticePeriod"
        name="noticePeriod"
        type="text"
        bind:value={noticePeriod}
      />
    </div>

    <div class="form-group">
      <label for="availableStartDate">Available Start Date</label>
      <input
        id="availableStartDate"
        name="availableStartDate"
        type="text"
        bind:value={availableStartDate}
      />
    </div>

    <div class="form-group">
      <label for="summary">Summary</label>
      <textarea
        id="summary"
        name="summary"
        rows="3"
        bind:value={summary}
      ></textarea>
    </div>
  </fieldset>

  <div class="form-actions">
    <button type="submit" class="save-btn">Save Profile</button>
  </div>
</form>