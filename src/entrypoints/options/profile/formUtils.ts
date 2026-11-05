import type {
  Profile,
  ProfileLocation,
  ProfileLinks,
  WorkAuthorization,
  Compensation,
  Experience,
} from '@/core/storage/storage';

export function getTextField(data: FormData, field: string): string | null {
  const value = data.get(field);
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function getLocationFromFormData(data: FormData): ProfileLocation | null {
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

export function getLinksFromFormData(data: FormData): ProfileLinks | null {
  const linkedinVal = getTextField(data, 'linkedin');
  const githubVal = getTextField(data, 'github');
  const portfolioVal = getTextField(data, 'portfolio');
  const websiteVal = getTextField(data, 'website');
  const twitterVal = getTextField(data, 'twitter');
  const stackoverflowVal = getTextField(data, 'stackoverflow');
  const dribbbleVal = getTextField(data, 'dribbble');
  const otherVal = getTextField(data, 'other');

  const hasAny = [
    linkedinVal,
    githubVal,
    portfolioVal,
    websiteVal,
    twitterVal,
    stackoverflowVal,
    dribbbleVal,
    otherVal,
  ].some((v) => v);

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

export function getWorkAuthFromFormData(data: FormData): WorkAuthorization | null {
  const authorizedToWorkVal = data.get('authorizedToWork') === 'on';
  const sponsorshipRequiredRaw = data.get('sponsorshipRequired');
  const sponsorshipRequiredVal =
    sponsorshipRequiredRaw === 'none' ||
    sponsorshipRequiredRaw === 'now' ||
    sponsorshipRequiredRaw === 'future' ||
    sponsorshipRequiredRaw === 'now_or_future'
      ? sponsorshipRequiredRaw
      : undefined;
  const workPermitTypeVal = getTextField(data, 'workPermitType');
  const citizenshipVal = getTextField(data, 'citizenship');
  const willingToRelocateVal = data.get('willingToRelocate') === 'on';
  const willingToTravelVal = data.get('willingToTravel') === 'on';

  const hasAny = [
    authorizedToWorkVal,
    sponsorshipRequiredVal,
    workPermitTypeVal,
    citizenshipVal,
    willingToRelocateVal,
    willingToTravelVal,
  ].some((v) => v !== undefined && v !== null && v !== false && v !== '');

  if (!hasAny) {
    return null;
  }

  return {
    authorizedToWork: authorizedToWorkVal,
    sponsorshipRequired: sponsorshipRequiredVal,
    workPermitType: workPermitTypeVal ?? undefined,
    citizenship: citizenshipVal ?? undefined,
    willingToRelocate: willingToRelocateVal,
    willingToTravel: willingToTravelVal,
  };
}

export function getCompensationFromFormData(data: FormData): Compensation | null {
  const currencyVal = getTextField(data, 'currency');
  const desiredSalaryVal = getTextField(data, 'desiredSalary');
  const minimumSalaryVal = getTextField(data, 'minimumSalary');
  const currentSalaryVal = getTextField(data, 'currentSalary');
  const salaryPeriodRaw = data.get('salaryPeriod');
  const salaryPeriodVal =
    salaryPeriodRaw === 'annual' || salaryPeriodRaw === 'monthly' || salaryPeriodRaw === 'hourly'
      ? salaryPeriodRaw
      : undefined;

  const hasAny = [
    currencyVal,
    desiredSalaryVal,
    minimumSalaryVal,
    currentSalaryVal,
    salaryPeriodVal,
  ].some((v) => v);

  if (!hasAny) {
    return null;
  }

  return {
    currency: currencyVal ?? undefined,
    desiredSalary: desiredSalaryVal ? Number(desiredSalaryVal) : undefined,
    minimumSalary: minimumSalaryVal ? Number(minimumSalaryVal) : undefined,
    currentSalary: currentSalaryVal ? Number(currentSalaryVal) : undefined,
    salaryPeriod: salaryPeriodVal,
  };
}

export function getExperienceFromFormData(data: FormData): Experience | null {
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

export function parseProfileFormData(data: FormData): Profile {
  const name = getTextField(data, 'name') || '';
  const firstName = getTextField(data, 'firstName') ?? undefined;
  const middleName = getTextField(data, 'middleName') ?? undefined;
  const lastName = getTextField(data, 'lastName') ?? undefined;
  const preferredName = getTextField(data, 'preferredName') ?? undefined;
  const pronouns = getTextField(data, 'pronouns') ?? undefined;
  const email = getTextField(data, 'email') ?? undefined;
  const alternateEmail = getTextField(data, 'alternateEmail') ?? undefined;
  const phone = getTextField(data, 'phone') ?? undefined;
  const alternatePhone = getTextField(data, 'alternatePhone') ?? undefined;

  const location = getLocationFromFormData(data) ?? undefined;
  const links = getLinksFromFormData(data) ?? undefined;
  const workAuthorization = getWorkAuthFromFormData(data) ?? undefined;
  const compensation = getCompensationFromFormData(data) ?? undefined;
  const experience = getExperienceFromFormData(data) ?? undefined;

  return {
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
    location,
    links,
    workAuthorization,
    compensation,
    experience,
  };
}
