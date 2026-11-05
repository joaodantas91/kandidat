# Kandidat Project Backlog

Autonomous task queue. The agent picks the first uncompleted task `[ ]`, implements it, verifies that tests pass (`bunx vitest run` and `bun run check`), and marks it completed `[x]`.

---

## Active Queue

- [x] **TASK-01: Connect "Fill" button in Popup to Content Script**
  - **Goal:** Clicking the "Fill" button in `src/lib/home.svelte` sends message (`AUTO_FILL`) to the active browser tab.
  - **Files:** `src/lib/home.svelte`, `src/entrypoints/content.ts`.
  - **Criteria:** Active tab is queried via `browser.tabs.query`, message sent via `browser.tabs.sendMessage(tab.id, 'AUTO_FILL')`. Handled cleanly in `content.ts`.

- [x] **TASK-02: Pre-populate Popup Profile Form on Open**
  - **Goal:** When opening popup, if profile data exists in storage (`getProfile()`), populate form inputs so user sees saved data.
  - **Files:** `src/lib/ProfileForm.svelte` (or `src/lib/profile.svelte`).
  - **Criteria:** Runs on mount. Clean fallback if storage is empty.

- [x] **TASK-03: Extend Autofill Core to Textarea and Select Elements**
  - **Goal:** Support multiline inputs and dropdowns (`HTMLTextAreaElement`, `HTMLSelectElement`) using appropriate prototype setters.
  - **Files:** `src/core/autofill/autofill.ts`, `src/core/autofill/autofill.test.ts`.
  - **Criteria:** Unit tests in vitest pass for textarea and select elements.

- [x] **TASK-04: LinkedIn Clean Job Feed Filter Integration**
  - **Goal:** Content script on LinkedIn job search that hides spam/outsourcing listings.
  - **Files:** `src/entrypoints/linkedin.content.ts`.
  - **Criteria:** Basic DOM filtering with clean error boundaries.

- [x] **TASK-05: Options Page with Customizable Keyword Filters & Profile Settings**
  - **Goal:** Provide a dedicated Options page in Svelte 5 for Kandidat where users can view and customize blacklist keywords for job filtering and manage advanced settings.
  - **Files:** `src/entrypoints/options/index.html`, `src/entrypoints/options/main.ts`, `src/entrypoints/options/Options.svelte`, `src/core/storage/settings.ts`.
  - **Criteria:** `wxt build` compiles options page cleanly; default blacklist keywords are loaded with fallback; vitest tests pass.

- [x] **TASK-06: AI Question Answerer Core Module (LiteLLM Integration)**
  - **Goal:** Create core module for querying LiteLLM local proxy (`http://localhost:4000/v1`) with job application prompt and candidate experience context.
  - **Files:** `src/core/ai/answerer.ts`, `src/core/ai/answerer.test.ts`.
  - **Criteria:** Unit tests with mocked fetch pass with exit code 0.

- [x] **TASK-07: Heuristic Field Detector for Candidate Profile Keys**
  - **Goal:** Scan the active page for `<input>`, `<textarea>` and `<select>` elements matching candidate profile fields (`fullName`, `email`, `phone`, `linkedin`) in a single pass.
  - **Files:** `src/core/autofill/fieldDetector.ts`, `src/core/autofill/fieldDetector.test.ts`.
  - **Criteria:** Unit tests pass with synthetic DOM fixtures; returns typed element map.

- [x] **TASK-08: Floating "Fill Profile" Action Button for ATS Portals**
  - **Goal:** Inject a clean, isolated floating button into supported ATS portals (Lever, Greenhouse, Workday) triggering autofill.
  - **Files:** `src/entrypoints/floating.content.ts`.
  - **Criteria:** Mutation-safe injection that does not conflict with host styles.

---

## Scout Discovery — ATS & Candidate Workflows (2026-11-04)

- [x] **TASK-09: ATS Platform Detection and Adapter Contract**
  - **Goal:** From page URL + DOM, detect whether the active page is Lever, Greenhouse, or Workday and return a typed adapter; unknown pages return `null` so the extension no-ops.
  - **Files:** `src/core/ats/types.ts`, `src/core/ats/platform.ts`, `src/core/ats/platform.test.ts`.
  - **Criteria:** Vitest covers `jobs.lever.co/<org>/<uuid>/apply`, `job-boards.greenhouse.io/<org>/jobs/<id>`, and `<tenant>.myworkdayjobs.com/...`; returns `null` for unrelated sites; no new manifest permissions.

