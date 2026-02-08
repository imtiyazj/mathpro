# Repository Guidelines

## Project Structure & Module Organization
- `index.html` is the Vite HTML entry point.
- `src/` contains the React + TypeScript app.
- `src/main.tsx` is the client bootstrap; `src/App.tsx` is the top-level component.
- `src/components/` holds UI components, `src/utils/` holds helper logic.
- `src/assets/` is for bundled assets; `public/` is for static files copied as-is.
- Build output goes to `dist/` (generated).

## Build, Test, and Development Commands
- `npm run dev`: starts the Vite dev server with HMR.
- `npm run build`: type-checks with `tsc -b` and builds the production bundle.
- `npm run preview`: serves the production build locally.
- `npm run lint`: runs ESLint across the repo.

## Coding Style & Naming Conventions
- TypeScript + React function components.
- Indentation: 2 spaces; semicolons are used; strings use single quotes.
- Component files use `PascalCase` (e.g., `CategorySelection.tsx`).
- Prefer colocating component styles in `src/index.css` or component-specific CSS if added.
- Lint rules are defined in `eslint.config.js` and should stay green.

## Testing Guidelines
- No test framework is configured yet, and no tests exist in this repo.
- If adding tests, keep them in `src/` or a `tests/` folder and use `*.test.tsx` or `*.spec.tsx` naming.
- Document the test runner choice in this file once added.

## Commit & Pull Request Guidelines
- This workspace does not include a Git history, so no established commit convention is available.
- Use short, imperative commit subjects (e.g., "Add category selector").
- PRs should include a concise description of the change, linked issue/ticket when applicable, screenshots or GIFs for UI changes, and notes on how the change was tested (or why it was not).
