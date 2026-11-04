# Kandidat Security & Architecture Audit (Sentinel)

## Active Issues

- [ ] **[HIGH] Overwriting Existing User Input in Autofill Core**
  - **Location:** `src/core/autofill/autofill.ts:60`
  - **Vulnerability:** `findFormField` matches elements without checking if `element.value` already contains user-typed text. Blindly clobbers existing data when autofill triggers.
  - **Remediation:** In `findFormField` or `autofill()`, skip elements where `element.value.trim().length > 0` unless explicitly forced.

- [ ] **[MEDIUM] Manifest V3 Overbroad Host Permissions**
  - **Location:** `wxt.config.ts`
  - **Vulnerability:** `matches: ['<all_urls>']` in content script grants extension access to all browsing activity for user PII.
  - **Remediation:** Restrict matches to known ATS job domains (`*.lever.co/*`, `*.greenhouse.io/*`, `*.myworkdayjobs.com/*`, `*.linkedin.com/*`).

---

## Resolved Issues

- [x] **[CRITICAL] Unconsented PII Injection on Page Load**
  - **Location:** `src/entrypoints/content.ts`
  - **Resolution:** Patched in TASK-01. Autofill strictly gated behind explicit `AUTO_FILL` runtime message event.
