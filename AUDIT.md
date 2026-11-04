# Kandidat Security & Architecture Audit (Sentinel)

## Active Issues

_No blocking or security issues. LOW-severity hardening items are recorded below._

---

## Audit — ATS Adapters (TASK-09..TASK-12, diff `8b5e440..HEAD`)

**Result:** No high/medium findings. Core security invariants verified clean.

### Verified clean

- **DOM injection — clean.** No `innerHTML`, `outerHTML`, `insertAdjacentHTML`, or `eval`. The floating action uses a shadow root built with `createElement`/`textContent`; label reads use `textContent`; all query selectors are module constants (no user-controlled selector strings); the `MutationObserver` only re-appends a fixed-ID host.
- **Prototype safety — clean.** Native setters are read with `Object.getOwnPropertyDescriptor(...prototype, 'value')` and invoked via `.call`; no prototype writes, pollyfills, or monkey-patching. The `input.value = value` path is only a fallback when the native descriptor is unavailable.
- **Non-empty field guards — clean.** `autofill` and the Greenhouse, Lever, and Workday adapters all skip targets where `value.trim().length !== 0`. Tests cover preservation of populated name/email/phone/LinkedIn fields.
- **Error handling — acceptable.** `content.ts` and `floating.content.ts` wrap storage lookups and autofill in `try/catch`; `detectAts` catches malformed URLs. Adapters do no async/network work and have no internal error boundary, so callers must keep them wrapped once wired in.
- **Permission scoping — clean in built artifact.** `bun run build` emits `permissions: ["storage"]` only, and every `content_scripts.matches` entry is limited to `lever.co`, `greenhouse.io`, `myworkdayjobs.com`, and `linkedin.com`. `<all_urls>` is absent. No new manifest permissions were introduced by the ATS work.

### Findings

- [x] **[LOW] Manifest hook drops Workday hosts recognized by the detector**
  - **Location:** `wxt.config.ts:3` vs `src/core/ats/platform.ts:5`, `src/entrypoints/floating.content.ts:8`
  - **Detail:** the build hook replaces every content script's `matches` with `ATS_MATCHES`, which omits `myworkdaysite.com` and `workday.com` even though `detectAts` accepts `myworkdaysite.com` and `floating.content.ts` declares both. Content scripts therefore do not load on those Workday tenants.
  - **Resolution:** TASK-13 added `myworkdaysite.com` and `workday.com` to the hook list. See the TASK-13 audit for the follow-on `workday.com` detector gap.

- [x] **[LOW] `content.ts` source still declares `<all_urls>`**
  - **Location:** `src/entrypoints/content.ts:5`
  - **Detail:** broad host access is only removed by the `build:manifestGenerated` hook. The built manifest is scoped (verified), but the source declaration is misleading and a build/tooling change could silently reintroduce broad access.
  - **Resolution:** TASK-13 changed `content.ts` to `matches: ATS_MATCHES`; `<all_urls>` no longer appears in source or in the built manifest.

- [x] **[INFO] ATS detector/adapters are not yet wired into an entrypoint**
  - **Location:** `src/core/ats/platform.ts`, `src/core/ats/{greenhouse,lever,workday}.ts`
  - **Detail:** no entrypoint imports `detectAts` or the `fill*` functions, and the platform adapters omit the optional `fill` member. TASK-10..12 code is inert today, so there is no runtime exposure, but detection and filling are not actually connected.
  - **Resolution:** TASK-13 added the `fillApplication` dispatcher and routed both `content.ts` and `floating.content.ts` through it.

- [x] **[TASK-14] Job Context Extractor DOM safety**
  - **Location:** `src/core/ats/jobContext.ts`
  - **Detail:** Production code uses `Node.textContent` via `querySelector`; no `innerHTML`, `outerHTML`, `insertAdjacentHTML`, or `eval`. Whitespace is normalized via `.trim()`. Error boundary returns `null` when no ATS adapter matches.
  - **Resolution:** Extractor verified clean; tests pass (6/6).

---

## Audit — Job Context Extractor (TASK-14, diff `4fe6eb9..HEAD`)

**Result:** DOM text extraction uses `textContent` only; whitespace trimmed; null returned for unsupported pages. No injection vectors.

### Verified clean

