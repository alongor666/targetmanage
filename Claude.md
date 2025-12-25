# CLAUDE.md

This file provides essential guidance to Claude Code when working with this repository.

**Last Updated:** 2025-12-25
**Version:** 3.0.0 (Optimized)
**Project:** Target Management & Visualization Platform (川分目标管理系统)

---

## 🎯 Project Overview

**Target Management & Visualization Platform** for Sichuan Branch (2025-2026)

A Next.js-based business intelligence platform for managing vehicle insurance targets with:
- **Multi-dimensional Target Allocation**: Annual → Monthly/Quarterly breakdown
- **Real-time Achievement Tracking**: Monthly/Quarterly/Annual achievement rates
- **3 Time Progress Modes**: Linear, Weighted, 2025-Actual based calculations
- **Year-over-Year Growth**: Requires 2025 baseline data (6 metrics)
- **Organization Flexibility**: 14 organizations (7 local + 7 remote)

**Key Business Context**:
- 14 Organizations: 7 Local (Chengdu) + 7 Remote (other cities)
- 5 Products: auto, property, life, health, total
- Critical: Use `null` for impossible calculations, NEVER `0`

---

## 🏗️ Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────┐
│  Presentation Layer (app/)                      │
│  - Next.js pages, React components              │
├─────────────────────────────────────────────────┤
│  Domain Layer (domain/)                         │
│  - Pure business logic, NO side effects         │
│  - Implements docs/business rules               │
├─────────────────────────────────────────────────┤
│  Service Layer (services/)                      │
│  - Data loading (localStorage → JSON → fallback)│
├─────────────────────────────────────────────────┤
│  Schema Layer (schemas/)                        │
│  - Zod contracts, TypeScript types              │
└─────────────────────────────────────────────────┘
```

### Key Directories

```
src/
├── domain/           # Pure business logic (CRITICAL)
│   ├── achievement.ts    # Achievement rate calculations
│   ├── growth.ts         # YoY growth metrics
│   ├── time.ts           # Time progress (3 modes)
│   └── validate.ts       # Business validation
│
├── services/         # Data loading (side effects)
│   └── loaders.ts        # 3-tier priority pattern
│
├── schemas/          # Data contracts
│   └── schema.ts         # Zod schemas
│
└── app/              # Next.js App Router
    └── page.tsx          # Main dashboard

docs/
├── business/         # Business rules (AUTHORITY)
│   ├── 指标定义规范.md
│   └── 目标分配规则.md
│
└── .meta/            # Auto-generated indices
    ├── code-index.json    # Code → Doc mapping
    └── docs-index.json    # Doc → Code mapping
```

---

## 🔄 Critical Workflows

### Documentation-Driven Development

**ALWAYS follow when modifying business logic:**

```
1. Read docs/.meta/code-index.json
2. Find file → check "documentedIn" field
3. Read business documentation
4. Modify code
5. Add @doc JSDoc tag
6. Run pnpm docs:check
7. Commit changes
```

### Data Loading Pattern (3-Tier)

**CRITICAL**: All data loaders follow this priority:

```typescript
localStorage (user import) → public/data (defaults) → fallback (empty)
```

**Never hardcode data values** - all business data comes from JSON files or user imports.

### Domain Layer Requirements

**Every function in `src/domain/` MUST have:**

```typescript
/**
 * [Clear description]
 *
 * @doc docs/business/[file].md:[line]  ← REQUIRED
 * @formula [mathematical formula if applicable]
 *
 * @param [name] [description]
 * @returns [description, including null cases]
 */
export function functionName(...) {
  // Implementation
}
```

---

## 🔑 Key Conventions

### 1. Null Safety (Strict Financial Discipline)

**Business Rule**: If calculation is impossible (division by zero, missing baseline), return `null` - NEVER `0`.

```typescript
// ✅ CORRECT
export function calculateAchievementRate(actual: number, target: number): number | null {
  if (target === 0) return null;  // Can't calculate
  return actual / target;
}

