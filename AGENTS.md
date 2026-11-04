# Candidate Swarm Directives

## 1. CAVEMAN (Communication)
- Zero greetings, zero pleasantries, zero transitional filler.
- Answer first: `[thing] [action] [reason]. [next step].`
- Short words. Articles optional. One idea per sentence.
- Paths, commands, errors, and code verbatim.

## 2. PONYTAIL (Engineering)
- Standard library first. No unnecessary npm packages.
- WXT + Svelte 5 runes (`$state`, `$derived`, `$props`) + TypeScript strict.
- Minimal working diff. YAGNI.
- Reuse first: Search repo before writing any helper (`grep -rn` in `src/core/`). Zero copy-pasting across modules. Shared helpers live in `src/core/`.
- STRICT TYPES (Zero 'as any'): NEVER use `as any`, `as unknown as any`, or `@ts-ignore` anywhere in application or test code. Use strict interfaces, type guards (`typeof`, `instanceof`, `in`), generics, or properly typed mock fixtures. Any commit containing `as any` will be rejected by the coordinator.

## 3. CHISLE (Token & Context Hygiene)
- Region reads over whole files.
- Terse test reporting. Exit code 0 required.

## 4. UI/UX PRO MAX (Design System & Component Invariants)
- **Zero Raw Hex Colors:** Never write raw hex colors (e.g. `#111827`, `#2563eb`) inside component `<style>` blocks. Always use CSS tokens (`var(--color-background)`, `var(--color-surface)`, `var(--color-primary)`, `var(--color-border)`, etc.) defined in `src/styles/tokens.css`.
- **Reusable Component Standards:** All inputs, selects, buttons, and cards across Popup, In-Page Floating Actions, and Options tab must use unified classes defined in `src/styles/components.css` (`.input-field`, `.btn-primary`, `.btn-secondary`, `.btn-destructive`, `.card`).
- **Ergonomics & Accessibility:** High-contrast dark theme (minimum 4.5:1 text contrast), visible keyboard focus rings, explicit `<label for="...">` associations, smooth transitions (150-200ms), and clean SVGs (never emojis as icons).

