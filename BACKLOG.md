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

- [ ] **TASK-13: Route AUTO_FILL Through Detected ATS Adapter with Heuristic Fallback**
  - **Goal:** On `AUTO_FILL`, run the detected ATS adapter; fall back to the existing core autofill on unsupported pages. Reuse the same path for the TASK-08 floating button.
  - **Files:** `src/core/ats/index.ts`, `src/entrypoints/content.ts`, `src/entrypoints/content.test.ts`, `src/entrypoints/floating.content.ts`.
  - **Criteria:** Unit test proves the correct adapter is selected per platform, fallback runs otherwise, and adapter errors stay isolated; existing autofill tests still pass.

- [ ] **TASK-14: Job Context Extractor (Company, Title, Description)**
  - **Goal:** Extract normalized company, role title, and job description text from supported ATS pages so AI answers are grounded in the actual posting.
  - **Files:** `src/core/ats/jobContext.ts`, `src/core/ats/jobContext.test.ts`, `tests/fixtures/{greenhouse,lever,workday}-job.html`.
  - **Criteria:** Fixture tests return title/company/description for each platform; whitespace is trimmed and description capped; unsupported pages return `null`.

- [ ] **TASK-15: Application Tracker on Submit Confirmation**
  - **Goal:** Detect ATS confirmation screens and persist `{company, role, url, ats, appliedAt}` to local storage so the candidate sees a list of submitted applications in the popup.
  - **Files:** `src/core/ats/confirmation.ts`, `src/core/ats/confirmation.test.ts`, `src/core/storage/applications.ts`, `src/core/storage/applications.test.ts`, `src/lib/applications.svelte`, `src/entrypoints/popup/App.svelte`.
  - **Criteria:** Confirmation fixtures for Lever (`/thanks`, `[data-qa="msg-submit-success"]`), Greenhouse (`#application_confirmation` or "Thank you for applying"), and Workday (`[data-automation-id="applyFlowCongratsPage"]`); entries deduped by URL; popup renders the stored list; tests pass.

- [ ] **TASK-16: Open-Ended Question Draft Assistant**
  - **Goal:** Detect a focused open-ended question textarea (Greenhouse/Lever), draft an answer from extracted job context plus saved experience via `answerQuestion`, and show it for user approval without auto-submitting.
  - **Files:** `src/core/ats/questions.ts`, `src/core/ats/questions.test.ts`, `src/entrypoints/questionAssist.content.ts`, `tests/fixtures/{greenhouse,lever}-questions.html`.
  - **Criteria:** Fixture tests extract question label + textarea; `answerQuestion` is mocked in tests; draft is only inserted after explicit user action; no form submission or auto-fill of unknown fields.