- [x] **TASK-SEC-01: Sentinel Remediation — Guard Existing User Input & Scope Manifest Matches**
  - **Goal:** Resolve Sentinel audit findings: skip non-empty form inputs in `autofill.ts` so user-typed data is never overwritten; restrict content script `matches` in `wxt.config.ts` from `<all_urls>` to supported ATS job platforms.
  - **Files:** `src/core/autofill/autofill.ts`, `src/core/autofill/autofill.test.ts`, `wxt.config.ts`, `AUDIT.md`.
  - **Criteria:** Tests verify existing values are preserved; Sentinel marks issue resolved in `AUDIT.md`.

- [x] **TASK-10: Greenhouse Identity Adapter (Split Name + LinkedIn Question)**
  - **Goal:** Fill Greenhouse's `#first_name`, `#last_name`, `#email`, `#phone`, and LinkedIn question field from the saved profile, deriving first/last from `Profile.name`.
  - **Files:** `src/core/ats/greenhouse.ts`, `src/core/ats/greenhouse.test.ts`, `tests/fixtures/greenhouse-form.html`.
  - **Criteria:** Fixture-based tests fill the identity fields via native setters with bubbling `input`/`change` events; unrecognized custom `question_*` fields are left untouched; full suite passes.

- [x] **TASK-11: Lever Identity Adapter**
  - **Goal:** Fill Lever's `#application-form` fields `name`, `email`, `phone`, `org`, and `urls[LinkedIn]` from the saved profile.
  - **Files:** `src/core/ats/lever.ts`, `src/core/ats/lever.test.ts`, `tests/fixtures/lever-form.html`.
  - **Criteria:** Fixture tests fill the five named fields; custom `.application-question` fields are left untouched; native setter path verified; full suite passes.

- [x] **TASK-12: Workday "My Information" Step Adapter**
  - **Goal:** Fill only the visible Workday My Information step (legal name, email, phone) using `data-automation-id` selectors; never click Next, Save, or Submit.
  - **Files:** `src/core/ats/workday.ts`, `src/core/ats/workday.test.ts`, `tests/fixtures/workday-my-information.html`.
  - **Criteria:** Fixture tests map `legalNameSection_firstName`, `legalNameSection_lastName`, `email`, and `phone-number`; adapter no-ops when the step is absent; no navigation or submit calls.

- [x] **TASK-REFACTOR-01: Shared DOM Setter & Name Utilities (PONYTAIL Rung 2)**
  - **Goal:** Extract duplicated `setInputValue`, `getNativeSetter`, and `splitName` from `src/core/ats/{lever,greenhouse,workday}.ts` and `src/core/autofill/autofill.ts` into a single shared utility module (`src/core/dom/setter.ts`).
  - **Files:** `src/core/dom/setter.ts`, `src/core/dom/setter.test.ts`, `src/core/ats/lever.ts`, `src/core/ats/greenhouse.ts`, `src/core/ats/workday.ts`, `src/core/autofill/autofill.ts`.
  - **Criteria:** All existing 112 Vitest tests pass with exit code 0. Zero code duplication in value setters or name splitting across modules.

- [x] **TASK-13: Route AUTO_FILL Through Detected ATS Adapter with Heuristic Fallback**
  - **Goal:** On `AUTO_FILL`, run the detected ATS adapter; fall back to the existing core autofill on unsupported pages. Reuse the same path for the TASK-08 floating button.
  - **Files:** `src/core/ats/index.ts`, `src/entrypoints/content.ts`, `src/entrypoints/content.test.ts`, `src/entrypoints/floating.content.ts`.
  - **Criteria:** Unit test proves the correct adapter is selected per platform, fallback runs otherwise, and adapter errors stay isolated; existing autofill tests still pass.

- [x] **TASK-SEC-02: Fix Content Script Match Isolation & Workday Detector Sync**
  - **Goal:** Resolve Sentinel audit findings: extract `ATS_MATCHES` to `src/core/ats/matches.ts`; scope manifest matches per script so `linkedin.js` only runs on LinkedIn and `floating.js` only on ATS; add `workday.com` to `WORKDAY_HOST_PATTERN` in `src/core/ats/platform.ts`.
  - **Files:** `src/core/ats/matches.ts`, `src/core/ats/platform.ts`, `src/core/ats/platform.test.ts`, `src/entrypoints/content.ts`, `src/entrypoints/floating.content.ts`, `wxt.config.ts`, `AUDIT.md`.
  - **Criteria:** Tests verify script-specific match scoping, `*.workday.com` detection; built manifest verified; Sentinel signs off in `AUDIT.md`.

