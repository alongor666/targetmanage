# CLAUDE.md

Essential guidance for Claude Code when working with this repository.

**Version:** 4.0.0 (Optimized for LLM)
**Project:** Target Management & Visualization Platform (川分目标管理系统)
**Last Updated:** 2025-12-26

---

## 🎯 Project Overview

**Business Intelligence Platform** for Sichuan Branch vehicle insurance target management (2025-2026).

**What**: Next.js-based dashboard for multi-dimensional target allocation and achievement tracking across 14 organizations, 5 product lines, with real-time analytics.

**Why**: Enable data-driven decision making for insurance business performance monitoring with year-over-year growth analysis and quarterly/monthly breakdowns.

**Key Business Context**:
- 14 Organizations: 7 Local (Chengdu) + 7 Remote (other cities)
- 5 Products: `auto`, `property`, `life`, `health`, `total`
- **CRITICAL**: Use `null` for impossible calculations, **NEVER** `0`

---

## 🛠️ Tech Stack

- **Runtime**: Node.js 20+ (managed via nvm)
- **Framework**: Next.js 15 (App Router)
- **Package Manager**: pnpm 9+
- **Language**: TypeScript 5.7+
- **Validation**: Zod schemas
- **UI**: Tailwind CSS, shadcn/ui, Recharts
- **Data Storage**: localStorage + JSON files (no database)

### Essential Commands

```bash
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Production build
pnpm typecheck        # Run TypeScript checks
pnpm docs:check       # Validate @doc tags
pnpm docs:sync        # Regenerate code-doc indices
```

---

## 🏗️ Architecture

**Layered Architecture** (strict separation of concerns):

- **Presentation** (`app/`): Next.js pages, React components, UI logic
- **Domain** (`domain/`): Pure business logic, NO side effects, implements `docs/business/` rules
- **Service** (`services/`): Data loading with 3-tier priority pattern
- **Schema** (`schemas/`): Zod contracts, TypeScript types

**Key Directories**:
```
src/
├── domain/          # Business logic (CRITICAL - see below)
├── services/        # Data loaders (3-tier pattern)
├── schemas/         # Data contracts (Zod)
└── app/             # Next.js App Router

docs/
├── business/        # Business rules (AUTHORITY)
├── development/     # Code examples, standards
└── troubleshooting/ # Common issues, commands
```

---

## 🔄 Critical Workflows

### 1. Documentation-Driven Development

**ALWAYS follow** when modifying business logic in `src/domain/`:

1. Read `docs/.meta/code-index.json`
2. Find target file → check `"documentedIn"` field
3. **Read business documentation first**
4. Modify code
5. Add/update `@doc` JSDoc tag
6. Run `pnpm docs:check`
7. Commit changes

**Why**: Business rules are the source of truth. Code must implement documented rules, not vice versa.

### 2. Data Loading (3-Tier Priority)

**All data loaders follow this pattern**:

```
localStorage (user import) → public/data/*.json (defaults) → fallback (empty structure)
```

**Never hardcode business data** - all data comes from JSON files or user imports.

### 3. Domain Layer Requirements

**Every function in `src/domain/` MUST**:
- Have `@doc` tag pointing to business documentation (format: `docs/business/[file].md:[line]`)
- Return `number | null` for calculations (never `number` with fallback `0`)
- Include clear JSDoc with parameters and return value descriptions

See `docs/development/code-examples.md` for templates.

---

## 🔑 Key Conventions

### Null Safety (Financial Discipline)

**Rule**: If calculation is impossible (target=0, missing baseline), return `null` - **NEVER** `0`.

**Why**: `0` implies "0% achievement", `null` means "cannot calculate" - critical distinction for business reporting.

**UI Handling**: Display `null` as "—" (em dash).

### Product & Organization Types

```typescript
type Product = 'auto' | 'property' | 'life' | 'health' | 'total';
type OrgMode = 'branch' | 'local' | 'remote' | 'single' | 'multi';
type TimeProgressMode = 'linear' | 'weighted' | 'actual2025';
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `KpiCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatCurrency.ts`)
- Directories: `kebab-case/` (e.g., `kpi-card/`)
- Types: `PascalCase.types.ts`

---

## ✅ Always Do / ❌ Never Do

**ALWAYS**:
- ✅ Read business docs before modifying `domain/` logic
- ✅ Add `@doc` tags to domain functions
- ✅ Return `null` for impossible calculations
- ✅ Run `pnpm docs:check` before committing
- ✅ Use `git mv` when moving files (preserves history)
- ✅ Follow 3-tier data loading pattern

**NEVER**:
- ❌ Hardcode business data in code
- ❌ Return `0` when calculation is impossible
- ❌ Skip `@doc` tags in domain layer
- ❌ Modify domain logic without reading documentation
- ❌ Delete and recreate files (breaks git history)
- ❌ Use `npm` or `yarn` (project uses `pnpm`)

---

## 🧩 Reuse Philosophy

> "通用性必须复用，特有性在此基础上组合"
> (Reuse generic components, compose business-specific ones)

**Guidelines**:
- **Reuse**: Used in 3+ places, no business logic → Extract to shared component/utility
- **Compose**: Used in 1 place, has business logic → Build with generic components

See `docs/development/设计理念.md` for details.

---

## 🔧 Code Quality Enforcement

**Use tools, not LLM instructions**:
- **Formatting**: Prettier (auto-format on save)
- **Linting**: ESLint with strict rules
- **Type Safety**: `pnpm typecheck` (run before commits)
- **Doc Validation**: Pre-commit hook runs `pnpm docs:check`

Claude should focus on business logic, not code style.

---

## 🧠 AI Collaboration

**Skill**: `/ai-evolve` - Track AI understanding issues and evolve prompts

**Use cases**:
- Encountered misunderstanding → `/ai-evolve record`
- Need best practices → `/ai-evolve query "关键词"`
- Review learnings → `/ai-evolve report`

Knowledge base: `docs/ai-evolution/`

---

## 📚 Key Documentation

**For Claude** (read as needed):
1. **Business Rules**: `docs/business/指标定义规范.md`, `docs/business/目标分配规则.md`
2. **Code Examples**: `docs/development/code-examples.md` (templates, patterns)
3. **Troubleshooting**: `docs/troubleshooting/common-issues.md` (commands, fixes)
4. **Architecture**: `docs/architecture/系统架构设计.md`

**Index Files** (auto-generated):
- `docs/.meta/code-index.json` - Maps code files to documentation
- `docs/.meta/docs-index.json` - Maps documentation to code files

---

## 🆘 When Things Break

**Don't guess** - consult `docs/troubleshooting/common-issues.md` for:
- Build failures (TypeScript, Next.js, dependencies)
- Data loading issues (JSON, Zod validation, localStorage)
- Documentation sync problems

---

**Maintainers**: Development Team
**License**: Private
**Related**: `README.md` | `AGENTS.md` | `GEMINI.md`
