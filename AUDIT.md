# Kandidat Security & Architecture Audit (Sentinel)

## Active Issues

*None. All identified audit issues resolved.*

---

## Resolved Issues

- [x] **[HIGH] Overwriting Existing User Input in Autofill Core**
  - **Location:** `src/core/autofill/autofill.ts:60`
  - **Resolution:** Added `input.value.trim().length === 0` guard. Verified with 5 unit tests in `autofill.test.ts`.

- [x] **[MEDIUM] Manifest V3 Overbroad Host Permissions**
  - **Location:** `wxt.config.ts`
  - **Resolution:** Scoped `content_scripts.matches` hook to Lever, Greenhouse, Workday, and LinkedIn. Eliminated `<all_urls>`.

- [x] **[CRITICAL] Unconsented PII Injection on Page Load**
  - **Location:** `src/entrypoints/content.ts`
  - **Resolution:** Patched in TASK-01. Autofill strictly gated behind explicit `AUTO_FILL` runtime message event.