- [x] **TASK-14: Job Context Extractor (Company, Title, Description)**
  - **Goal:** Extract normalized company, role title, and job description text from supported ATS pages so AI answers are grounded in the actual posting.
  - **Files:** `src/core/ats/jobContext.ts`, `src/core/ats/jobContext.test.ts`, `tests/fixtures/{greenhouse,lever,workday}-job.html`.
  - **Criteria:** Fixture tests return title/company/description for each platform; whitespace is trimmed and description capped; unsupported pages return `null`.

- [x] **TASK-15: Application Tracker on Submit Confirmation**
  - **Goal:** Detect ATS confirmation screens and persist `{company, role, url, ats, appliedAt}` to local storage so the candidate sees a list of submitted applications in the popup.
  - **Files:** `src/core/ats/confirmation.ts`, `src/core/ats/confirmation.test.ts`, `src/core/storage/applications.ts`, `src/core/storage/applications.test.ts`, `src/lib/applications.svelte`, `src/entrypoints/popup/App.svelte`.
  - **Criteria:** Confirmation fixtures for Lever (`/thanks`, `[data-qa="msg-submit-success"]`), Greenhouse (`#application_confirmation` or "Thank you for applying"), and Workday (`[data-automation-id="applyFlowCongratsPage"]`); entries deduped by URL; popup renders the stored list; tests pass.

- [x] **TASK-20: Lightweight Popup Dashboard & Standalone Options Tab**
  - **Goal:** Modernize popup into an Application Tracker & Quick Status monitor; replace redundant fill button with status indicator; add header "Settings" button triggering `chrome.runtime.openOptionsPage()`; configure `manifest.options_ui.open_in_tab = true` in `wxt.config.ts` so Options opens in a full tab instead of `chrome://extensions/?id=...`. Fix Svelte 5 event/component warnings.
  - **Files:** `wxt.config.ts`, `src/entrypoints/popup/App.svelte`, `src/entrypoints/popup/App.test.ts`, `src/lib/components/tabs.svelte`.
  - **Criteria:** `wxt build` outputs manifest with `options_ui.open_in_tab: true`; clicking Settings opens standalone options page; popup defaults to application list with status indicator; Svelte 5 warnings resolved (`onclick` instead of `on:click`); unit tests pass (`bunx vitest run && bun run check`).

- [x] **TASK-21: Success/Error Toast Notification System**
  - **Goal:** Implement a lightweight toast notification component and service across the popup, floating action button, and options page to confirm autofill, copy, and save operations.
  - **Files:** `src/lib/Toast.svelte`, `src/lib/toastStore.ts`, `src/entrypoints/popup/App.svelte`, `src/entrypoints/floating.content.ts`, `src/entrypoints/options/Options.svelte`.
  - **Criteria:** Toast notifications appear on successful profile save, copy, or autofill trigger and auto-dismiss; unit tests verify toast store and display; all vitest tests pass.

- [x] **TASK-16: Open-Ended Question Draft Assistant**
  - **Goal:** Detect a focused open-ended question textarea (Greenhouse/Lever), draft an answer from extracted job context plus saved experience via `answerQuestion`, and show it for user approval without auto-submitting.
  - **Files:** `src/core/ats/questions.ts`, `src/core/ats/questions.test.ts`, `src/entrypoints/questionAssist.content.ts`, `tests/fixtures/{greenhouse,lever}-questions.html`.
  - **Criteria:** Fixture tests extract question label + textarea; `answerQuestion` is mocked in tests; draft is only inserted after explicit user action; no form submission or auto-fill of unknown fields.

## Candidate Profile Schema & ATS Form Research (2026-11-04)

Findings from Lever, Greenhouse, and Workday application forms. The shared field
groups below become the canonical profile model for TASK-17 through TASK-19.

