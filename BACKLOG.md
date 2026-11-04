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

- [ ] **TASK-07: Heuristic Field Detector for Candidate Profile Keys**
  - **Goal:** Scan the active page for `<input>`, `<textarea>` and `<select>` elements matching candidate profile fields (`fullName`, `email`, `phone`, `linkedin`) in a single pass.
  - **Files:** `src/core/autofill/fieldDetector.ts`, `src/core/autofill/fieldDetector.test.ts`.
  - **Criteria:** Unit tests pass with synthetic DOM fixtures; returns typed element map.

- [ ] **TASK-08: Floating "Fill Profile" Action Button for ATS Portals**
  - **Goal:** Inject a clean, isolated floating button into supported ATS portals (Lever, Greenhouse, Workday) triggering autofill.
  - **Files:** `src/entrypoints/floating.content.ts`.
  - **Criteria:** Mutation-safe injection that does not conflict with host styles.
