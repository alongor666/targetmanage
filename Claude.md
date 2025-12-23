# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vehicle insurance target management and visualization platform for Sichuan branch (2025-2026). The system enables:

- Annual target allocation to monthly/quarterly targets using configurable weights
- Actual data entry with achievement rate calculations (monthly/quarterly/annual)
- Time progress achievement rates with dual calculation modes (linear vs weighted)
- Year-over-year growth metrics (requires 2025 baseline data)
- Large-screen display optimization (2400px PPT container width)

## Development Commands

```bash
pnpm i           # Install dependencies
pnpm dev         # Start development server
pnpm build       # Build for production
pnpm start       # Run production build
pnpm lint        # Run ESLint
pnpm typecheck   # TypeScript type checking
```

## Technology Stack

- **Framework**: Next.js 14 (App Router) + React 18
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Visualization**: ECharts + echarts-for-react
- **Data Validation**: Zod schemas
- **CSV Parsing**: Papa Parse

## Architecture

### Layered Structure

```
src/
├── app/           # Next.js App Router pages (presentation)
├── components/    # React UI components
├── config/        # Static configurations (org modes, weights)
├── domain/        # Pure business logic functions
├── lib/           # Utility functions
├── schemas/       # Zod data contracts
└── services/      # Data loading and storage (side effects)
```

### Data Loading Priority (Critical Pattern)

All data loaders follow this 3-tier fallback pattern:

```
localStorage (user import) > public/data (static defaults) > fallback (empty data)
```

Example: `loadActualsMonthly2025()` in `src/services/loaders.ts:111-129`

**Never hardcode numerical values** - all data comes from JSON files or user imports. The code layer only contains:
- Zod schemas (data contracts)
- Pure calculation functions
- Visualization and interaction logic

### Organization System

The platform supports 5 organization modes defined in `src/config/organizationModes.ts`:

| Mode | Description | Orgs Count |
|------|-------------|------------|
| `branch` | All 14 organizations | 14 |
| `local` | Local (Chengdu) organizations only | 7 |
| `remote` | Remote organizations only | 7 |
| `single` | Single organization | 1 |
| `multi` | User-selected custom set | variable |

**14 Organizations:**
- Local: 本部, 天府, 高新, 新都, 青羊, 武侯, 西财俊苑
- Remote: 宜宾, 泸州, 德阳, 资阳, 乐山, 自贡, 达州

### Domain Layer (Pure Functions)

The `src/domain/` directory contains business logic as pure functions:

| File | Purpose |
|------|---------|
| `achievement.ts` | Achievement rate calculation with `safeDivide()` |
| `aggregate.ts` | Data aggregation by group/product |
| `allocation.ts` | Annual target to monthly/quarterly allocation |
| `growth.ts` | YoY growth metrics (6 fields) |
| `time.ts` | Time progress calculations (dual modes) |
| `validate.ts` | Data validation functions |

### Growth Metrics Calculation

The `src/domain/growth.ts` module calculates 6 growth fields:

**Growth Rates (percentage):**
- `growth_month_rate`: Current month vs baseline month
- `growth_quarter_rate`: Current quarter vs baseline quarter
- `growth_ytd_rate`: YTD vs baseline YTD

**Increments (absolute):**
- `inc_month`: Current month - baseline month
- `inc_quarter`: Current quarter - baseline quarter
- `inc_ytd`: YTD - baseline YTD

**Null Safety**: Division by zero or missing baseline returns `null` (displayed as "—" in UI)

### Time Progress Dual Modes

Defined in `src/domain/time.ts`:

**Linear Mode** (equal monthly distribution):
- Year: `month / 12`
- Quarter: `(month - quarterStart + 1) / 3`

**Weighted Mode** (configurable monthly weights):
- Year: `sum(weights[0..month-1])`
- Quarter: `sum(weights[quarterStart..month]) / sum(weights[quarterStart..quarterEnd])`

### Data Schemas

All data contracts defined in `src/schemas/schema.ts` using Zod:

- `OrgSchema`: Organization structure
- `AnnualTargetRecordSchema`: Annual target records
- `AnnualActualRecordSchema`: Annual actual records
- `MonthlyActualRecordSchema`: Monthly actual records
- `AllocationRuleSchema`: Weight allocation rules (must sum to 1.0)

### Product Categories

Products in the system:
- `auto`: Vehicle insurance
- `property`: Property insurance
- `life`: Life insurance
- `health`: Health insurance
- `total`: Aggregated total

## Documentation System

Project has comprehensive docs in `docs/` organized by layer:

- `design/`: Design system and component specifications
- `architecture/`: System architecture and data models
- `business/`: Business metrics and weight allocation rules
- `development/`: Development setup and implementation guides
- `reference/`: API reference and troubleshooting

**Entry point**: `docs/README.md` - complete documentation index

**Documentation update rules**:
- Design changes → update `docs/design/`
- Architecture changes → update `docs/architecture/`
- Business changes → update `docs/business/`
- Implementation changes → update `docs/development/`

## File Naming Compatibility

The data loader supports legacy filename compatibility for transition period:

- Current: `actuals_annual_2025.json`
- Legacy: `预测_annual_2025.json` (supported for at least one version cycle)

## UI Layout Standards

Based on `docs/design/全局设计规范.md`:
- PPT container width: 2400px
- Content area width: 2100px
- KPI card grid: 6 columns (large screen)
- Chart height: 600px (standard)