| Group | Common fields | Lever | Greenhouse | Workday |
| --- | --- | --- | --- | --- |
| Identity | Full/legal name, first, middle, last, preferred name, pronouns | Single `name` field; optional pronouns | `first_name`, `last_name`; preferred name is often custom | `legalNameSection_firstName`, `legalNameSection_middleName`, `legalNameSection_lastName`, suffix, preferred name |
| Contact | Email, alternate email, phone, alternate phone | `email`, `phone` | `email`, `phone` | `email`, `phone-number`, phone device type |
| Location | Address line 1/2, city, state/province, postal code, country | `location` + hidden `selectedLocation` | `job_application[location]` or `location`, Google Places autocomplete | `addressSection_addressLine1`, `addressSection_addressLine2`, `addressSection_city`, `addressSection_postalCode`, country/region select widgets |
| Links | LinkedIn, GitHub, portfolio, website, Twitter/X, Stack Overflow, Dribbble, other | `urls[LinkedIn]`, `urls[GitHub]`, `urls[Portfolio]`, `urls[Other]`, configurable labels | Link questions, commonly `question_<id>` with LinkedIn/website/GitHub labels | Websites and social URLs in My Experience |
| Work authorization | Authorized to work, sponsorship now/future, permit type, citizenship, relocation, travel | Custom question cards, often grouped under Work Eligibility | Custom `question_<id>` questions | Application Questions; Workday also ships mapped eligibility fields such as `Legal_Eligibility` and `Require_sponsorship` |
| Compensation | Desired/minimum/current salary, currency, period | Custom questions | Custom questions | Application Questions; mapped `Required_Annual_Salary` and `Current_Annual_Salary` |
| Experience | Current company, current title, years, notice period, start date, education | `org`; custom questions | Custom questions; education/employment blocks | My Experience and Application Questions |

Important form behaviors:

- Lever uses one full-name input, so first/last must be derived only when the ATS
  requires them. Lever link fields use the `urls[<Label>]` convention and labels
  are employer-configurable.
- Greenhouse uses separate first/last fields. Location may be a Google Places
  autocomplete; typing text alone can leave it uncommitted. Never set hidden
  latitude/longitude values. Work authorization and sponsorship are custom
  `question_<id>` fields whose labels vary by employer.
- Workday is a multi-step React wizard. Address country/state are custom select
  widgets rather than plain inputs, and automation IDs vary by tenant/version.
  Adapters must use verified fixtures plus label fallback, fill only the visible
  step, and never click Next, Save, or Submit.
- Work authorization questions are legal/screening answers. A value is filled
  only when the profile explicitly stores it; missing or ambiguous values are
  left untouched. Never infer sponsorship or authorization.
- Compensation/experience questions are often custom and should be filled only
  when the label/name is an exact known match; unknown custom questions remain
  untouched.

- [x] **TASK-17: Expanded Profile Schema & Storage**
  - **Goal:** Replace the four-field flat profile with a versioned, backwards-compatible candidate profile covering identity, contact, location, links, work authorization, compensation, and experience. Keep existing `name`/`email`/`phone`/`org`/`linkedin` callers working.
  - **Files:** `src/core/storage/storage.ts`, `src/core/storage/storage.test.ts`.
  - **Schema:**
    ```ts
    export type ProfileLocation = {
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string; // display name, e.g. "United States"
      countryCode?: string; // ISO 3166-1 alpha-2, e.g. "US"
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
      currency?: string; // ISO 4217, default "USD"
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
      availableStartDate?: string; // ISO date, YYYY-MM-DD
      summary?: string;
    };

    export type Profile = {
      name: string; // canonical full/display name
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
      org?: string; // legacy alias for experience.currentCompany
      linkedin?: string; // legacy alias for links.linkedin
    };
    ```
  - **Behavior:**
    - Add `PROFILE_SCHEMA_VERSION = 2` and persist a `schemaVersion` marker without breaking reads of old records.
    - Add `splitName(name)` and `deriveFullName(profile)` utilities. Explicit `firstName`/`lastName` win; otherwise split `name`; `preferredName` is used for display only.
    - Add `normalizeProfile(value)` that trims strings, drops empty values, maps legacy `org` -> `experience.currentCompany` and `linkedin` -> `links.linkedin`, and keeps the legacy aliases in sync on write.
    - `getProfile()` returns a normalized `Profile | null`; `setProfile()` normalizes before writing and throws a typed `ProfileValidationError` when no non-empty `name` can be derived.
    - Add `updateProfile(patch)` for partial writes so the UI can avoid rebuilding the entire object. Preserve unknown top-level keys already in storage.
  - **Criteria:** Tests cover legacy four-field records, fully nested records, legacy alias precedence, trimming/empty removal, name derivation from first/last, rejection of empty identity, and watcher updates. Existing consumers (`autofill.ts`, ATS adapters, `ProfileForm.svelte`) still compile; `bunx vitest run` and `bun run check` pass.