- **DOM injection — clean.** Production code uses `Node.textContent` via `querySelector`; no `innerHTML`, `outerHTML`, `insertAdjacentHTML`, or `eval` anywhere in `src/core/ats/jobContext.ts`. Fixture mounting in tests uses `innerHTML` but is isolated test infrastructure.
- **Whitespace normalization — clean.** All three extractors (`extractCompany`, `extractTitle`, `extractDescription`) apply `.trim()` to returned values, normalizing intra-word and trailing whitespace.
- **Error boundary — clean.** `detectAts` returns `null` when no ATS platform matches (malformed URL, unknown host). `extractJobContext` returns `null` if no adapter is selected, providing a clear null boundary for callers.
- **Test pass — confirmed.** 6/6 tests pass via `bunx vitest run`.

### Findings

- [ ] **[INFO] Test fixture mounting uses innerHTML**
  - **Location:** `src/core/ats/jobContext.test.ts:23` (`mountFixture` sets `root.innerHTML = parsed.body.innerHTML`)
  - **Detail:** The `mountFixture` helper uses `innerHTML` to mount HTML fixtures into the DOM for tests. This is test-only infrastructure; the production extractor (`jobContext.ts`) never uses `innerHTML` — it only reads `textContent` via `querySelector`. No runtime injection risk.
  - **Resolution:** Acceptable as test fixture practice; production code is clean.

---

## Audit — Shared DOM Setter & Name Utils (TASK-REFACTOR-01, diff `b322a3e..HEAD`)

**Result:** Refactor verified. Duplication eliminated; no security regression.

### Confirmed

- **Value-setter duplication eliminated — clean.** All native-setter logic now lives in `src/core/dom/setter.ts:6-41` (`getNativeSetter`, `setElementValue`, `setInputValue`). Grep finds no `getOwnPropertyDescriptor(...prototype, 'value')` or local `setInputValue` definitions in `src/core/ats/*` or `autofill.ts`; those modules import the shared helper. `setInputValue` is a thin input-typed wrapper over `setElementValue`, not a duplicate implementation.
- **`splitName` duplication eliminated — clean.** Defined once at `src/core/dom/setter.ts:43-46`; `greenhouse.ts:4` and `workday.ts:4` re-export it for backward compatibility (`export { splitName }`), which is not a reimplementation.
- **DOM injection safety — clean.** The new module writes values through native prototype setters via `.call` and dispatches bubbling `input`/`change`; there are no prototype writes. Production code contains no `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, or `new Function` (matches are confined to test fixtures). Selectors remain module constants; no user-controlled selector strings.
- **Non-empty guards preserved.** Every call site keeps the `value.trim().length === 0` skip behavior from the pre-refactor adapters.
- **Behavior preserved and broadened.** Textarea/select handling moved into shared `setElementValue`; new tests cover input, textarea, select, and event bubbling.

### Findings

- [ ] **[LOW] Shared setter still binds to the `window` prototype**
  - **Location:** `src/core/dom/setter.ts:10-24`
  - **Detail:** pre-existing pattern reads `window.HTML*Element.prototype` instead of `element.ownerDocument.defaultView`. Same-realm/top-document callers are safe (content scripts run in an isolated world), but passing an element from an iframe realm would throw `Illegal invocation`.
  - **Fix:** resolve the constructor from `element.ownerDocument.defaultView ?? window`, or cache setters per realm.

- [ ] **[INFO] `splitName` assertions duplicated in adapter tests**
  - **Location:** `src/core/ats/greenhouse.test.ts:27-44`, `src/core/ats/workday.test.ts:26-43`
  - **Detail:** both duplicate the cases now covered by `src/core/dom/setter.test.ts:4-22`. This is test duplication only, not production code; keeping one source of truth would reduce drift.
  - **Fix:** drop adapter-level copies or assert the re-export once.

### Verification

- `bunx vitest run` — 10 files, 119 tests passed.
- `bun run check` — 0 errors, 0 warnings.

---

## Audit — AUTO_FILL Routing & ATS Dispatch (TASK-13, diff `c1ed12f..HEAD`)

**Result:** Routing and fallback work as specified; no injection regression. Two MEDIUM host-scoping defects and two LOW hardening items found.

### Confirmed clean

- **AUTO_FILL routing — correct.** Popup sends `AUTO_FILL` (`src/lib/home.svelte:9`) → `content.ts:8-19` listener → `getProfile()` → `fillApplication(profile, new URL(location.href))`. No autofill runs on page load; the message gate is intact, so unconsented PII injection remains fixed.
- **Adapter dispatch — correct.** `src/core/ats/index.ts:9-27` maps `AtsPlatform` to `fillLever`/`fillGreenhouse`/`fillWorkday`; `detectAts` selects exactly one adapter by host or DOM heuristic, and the filler is invoked with the same `root`.
- **Heuristic fallback — correct per spec.** When `detectAts` returns `null`, `fillApplication` calls core `autofill({ profile, root })`. Matches BACKLOG TASK-13 ("fall back ... on unsupported pages") and is covered by `index.test.ts`.
- **Error boundary isolation — correct for adapters.** `detectAts` and the adapter call share one `try/catch` (`index.ts:23-31`); a thrown adapter is logged and the fallback still runs. `content.ts` and `floating.content.ts` additionally wrap the whole call, so storage and fallback failures are swallowed. Verified by tests.
- **DOM injection — clean.** No `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, or `new Function` in production code; dispatch uses the shared native-setter helper.
- **Permissions — unchanged.** Built manifest still emits `permissions: ["storage"]` and contains no `<all_urls>`.

