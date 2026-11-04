# Kandidat Security & Architecture Audit (Sentinel)

## Active Issues

*No blocking or security issues. Two LOW-severity hardening items are recorded below.*

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

- [ ] **[LOW] Manifest hook drops Workday hosts recognized by the detector**
  - **Location:** `wxt.config.ts:3` vs `src/core/ats/platform.ts:5`, `src/entrypoints/floating.content.ts:8`
  - **Detail:** the build hook replaces every content script's `matches` with `ATS_MATCHES`, which omits `myworkdaysite.com` and `workday.com` even though `detectAts` accepts `myworkdaysite.com` and `floating.content.ts` declares both. Content scripts therefore do not load on those Workday tenants.
  - **Fix:** add `*://*.myworkdaysite.com/*` (and `workday.com` if intended) to the hook, or share one matches constant.

- [ ] **[LOW] `content.ts` source still declares `<all_urls>`**
  - **Location:** `src/entrypoints/content.ts:5`
  - **Detail:** broad host access is only removed by the `build:manifestGenerated` hook. The built manifest is scoped (verified), but the source declaration is misleading and a build/tooling change could silently reintroduce broad access.
  - **Fix:** set `matches` to the same scoped ATS list so source matches the shipped manifest.

- [ ] **[INFO] ATS detector/adapters are not yet wired into an entrypoint**
  - **Location:** `src/core/ats/platform.ts`, `src/core/ats/{greenhouse,lever,workday}.ts`
  - **Detail:** no entrypoint imports `detectAts` or the `fill*` functions, and the platform adapters omit the optional `fill` member. TASK-10..12 code is inert today, so there is no runtime exposure, but detection and filling are not actually connected.
  - **Fix:** follow-up integration task; wrap calls in the existing `try/catch` boundaries.

- [ ] **[INFO] Native-setter helper duplicated across four modules**
  - **Location:** `src/core/autofill/autofill.ts`, `src/core/ats/greenhouse.ts`, `src/core/ats/lever.ts`, `src/core/ats/workday.ts`
  - **Detail:** identical `setInputValue` implementations increase drift risk. Not a security issue.
  - **Fix:** extract a shared helper when integrating the adapters.

### Verification

- `bunx vitest run` — 9 files, 112 tests passed.
- `bun run check` — 0 errors, 0 warnings.
- `bun run build` — succeeded; scoped manifest confirmed.

---

## Resolved Issues

- [x] **[HIGH] Overwriting Existing User Input in Autofill Core**
  - **Location:** `src/core/autofill/autofill.ts:102`
  - **Resolution:** Added `element.value.trim().length === 0` guard. Verified with unit tests in `autofill.test.ts`.

- [x] **[MEDIUM] Manifest V3 Overbroad Host Permissions**
  - **Location:** `wxt.config.ts`
  - **Resolution:** Scoped `content_scripts.matches` hook to Lever, Greenhouse, Workday, and LinkedIn. Eliminated `<all_urls>`.

- [x] **[CRITICAL] Unconsented PII Injection on Page Load**
  - **Location:** `src/entrypoints/content.ts`
  - **Resolution:** Patched in TASK-01. Autofill strictly gated behind explicit `AUTO_FILL` runtime message event.