- [x] **TASK-18: Comprehensive Profile Manager UI (Svelte 5)**
  - **Goal:** Replace the minimal profile form in the Options page with a complete candidate profile manager for every TASK-17 field. Use Svelte 5 runes (`$state`, `$derived`, `$effect` only where needed) and the existing dark Options-page styling.
  - **Files:** `src/entrypoints/options/ProfileManager.svelte` (new), `src/entrypoints/options/ProfileManager.test.ts` (new), `src/entrypoints/options/Options.svelte`, `src/entrypoints/options/Options.test.ts`. Keep `src/lib/ProfileForm.svelte` working for the popup unless the popup is migrated in the same task.
  - **UI sections (fieldsets with legends):**
    - **Identity:** full name, first name, middle name, last name, preferred name, pronouns. Auto-suggest first/last from full name without overwriting explicit edits.
    - **Contact:** email, alternate email, phone, alternate phone.
    - **Location:** address line 1, address line 2, city, state/province, postal code, country, ISO country code.
    - **Links:** LinkedIn, GitHub, portfolio, personal website, Twitter/X, Stack Overflow, Dribbble, other.
    - **Work Authorization:** authorized-to-work yes/no/unspecified, sponsorship required none/now/future/now-or-future, permit type, citizenship, willing to relocate, willing to travel. Use explicit three-state controls so unanswered is distinct from "No".
    - **Compensation:** currency, desired salary, minimum salary, current salary, salary period.
    - **Experience:** current company, current title, years of experience, notice period, available start date, highest degree, university, field of study, graduation year, professional summary.
  - **Behavior:**
    - Load once on mount via `getProfile()`; edit a local draft, not storage on every keystroke.
    - Save through `setProfile()` on explicit submit; preserve unknown keys and legacy aliases via the TASK-17 normalizer.
    - Show a dirty indicator, Save disabled while unchanged, and a reset/reload action with confirmation when dirty.
    - Validate required identity, email/URL formats, postal/country code shape, and non-negative numeric compensation/experience values. Surface field-level errors and a summary status.
    - Keep all labels programmatically associated; group related fields; keyboard-accessible; no new dependencies.
  - **Criteria:** Tests mount the manager with `fakeBrowser`, verify all sections/fields render, legacy profiles populate correctly, nested values round-trip through save, invalid email/URL/salary input is rejected, empty work-authorization remains unset, and unknown profile keys survive a save. Options tab test still passes; `wxt build`, `bunx vitest run`, and `bun run check` pass.

- [x] **TASK-TS-01: Zero 'as any' Elimination & Strict TypeScript Audit**
  - **Goal:** Clean up all existing code smells and eradicate every instance of `as any` across the repository (`src/core/storage/storage.test.ts`, `src/entrypoints/content.test.ts`, etc.).
  - **Files:** `src/core/storage/storage.test.ts`, `src/entrypoints/content.test.ts`, `src/core/storage/storage.ts`.
  - **Criteria:** Zero occurrences of `as any` in `src/` (`! grep -rn "as any" src/`); proper mock typing used for `ContentScriptContext`; index signature `Record<string, unknown>` used for unknown storage keys; `bunx vitest run` passes and `bun run check` exits with 0 errors.