// ❌ WRONG
export function calculateAchievementRate(actual: number, target: number): number {
  if (target === 0) return 0;  // ❌ Implies 0% achievement
  return actual / target;
}
```

**UI Handling**: Display `null` as "—" (em dash).

### 2. Product Types

```typescript
type Product = 'auto' | 'property' | 'life' | 'health' | 'total';
```

### 3. File Naming

```
Components:   PascalCase.tsx     (KpiCard.tsx)
Utilities:    camelCase.ts       (formatCurrency.ts)
Directories:  kebab-case/        (kpi-card/)
Types:        PascalCase.types.ts
```

### 4. Organization Modes

- `branch`: All 14 organizations
- `local`: Chengdu area (7)
- `remote`: Other cities (7)
- `single`: Individual org
- `multi`: Custom selection

### 5. Always Do ✅ / Never Do ❌

**ALWAYS**:
- ✅ Read business documentation before modifying domain logic
- ✅ Add `@doc` tags to domain layer functions
- ✅ Follow 3-tier data loading pattern
- ✅ Return `null` for impossible calculations (not `0`)
- ✅ Run `pnpm docs:check` before committing
- ✅ Use `git mv` when moving files

**NEVER**:
- ❌ Hardcode business data in code
- ❌ Return `0` when calculation is impossible (use `null`)
- ❌ Skip `@doc` tags in domain layer
- ❌ Modify code without reading business documentation
- ❌ Delete and recreate files (use `git mv`)

---

## 🧩 Reuse Philosophy

> **核心原则**: "通用性必须复用，特有性在此基础上组合"

**判断标准**:
- 通用性：跨3+场景使用，不含业务逻辑 → 复用
- 特有性：仅1个场景，含业务特定逻辑 → 组合构建

**实践**:
- ✅ 复用原子组件: Button, Input, formatCurrency, sortOrgItems
- ✅ 组合构建业务组件: 使用通用组件 + 业务逻辑
- ❌ 避免重复造轮子: 检查现有组件索引

详见: `docs/development/设计理念.md`

---

## 🧠 AI Programming Evolution

**核心理念**: 记录问题、分析本质、改进Prompt、形成体系

**使用场景**:
- 遇到AI理解问题 → `/ai-evolve record`
- 需要最佳实践 → `/ai-evolve query "关键词"`
- 定期回顾 → `/ai-evolve report`

**知识库位置**: `docs/ai-evolution/`

---

## 🐛 Common Issues

### Documentation Sync Issues
```bash
# Indices out of sync
pnpm docs:sync --force

# Broken links
pnpm docs:check
```

### Build Failures
```bash
# TypeScript errors
pnpm typecheck

# Next.js errors
rm -rf .next && pnpm build

# Dependency issues
rm -rf node_modules pnpm-lock.yaml && pnpm install
```

### Data Loading Issues
- Check browser console for errors
- Verify JSON file exists in `public/data/`
- Check Zod schema validation
- Clear localStorage if corrupted

---

## 📚 Essential Reading

**For Claude (Priority Order)**:
1. This file (CLAUDE.md) - Essential guidance
2. `docs/.meta/ai-context.md` - AI tools workflow
3. `docs/business/指标定义规范.md` - Business metrics authority
4. `docs/.meta/code-index.json` - Code → Doc mapping

**For Humans**:
- `README.md` - Project overview
- `docs/.meta/QUICKSTART.md` - 5-minute intro
- `docs/development/开发指南.md` - Coding standards

---

## 🔗 Quick Links

**Business Rules**:
- `docs/business/指标定义规范.md` - Metric definitions
- `docs/business/目标分配规则.md` - Allocation rules

**Development**:
- `docs/development/开发指南.md` - Development standards
- `docs/architecture/系统架构设计.md` - System architecture
- `docs/architecture/文档代码索引系统设计.md` - Index system

**Design**:
- `docs/design/全局设计规范.md` - Design system specs

---

**Maintainers**: Development Team
**Version**: 3.0.0 (Optimized)
**Last Updated**: 2025-12-25
**License**: Private

**Related**: `README.md` | `AGENTS.md` | `GEMINI.md`
