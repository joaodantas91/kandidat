# Kandidat Project Backlog

Autonomous task queue. The agent picks the first uncompleted task `[ ]`, implements it, verifies that tests pass (`bunx vitest run` and `bun run check`), and marks it completed `[x]`.

---

## Active Queue

- [x] **TASK-01: Connect "Fill" button in Popup to Content Script**
  - **Goal:** Clicking the "Fill" button in `src/lib/home.svelte` sends message (`AUTO_FILL`) to the active browser tab.
  - **Files:** `src/lib/home.svelte`, `src/entrypoints/content.ts`.
  - **Criteria:** Active tab is queried via `browser.tabs.query`, message sent via `browser.tabs.sendMessage(tab.id, 'AUTO_FILL')`. Handled cleanly in `content.ts`.

- [ ] **TASK-02: Pre-populate Popup Profile Form on Open**
  - **Goal:** When opening popup, if profile data exists in storage (`getProfile()`), populate form inputs so user sees saved data.
  - **Files:** `src/lib/ProfileForm.svelte` (or `src/lib/profile.svelte`).
  - **Criteria:** Runs on mount. Clean fallback if storage is empty.

- [ ] **TASK-03: Extend Autofill Core to Textarea and Select Elements**
  - **Goal:** Support multiline inputs and dropdowns (`HTMLTextAreaElement`, `HTMLSelectElement`) using appropriate prototype setters.
  - **Files:** `src/core/autofill/autofill.ts`, `src/core/autofill/autofill.test.ts`.
  - **Criteria:** Unit tests in vitest pass for textarea and select elements.

- [ ] **TASK-04: LinkedIn Clean Job Feed Filter Integration**
  - **Goal:** Content script on LinkedIn job search that hides spam/outsourcing listings.
  - **Files:** `src/entrypoints/linkedin.content.ts`.
  - **Criteria:** Basic DOM filtering with clean error boundaries.
