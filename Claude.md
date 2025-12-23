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

### Time Progress Modes (Three Options)

Defined in `src/domain/time.ts`:

**Linear Mode** (equal monthly distribution):
- Year: `month / 12`
- Quarter: `(month - quarterStart + 1) / 3`

**Weighted Mode** (configurable monthly weights):
- Year: `sum(weights[0..month-1])`
- Quarter: `sum(weights[quarterStart..month]) / sum(weights[quarterStart..quarterEnd])`

**2025 Actual Mode** (based on 2025 actual data distribution):
- Year: `sum(actuals2025[0..month-1]) / sum(actuals2025[0..11])`
- Quarter: `sum(actuals2025[quarterStart..month-1]) / sum(actuals2025[quarterStart..quarterEnd])`
- Requires: Complete 2025 monthly actual data
- Advantage: Reflects real business rhythm for more accurate time achievement rate

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

## 🔍 智能查询系统

### 在开始任何任务前，使用索引定位

#### 场景1: 修改业务逻辑
```bash
# 错误方式 ❌
直接修改 src/domain/time.ts

# 正确方式 ✅
1. 读取 docs/.meta/code-index.json
2. 查找 "src/domain/time.ts" 的 documentedIn 字段
3. 阅读对应的业务文档（如 docs/business/指标定义规范.md:26-64）
4. 理解业务逻辑后再修改
5. 更新 @doc 标记
6. 运行 pnpm docs:check 验证
```

#### 场景2: 更新业务定义
```bash
# 错误方式 ❌
只修改文档，忘记更新代码

# 正确方式 ✅
1. 读取 docs/.meta/docs-index.json
2. 查找文档的 implementedIn 字段
3. 找到所有实现该定义的代码文件
4. 同步更新代码实现
5. 更新 JSDoc 注释
6. 运行 pnpm docs:sync 重新生成索引
```

#### 场景3: 重构文件结构
```bash
# 错误方式 ❌
直接删除旧文件，创建新文件

# 正确方式 ✅
1. 使用 git mv 移动文件
2. 读取 docs/.meta/graph.json 查看依赖关系
3. 更新所有引用该文件的代码
4. 更新所有引用该文件的文档
5. 运行 pnpm docs:sync 更新索引
6. 验证知识图谱完整性
```

## 📚 Documentation System（知识图谱驱动）

Project has comprehensive docs in `docs/` organized by layer:

- `design/`: Design system and component specifications
- `architecture/`: System architecture and data models ← **包含索引系统设计**
- `business/`: Business metrics and weight allocation rules ← **核心业务逻辑定义**
- `development/`: Development setup and implementation guides
- `reference/`: API reference and troubleshooting
- `.meta/`: **知识图谱索引（必读）** ← **NEW**

**Entry points**:
- `docs/README.md` - complete documentation index
- `docs/.meta/README.md` - **索引系统总览** ← **START HERE**
- `docs/.meta/ai-context.md` - **AI工具使用指南** ← **MUST READ**

**Documentation update rules（带索引验证）**:
- Design changes → update `docs/design/` → **verify graph.json**
- Architecture changes → update `docs/architecture/` → **verify graph.json**
- Business changes → update `docs/business/` → **update code-index.json references**
- Implementation changes → update `docs/development/` → **run docs:sync**
- **ANY file move** → **run docs:sync --update-refs**

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

---

## 🤖 Claude Code 专属工作流

### Step 1: 任务分析（必须）
在接收到任务后，首先分析：
1. 任务类型（新增/修改/重构/修复/文档）
2. 查询知识图谱索引
3. 识别关联的文档和代码

### Step 2: 上下文收集（关键）
基于索引收集：
- 主要修改文件
- 关联业务文档  
- 依赖的代码模块
- 可能影响的文件

### Step 3: 执行修改（规范）
遵循文档驱动开发：
1. 新增功能先更新业务文档
2. 实现代码添加完整JSDoc和@doc标记
3. 更新所有使用方
4. 运行 `pnpm docs:check` 验证
5. 运行 `pnpm docs:sync` 生成索引

### Step 4: 提交前检查（强制）
```bash
pnpm typecheck  # TypeScript检查
pnpm docs:check # 文档一致性
git status docs/.meta/  # 索引更新
```

### Step 5: 沟通输出（清晰）
说明：主要变更、关联更新、验证结果、影响范围

---

## 📊 质量保障

### domain层额外要求
每个导出函数必须：
- ✅ 完整JSDoc注释
- ✅ @doc标记指向业务文档
- ✅ @formula标记（如有公式）
- ✅ @param/@returns说明
- ✅ 业务文档中有对应定义
- ✅ 索引文件中有记录

---

## 🎓 必读文档
1. `docs/.meta/ai-context.md` - AI工具指南
2. `docs/architecture/文档代码索引系统设计.md` - 完整设计
3. `docs/.meta/QUICKSTART.md` - 快速入门