- [x] **TASK-19: ATS Adapter Field Mapping for Location, Links, and Work Authorization**
  - **Goal:** Extend the Lever, Greenhouse, and Workday adapters beyond identity fields to fill structured location, portfolio/GitHub/website links, and explicit work-authorization/sponsorship answers. Keep unknown custom questions untouched and never guess legal answers.
  - **Files:** `src/core/ats/types.ts`, `src/core/ats/fieldMapping.ts` (new), `src/core/ats/fieldMapping.test.ts` (new), `src/core/ats/lever.ts`, `src/core/ats/lever.test.ts`, `src/core/ats/greenhouse.ts`, `src/core/ats/greenhouse.test.ts`, `src/core/ats/workday.ts`, `src/core/ats/workday.test.ts`, `tests/fixtures/{lever,greenhouse,workday}-form.html`.
  - **Shared mapper (`fieldMapping.ts`):**
    - `resolveIdentity(profile)` -> full/first/middle/last/preferred values, honoring explicit split and falling back to `splitName(profile.name)`.
    - `resolveLocation(profile, 'short' | 'full')` -> short `City, State, Country`; full address lines; never include undefined segments.
    - `resolveLinks(profile)` -> ordered link map including legacy `linkedin`; dedupe values.
    - `resolveWorkAuthorization(profile, questionText)` -> `'yes' | 'no' | undefined` from explicit booleans/enums. Return `undefined` when the profile has no answer or the question is ambiguous.
    - Export one native-setter helper for text/select/radio and one visible-label matcher. Refactor existing duplicate setters to use it.
  - **Lever mapping:**
    - Location: `#location`, `input[name="location"]`, `input[autocomplete*="address" i]`. Fill visible text only; do not write hidden `selectedLocation`.
    - Links: `input[name="urls[LinkedIn]"]`, `urls[GitHub]`, `urls[Portfolio]`, `urls[Website]`, `urls[Twitter]`, `urls[Other]`, plus case-insensitive `id`/`name` matching for configurable labels.
    - Work authorization: only recognized custom cards (`cards[...]`) whose label matches authorization/sponsorship patterns. Fill text/select/radio when an explicit answer exists; skip all other custom cards.
  - **Greenhouse mapping:**
    - Location: `input[name="job_application[location]"]`, `#location`, `input[name="location"]`, `input[autocomplete*="address" i]`. Dispatch `input`/`change`; do not set hidden latitude/longitude or force a Google Places suggestion.
    - Links: recognized link questions by `question_<id>` label/name for LinkedIn, GitHub, portfolio, website/personal site. Do not fill unrelated `question_*` fields.
    - Work authorization: recognized `question_<id>` labels for legally authorized/right to work and now/future sponsorship. Map only explicit yes/no; skip decline/unknown options.
  - **Workday mapping:**
    - My Information address: `addressSection_addressLine1`, `addressSection_addressLine2`, `addressSection_city`, `addressSection_postalCode`; country/region via `addressSection_countryRegion`/verified select-widget selectors with visible option matching. Add fallbacks by label only when automation IDs differ.
    - Links: websites/social URLs in My Experience; use verified `data-automation-id` selectors plus label fallback for LinkedIn, GitHub, portfolio, website. Skip ambiguous "Social Network URLs" entries.
    - Work authorization: Application Questions radio/select fields whose labels match authorization/sponsorship patterns. Fill only explicit profile answers. Never click Next, Save, Submit, or navigation controls.
    - Recognized compensation/experience questions (minimum/current annual salary, notice period, available start date, years of experience) may be filled only when labels are exact known matches.
  - **Criteria:** New fixture cases cover location, each link type, authorized yes/no, sponsorship now/future, and an unknown custom question that must stay untouched. Adapter tests prove native setters and `input`/`change` events are used, hidden fields and lat/long are never written, missing work-authorization answers are never guessed, and Workday performs no navigation/submission. Existing adapter tests still pass; `bunx vitest run` and `bun run check` pass; no new manifest permissions.

- [x] **TASK-UI-01: Modernize Candidate Profile Form UI to Match Options Design Language**
  - **Goal:** Redesign `src/entrypoints/options/ProfileManager.svelte` to match the dark-theme aesthetic, visual hierarchy, and component styling of the Keyword Filters tab in `Options.svelte`.
  - **Files:** `src/entrypoints/options/ProfileManager.svelte`, `src/entrypoints/options/ProfileManager.test.ts`.
  - **UX/UI Specifications (Designer Persona):**
    - **Layout:** Responsive 2-column CSS Grid (`repeat(auto-fit, minmax(240px, 1fr))`) for compact fields (identity, phone, email, address, city, country, postal code, salary), full-width for textareas (summary) and link rows.
    - **Cards & Fieldsets:** Replace unstyled HTML fieldsets with sleek dark cards (`background: #111; border: 1px solid #282828; border-radius: 6px; padding: 20px; margin-bottom: 20px;`). Clean uppercase section headers (`color: #eaeaea; font-size: 0.9rem; font-weight: 600;`).
    - **Form Controls:** Form inputs, selects, and textareas styled to match `Options.svelte` (`background: #1a1a1a; border: 1px solid #333; color: #eaeaea; border-radius: 4px; padding: 8px 12px; font-size: 0.95rem;`). White glow focus state (`outline: none; border-color: #fff;`).
    - **Actions & Feedback:** Prominent primary Save button (`background: #2c7be5; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;`) with disabled state when pristine, Reset button, and integration with the Toast notification system (`showToast('Profile saved successfully', 'success')`).
    - **Strict Invariants:** Zero `as any`, zero `@ts-ignore`, pure Svelte 5 runes (`$state`, `$derived`, `$props`), zero new npm dependencies.
  - **Criteria:** Tests verify form renders in dark theme, inputs remain fully accessible with proper `id` and `label` associations, validation still works, and `bunx vitest run` passes with exit code 0.

