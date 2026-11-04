# Kandidat Project Roadmap

Long-range vision and future production features. Items here are reserved for post-MVP / client deployment milestones and are not in the active development sprint until promoted.

---

## Production & Client Deployment Phase

### Privacy-Preserving Diagnostic & Form Telemetry (User-Consented)
- **Goal:** Enable users to optionally report autofill failures and missing field mappings to our backend without exposing any sensitive personal data (PII).
- **Triggers:** Extension detects an unhandled form step, 0 fields populated on a supported ATS portal, or a thrown adapter error.
- **Privacy & Consent Constraints:**
  - **Explicit User Consent:** A non-intrusive banner/dialog asks: *"Autofill encountered missing fields. Send anonymized diagnostics to improve Kandidat?"* with explicit Yes/No.
  - **Strict Zero-PII Policy:** Under NO circumstances send user profile data, names, emails, addresses, or filled values.
  - **Payload Schema:**
    - `ats`: Detected platform (`lever` | `greenhouse` | `workday` | `unknown`)
    - `pageHost`: Host domain (e.g. `jobs.lever.co`)
    - `unmatchedFields`: Array of DOM metadata only (element tag, input `type`, `name`, `id`, `data-automation-id`, and sanitized `aria-label`).
    - `errorCode`: Error classification string.
    - `extensionVersion`: Client semver.
- **Backend Endpoint:** Secure HTTPS endpoint receiving telemetry to prioritize new ATS adapter rules and field heuristics.
