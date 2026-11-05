<script lang="ts">
  import type { ProfileLinks } from '@/core/storage/storage';

  interface Props {
    links?: ProfileLinks | null;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    website?: string;
    twitter?: string;
    stackoverflow?: string;
    dribbble?: string;
    other?: string;
    onDirty?: () => void;
  }

  let {
    links,
    linkedin = $bindable(''),
    github = $bindable(''),
    portfolio = $bindable(''),
    website = $bindable(''),
    twitter = $bindable(''),
    stackoverflow = $bindable(''),
    dribbble = $bindable(''),
    other = $bindable(''),
    onDirty,
  }: Props = $props();
</script>

<fieldset class="profile-fieldset" aria-labelledby="links-legend">
  <legend id="links-legend" class="legend">Links</legend>
  <div class="form-grid">
    <div class="form-group grid-full">
      <label for="linkedin">LinkedIn</label>
      <input
        id="linkedin"
        name="linkedin"
        type="url"
        value={links?.linkedin ?? linkedin}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (links) links.linkedin = val;
          linkedin = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group grid-full">
      <label for="github">GitHub</label>
      <input
        id="github"
        name="github"
        type="url"
        value={links?.github ?? github}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (links) links.github = val;
          github = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group grid-full">
      <label for="portfolio">Portfolio</label>
      <input
        id="portfolio"
        name="portfolio"
        type="url"
        value={links?.portfolio ?? portfolio}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (links) links.portfolio = val;
          portfolio = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group grid-full">
      <label for="website">Website</label>
      <input
        id="website"
        name="website"
        type="url"
        value={links?.website ?? website}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (links) links.website = val;
          website = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group grid-full">
      <label for="twitter">Twitter / X</label>
      <input
        id="twitter"
        name="twitter"
        type="url"
        value={links?.twitter ?? twitter}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (links) links.twitter = val;
          twitter = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group grid-full">
      <label for="stackoverflow">Stack Overflow</label>
      <input
        id="stackoverflow"
        name="stackoverflow"
        type="url"
        value={links?.stackoverflow ?? stackoverflow}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (links) links.stackoverflow = val;
          stackoverflow = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group grid-full">
      <label for="dribbble">Dribbble</label>
      <input
        id="dribbble"
        name="dribbble"
        type="url"
        value={links?.dribbble ?? dribbble}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (links) links.dribbble = val;
          dribbble = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group grid-full">
      <label for="other">Other Link</label>
      <input
        id="other"
        name="other"
        type="text"
        value={links?.other ?? other}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (links) links.other = val;
          other = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>
  </div>
</fieldset>

<style>
  @import '/src/styles/tokens.css';
</style>