- [x] **TASK-DS-01: Global Design System, Design Tokens & Unified Component CSS (Keywords Filter Baseline)**
  - **Goal:** Eliminate jarring visual differences between "Keywords Filters" and "Profile Settings" by establishing the Keywords Filter design (`src/entrypoints/options/Options.svelte`) as the universal golden standard. Unify all inputs, buttons, cards, and spacing under global design tokens (`src/styles/tokens.css`) and reusable component CSS (`src/styles/components.css`).
  - **Context & Current Discrepancy:**
    - "Keywords Filters" (`Options.svelte`) has a crisp, compact, dark aesthetic: `#111` canvas, `#1c1c1c` tags/cards, `1px solid #333` borders, `6px 10px` input padding, `12px` font size, and white/subtle focus highlights (`#eaeaea`).
    - "Profile Settings" (`ProfileManager.svelte`) currently uses disparate styling: bloated inputs (`0.95rem`, `8px 12px` padding), mismatched background shades (`#1a1a1a`), blue accent checkboxes (`#2c7be5`), and disconnected button styles.
    - The entire application (Profile Manager, Keywords Filter, and Popup) must strictly adhere to the compact, clean visual language of the Keywords Filter.
  - **Files:** `src/styles/tokens.css` (new), `src/styles/components.css` (new), `src/entrypoints/popup/app.css`, `src/entrypoints/options/Options.svelte`, `src/entrypoints/options/ProfileManager.svelte`, `src/lib/applications.svelte`.
  - **Design Tokens (`src/styles/tokens.css`):**
    - Color tokens: `--color-bg-canvas` (#111111), `--color-bg-surface` (#181818), `--color-bg-elevated` (#1c1c1c), `--color-bg-input` (#161616), `--color-border-subtle` (#282828), `--color-border-default` (#333333), `--color-border-hover` (#444444), `--color-border-focus` (#eaeaea), `--color-text-primary` (#eaeaea), `--color-text-secondary` (#888888), `--color-text-muted` (#666666), `--color-accent` (#eaeaea), `--color-destructive` (#ff6b6b).
    - Spacing scale: `--space-1` (4px), `--space-2` (8px), `--space-3` (12px), `--space-4` (16px), `--space-5` (20px), `--space-6` (24px), `--space-8` (32px).
    - Typography scale: `--font-xs` (11px), `--font-sm` (12px), `--font-base` (13px), `--font-md` (14px), `--font-lg` (16px), `--font-xl` (20px).
    - Radii: `--radius-sm` (4px), `--radius-md` (6px), `--radius-lg` (8px).
  - **Unified Component Classes (`src/styles/components.css`):**
    - Standard Inputs (`.input-field` / global `input`, `select`, `textarea`): Compact `padding: 6px 10px`, `font-size: 12px`, `background: var(--color-bg-input)`, `border: 1px solid var(--color-border-default)`, `border-radius: var(--radius-sm)`, focus outline to `var(--color-border-focus)`.
    - Standard Buttons: `.btn`, `.btn-primary` (solid white text on dark or accent), `.btn-secondary` (`border: 1px solid #444`, hover `#888`), `.btn-destructive` (hover `#ff6b6b`), `.btn-sm` (`padding: 3px 8px`, `font-size: 11px`), `.reset-btn`.
    - Standard Tags & Cards: `.tag` (matching `.keyword-tag`: `background: #1c1c1c`, `border: 1px solid #333`, `padding: 4px 8px`, `font-size: 12px`), `.card` (matching `.options-container` & `.profile-wrapper`).
    - Standard Checkbox/Radio: `accent-color: var(--color-text-primary, #eaeaea)`.
  - **Criteria:** Design tokens and component styles imported into popup and options; all components in ProfileManager and Options refactored to consume tokens; inputs in Profile Settings look and behave identically to inputs in Keywords Filters; `bunx vitest run` passes with exit code 0 and zero `as any`.

- [x] **TASK-REFACTOR-02: Decompose Monolithic ProfileManager into Modular Svelte 5 Subcomponents**
  - **Goal:** Break down the monolithic 1,113-line `ProfileManager.svelte` into cohesive, reusable section components under `src/entrypoints/options/profile/`, reducing coordinator complexity and improving maintainability.
  - **Files:**
    - `src/entrypoints/options/profile/IdentitySection.svelte` (Name, preferred name, pronouns, email, phone)
    - `src/entrypoints/options/profile/LocationSection.svelte` (Address, city, state, postal code, country)
    - `src/entrypoints/options/profile/LinksSection.svelte` (LinkedIn, GitHub, portfolio, personal website, Twitter)
    - `src/entrypoints/options/profile/WorkAuthSection.svelte` (Work authorization, sponsorship, permit type, citizenship, relocation)
    - `src/entrypoints/options/profile/CompensationSection.svelte` (Currency, desired salary)
    - `src/entrypoints/options/profile/ExperienceSection.svelte` (Current company, title, years of experience, degree, university, field of study, graduation year, notice period, summary)
    - `src/entrypoints/options/ProfileManager.svelte` (Slim coordinator component, <150 lines, managing active profile state and persistence)
  - **Criteria:** All profile subcomponents use Svelte 5 runes (`$props()`, `$state()`); UI appearance remains 100% identical under `tokens.css`; `bunx vitest run` passes with 236/236 tests; zero `as any` or `@ts-ignore`.

- [ ] **TASK-22: Profile-Powered Inline Quick Fill Action Bar**
  - **Goal:** Inject a lightweight floating action bar on supported ATS pages when form fields are detected, providing a one-click "Fill Form" button and a dropdown preview of the candidate's active profile data.
  - **Files:** `src/entrypoints/floating.content.ts`, `src/lib/components/QuickFillBar.svelte`, `src/core/autofill/fieldDetector.ts`.
  - **Criteria:** Floating action bar renders cleanly without injecting host CSS pollution, displays detected field counts, triggers platform adapter autofill on click, and uses existing toast notifications for success states.

- [ ] **TASK-23: Application Tracker Dashboard & Status Filter UI**
  - **Goal:** Enhance the popup application tracker with search filtering, status badges (Applied, Interviewing, Rejected, Offered), and manual job entry support.
  - **Files:** `src/lib/applications.svelte`, `src/core/storage/applications.ts`, `src/entrypoints/popup/App.svelte`, `src/entrypoints/popup/App.test.ts`.
  - **Criteria:** Users can filter tracked applications by company name or ATS platform, update application status manually, and delete historical entries; unit tests verify storage and filtering logic with 100% pass rate.

- [ ] **TASK-24: Candidate Profile JSON Export & Import with Schema Validation**
  - **Goal:** Provide seamless profile backup, export, and migration by allowing users to download their candidate profile as a formatted JSON file and import an existing profile with versioned schema validation.
  - **Files:** `src/entrypoints/options/profile/ProfileExportImport.svelte`, `src/core/storage/storage.ts`, `src/entrypoints/options/Options.svelte`.
  - **Criteria:** Validates imported JSON against `PROFILE_SCHEMA_VERSION`; rejects malformed payloads; downloads clean `.json` file; unit tests cover import validation and round-trip restore.

- [ ] **TASK-25: Keyboard Hotkeys & Accessible Focus Ring Navigation**
  - **Goal:** Add keyboard shortcuts (e.g. `Alt+Shift+F` for quick autofill trigger, `Escape` to close modal/floating bar) and high-contrast accessible focus outlines for keyboard-only navigation.
  - **Files:** `src/entrypoints/floating.content.ts`, `src/lib/components/QuickFillBar.svelte`, `src/styles/components.css`.
  - **Criteria:** Keyboard shortcuts registered cleanly via browser commands API / keydown listeners; accessible focus ring styling across all inputs; unit tests verify event handlers with 100% pass rate.

