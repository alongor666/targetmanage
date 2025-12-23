# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` holds Next.js route segments and pages (App Router).
- `src/components/` contains reusable UI components (PascalCase files).
- `src/domain/`, `src/services/`, and `src/lib/` host business logic, data loaders, and shared utilities.
- `src/styles/` and `tailwind.config.js` define Tailwind tokens and global styles.
- `public/` stores static assets served by Next.js.
- `docs/` contains architecture, business, and design documentation (start at `docs/README.md`).
- `test_data_2026.*` files are sample datasets for local use.

## Build, Test, and Development Commands
- `npm run dev`: Start the Next.js dev server with hot reload.
- `npm run build`: Produce the production build.
- `npm run start`: Run the built production server.
- `npm run lint`: Run Next.js ESLint checks.
- `npm run typecheck`: Run TypeScript in strict, no-emit mode.

## Coding Style & Naming Conventions
- Use TypeScript, React, and Tailwind CSS; follow existing formatting (2-space indent, double quotes).
- Components: `PascalCase.tsx` (e.g., `TargetChart.tsx`).
- Hooks/utilities: `camelCase.ts` or `useSomething.ts`.
- Prefer path alias `@/` for `src/` imports.

## Testing Guidelines
- No test framework is configured yet; rely on `npm run lint` and `npm run typecheck`.
- If you add tests later, place them under `src/` with `*.test.ts(x)` naming.

## Commit & Pull Request Guidelines
- Git history is not available in this workspace; use Conventional Commits (`feat:`, `fix:`, `docs:`) unless the team specifies otherwise.
- PRs should include a clear summary, screenshots for UI changes, and any related issue links.

## Documentation & Agent Notes
- Update `docs/` alongside code changes; keep navigation in `docs/README.md` in sync.
- Avoid unrelated refactors; keep edits focused and traceable.
