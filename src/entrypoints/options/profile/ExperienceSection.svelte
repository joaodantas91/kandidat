<script lang="ts">
  import type { Experience } from '@/core/storage/storage';

  interface Props {
    experience?: Experience | null;
    currentCompany?: string;
    currentTitle?: string;
    yearsOfExperience?: number | string;
    highestDegree?: string;
    university?: string;
    fieldOfStudy?: string;
    graduationYear?: number | string;
    noticePeriod?: string;
    availableStartDate?: string;
    summary?: string;
    onDirty?: () => void;
  }

  let {
    experience,
    currentCompany = $bindable(''),
    currentTitle = $bindable(''),
    yearsOfExperience = $bindable(''),
    highestDegree = $bindable(''),
    university = $bindable(''),
    fieldOfStudy = $bindable(''),
    graduationYear = $bindable(''),
    noticePeriod = $bindable(''),
    availableStartDate = $bindable(''),
    summary = $bindable(''),
    onDirty,
  }: Props = $props();
</script>

<fieldset class="profile-fieldset" aria-labelledby="experience-legend">
  <legend id="experience-legend" class="legend">Experience</legend>
  <div class="form-grid">
    <div class="form-group">
      <label for="currentCompany">Current Company</label>
      <input
        id="currentCompany"
        name="currentCompany"
        type="text"
        value={experience?.currentCompany ?? currentCompany}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (experience) experience.currentCompany = val;
          currentCompany = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="currentTitle">Current Title</label>
      <input
        id="currentTitle"
        name="currentTitle"
        type="text"
        value={experience?.currentTitle ?? currentTitle}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (experience) experience.currentTitle = val;
          currentTitle = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="yearsOfExperience">Years of Experience</label>
      <input
        id="yearsOfExperience"
        name="yearsOfExperience"
        type="number"
        value={experience?.yearsOfExperience !== undefined
          ? String(experience.yearsOfExperience)
          : yearsOfExperience}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (experience) experience.yearsOfExperience = val ? Number(val) : undefined;
          yearsOfExperience = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="highestDegree">Highest Degree</label>
      <input
        id="highestDegree"
        name="highestDegree"
        type="text"
        value={experience?.highestDegree ?? highestDegree}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (experience) experience.highestDegree = val;
          highestDegree = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="university">University</label>
      <input
        id="university"
        name="university"
        type="text"
        value={experience?.university ?? university}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (experience) experience.university = val;
          university = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="fieldOfStudy">Field of Study</label>
      <input
        id="fieldOfStudy"
        name="fieldOfStudy"
        type="text"
        value={experience?.fieldOfStudy ?? fieldOfStudy}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (experience) experience.fieldOfStudy = val;
          fieldOfStudy = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="graduationYear">Graduation Year</label>
      <input
        id="graduationYear"
        name="graduationYear"
        type="number"
        value={experience?.graduationYear !== undefined
          ? String(experience.graduationYear)
          : graduationYear}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (experience) experience.graduationYear = val ? Number(val) : undefined;
          graduationYear = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="noticePeriod">Notice Period</label>
      <input
        id="noticePeriod"
        name="noticePeriod"
        type="text"
        value={experience?.noticePeriod ?? noticePeriod}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (experience) experience.noticePeriod = val;
          noticePeriod = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="availableStartDate">Available Start Date</label>
      <input
        id="availableStartDate"
        name="availableStartDate"
        type="text"
        value={experience?.availableStartDate ?? availableStartDate}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (experience) experience.availableStartDate = val;
          availableStartDate = val;
          onDirty?.();
        }}
        placeholder="YYYY-MM-DD"
        class="input-field"
      />
    </div>

    <div class="form-group grid-full">
      <label for="summary">Professional Summary</label>
      <textarea
        id="summary"
        name="summary"
        rows="4"
        value={experience?.summary ?? summary}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLTextAreaElement).value;
          if (experience) experience.summary = val;
          summary = val;
          onDirty?.();
        }}
        class="input-field"
      ></textarea>
    </div>
  </div>
</fieldset>

<style>
  @import '/src/styles/tokens.css';
</style>