### Findings

- [ ] **[MEDIUM] `workday.com` is matched for injection but not by the detector**
  - **Location:** `wxt.config.ts:8` (`*://*.workday.com/*`) vs `src/core/ats/platform.ts:5`
  - **Detail:** TASK-13 added `workday.com` to the match list, but `WORKDAY_HOST_PATTERN = /(^|\.)(myworkdayjobs|myworkdaysite)\.com$/i` does not include `workday`. On a `*.workday.com` tenant the content script loads, `detectAts` returns `null` (unless DOM selectors happen to match), and the generic `autofill` fallback runs — which does not understand Workday's `data-automation-id` fields, so nothing meaningful is filled.
  - **Fix:** add `workday` to the detector pattern (and a `platform.test.ts` case for `*.workday.com`), or drop `workday.com` from the match list.

- [ ] **[MEDIUM] Manifest hook applies the union match list to every content script**
  - **Location:** `wxt.config.ts:26-30`
  - **Detail:** `build:manifestGenerated` overwrites every `content_scripts[].matches` with `ATS_MATCHES`. Result (verified in `.output/chrome-mv3/manifest.json`): `linkedin.js` is injected on Lever, Greenhouse, and Workday, while `content.js` and `floating.js` are injected on LinkedIn. This breaks least privilege and runs the LinkedIn feed-filter DOM mutation on unrelated sites (and the floating button on LinkedIn).
  - **Fix:** stop rewriting all scripts; scope each content script at its source (`content.ts`/`floating.content.ts`/`linkedin.content.ts`) or map matches per script name in the hook.

- [ ] **[MEDIUM] `ATS_MATCHES` duplicated between config and source, already drifted**
  - **Location:** `wxt.config.ts:3-10` vs `src/entrypoints/floating.content.ts:8-14`
  - **Detail:** two hand-maintained copies of the same list. They already disagree: the config copy includes `linkedin.com`, the floating copy does not. `content.ts:3` imports the floating copy, so source-declared matches (5 hosts) differ from the shipped manifest (6 hosts). `content.test.ts:27-30` compares source against the duplicate, not the build output, so it cannot catch the drift. This violates the PONYTAIL zero-copy rule.
  - **Fix:** move the list to one module (e.g. `src/core/ats/matches.ts`) and import it from the config, both content entrypoints, and tests.

- [ ] **[LOW] `content.ts` imports a sibling entrypoint for a constant**
  - **Location:** `src/entrypoints/content.ts:3`
  - **Detail:** `import { ATS_MATCHES } from './floating.content'` couples one entrypoint to another and imports its module side effects (`defineContentScript`, shadow-DOM code). Currently tree-shaken — built `content.js` contains no floating-button code — but fragile if the module gains non-tree-shakeable side effects.
  - **Fix:** the shared matches module above also removes this coupling.

