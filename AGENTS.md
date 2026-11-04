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

## 3. CHISLE (Token & Context Hygiene)
- Region reads over whole files.
- Terse test reporting. Exit code 0 required.