- [ ] **[LOW] Fallback `autofill` sits outside the error boundary**
  - **Location:** `src/core/ats/index.ts:33`
  - **Detail:** adapter detection/fill are wrapped, but the fallback call is outside `try/catch`. A throwing fallback escapes `fillApplication` and relies on the caller (`content.ts`, `floating.content.ts`) to catch it. Both currently do, so this is not an active bug, but the function's isolation is asymmetric and `index.test.ts` only covers adapter throws.
  - **Fix:** wrap the fallback in the same boundary (or document that callers must wrap).

- [ ] **[INFO] No fallback when a detected adapter fills nothing**
  - **Location:** `src/core/ats/index.ts:25-28`
  - **Detail:** once an adapter is selected, `fillApplication` returns without checking whether any field was written. A supported host with changed selectors gets no heuristic fallback. This matches TASK-13's wording (fallback only for unsupported pages), so it is a known limitation rather than a defect.
  - **Fix:** if desired, have fillers return a filled-count and fall back on zero.

- [ ] **[INFO] Entrypoint test-filter regex covers `.test.` only**
  - **Location:** `wxt.config.ts:20-25`
  - **Detail:** `entrypoints:found` strips `/\.test\.[jt]sx?$/` so colocated tests are not treated as content scripts. A future `.spec.ts` file would slip through and be emitted as an entrypoint.
  - **Fix:** broaden to `\.(test|spec)\.`

### Verification

- `bunx vitest run` — 12 files, 128 tests passed.
- `bun run check` — 0 errors, 0 warnings.
- `bun run build` — succeeded; manifest scoped (no `<all_urls>`), but see the union-match finding above.

---

## Resolved Issues

- [x] **[LOW] Manifest hook dropped Workday hosts recognized by the detector**
  - **Location:** `wxt.config.ts:3`
  - **Resolution:** TASK-13 added `myworkdaysite.com` and `workday.com` to the hook list; the remaining `workday.com` detector mismatch is tracked in the TASK-13 audit.

- [x] **[LOW] `content.ts` source declared `<all_urls>`**
  - **Location:** `src/entrypoints/content.ts`
  - **Resolution:** TASK-13 scoped `matches` to `ATS_MATCHES`; broad host access is gone from source and the built manifest.

- [x] **[INFO] ATS detector/adapters were not wired into an entrypoint**
  - **Location:** `src/core/ats/index.ts`
  - **Resolution:** TASK-13 added `fillApplication` and routed `content.ts` + `floating.content.ts` through it.

- [x] **[INFO] Native-setter helper duplicated across four modules**
  - **Location:** `src/core/dom/setter.ts`
  - **Resolution:** TASK-REFACTOR-01 extracted `getNativeSetter`, `setElementValue`, `setInputValue`, and `splitName` into one shared module. `greenhouse.ts`, `lever.ts`, `workday.ts`, and `autofill.ts` now import it; no local copies remain.

- [x] **[HIGH] Overwriting Existing User Input in Autofill Core**
  - **Location:** `src/core/autofill/autofill.ts:102`
  - **Resolution:** Added `element.value.trim().length === 0` guard. Verified with unit tests in `autofill.test.ts`.

- [x] **[MEDIUM] Manifest V3 Overbroad Host Permissions**
  - **Location:** `wxt.config.ts`
  - **Resolution:** Scoped `content_scripts.matches` hook to Lever, Greenhouse, Workday, and LinkedIn. Eliminated `<all_urls>`.

- [x] **[CRITICAL] Unconsented PII Injection on Page Load**
  - **Location:** `src/entrypoints/content.ts`
  - **Resolution:** Patched in TASK-01. Autofill strictly gated behind explicit `AUTO_FILL` runtime message event.
---

## Audit: TASK-15 Application Tracker & Confirmation Screen Detection (2026-11-04)

- Audited commit range: `18176d2..52a9dbe`
- Status: **Core invariants verified clean**.
- Findings:
  - `[INFO]` DOM confirmation screening uses `document.querySelector` safely without injecting or interpolating untrusted DOM HTML (`innerHTML`).
  - `[INFO]` Storage model in `src/core/storage/applications.ts` uses strictly typed schema (`ApplicationRecord`) and deduplicates by URL.
  - `[INFO]` No prototype pollution or unsafe setter overrides.
  - `[INFO]` No Manifest V3 permission creep.
