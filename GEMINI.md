# Gemini Context: 川分目标管理系统 (v2.0.0)

你正在协助开发 **川分目标管理系统** (Target Management Visualization)，这是一个基于 **Next.js 14** 的企业级数据可视化应用。

## 核心任务与实施规划 (Critical)

当前处于 **V0 -> V1 过渡阶段**，请严格遵循 `docs/实施规划.md` 中的策略：

1.  **数据加载优先级 (Immutable Rule)**:
    *   必须严格遵循：`localStorage` (用户导入) > `public/data` (静态文件) > `Fallback` (空数据)。
    *   **2025年度数据兼容**: 支持双文件名读取（`actuals_annual_2025.json` 优先，`预测_annual_2025.json` 兼容）。
    *   文件路径：`src/services/loaders.ts`。

2.  **严格指标口径**:
    *   **增长率/增量**: 必须基于 2025 基线计算。若缺基线或分母为 0，必须返回 `null` (UI 显示 "—")，严禁补 0。
    *   **Null 安全**: 所有除法运算必须使用 `src/domain/achievement.ts` 中的 `safeDivide`。
    *   **双口径进度**: 必须同时计算“线性进度”和“权重进度”。

3.  **UI/UX 约束**:
    *   **大屏适配**: PPT 容器宽度固定为 **2400px**，内容区 **2100px**。
    *   **KPI 布局**: 大屏模式下强制使用 **6 列** 布局。
    *   **图表高度**: 标准图表高度 **600px**。

## 项目架构

### 目录结构 (Key Paths)

*   `src/domain/`: **纯函数计算引擎**。业务逻辑（增长率、达成率、权重）的核心。无副作用。
*   `src/services/`: **数据服务层**。负责数据加载、存储 (LocalStorage)、Zod 验证。
*   `src/config/`: **静态配置**。`organizationModes.ts` (组织模式), `progressWeights.ts` (权重)。
*   `src/components/`: **UI 组件**。
    *   `kpi/`: KPI 卡片 (KpiCard)。
    *   `charts/`: ECharts 图表容器。
*   `src/app/`: **Next.js 路由**。
*   `public/data/`: **静态数据源** (JSON)。开发期默认数据。

### 技术栈规范

*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript 5 (Strict types, no `any`)
*   **Styling**: Tailwind CSS 3 (使用 `src/styles/tokens.ts` 中的 Design Tokens)
*   **Visualization**: ECharts 5 (ReactECharts)
*   **State**: Zustand (Client), React Query (Server/Async)

## 常用命令

*   `pnpm dev`: 启动开发服务器
*   `pnpm build`: 构建生产版本
*   `pnpm typecheck`: TypeScript 类型检查 (重要)

## 开发行为准则

1.  **逻辑与数据分离**: 不要将业务数据硬编码在组件中。始终通过 `src/services` 加载数据。
2.  **别名-验证模式**: 处理 CSV/Excel 导入时，必须使用 Schema 验证列名映射，参考 `.gemini/GEMINI.md` 历史上下文。
3.  **组件设计**: UI 组件应保持“哑”(dumb)，复杂逻辑下沉到 Hooks 或 Domain 函数。
4.  **文档优先**: 在进行重大架构变更前，先查阅 `docs/architecture/` 和 `docs/business/`。

## 关键文档索引 (Docs Map)

*   **实施细节**: `docs/实施规划.md` (当前任务清单)
*   **业务逻辑**: `docs/business/业务指标计算.md`
*   **设计规范**: `docs/design/全局设计规范.md`
*   **UI 开发**: `docs/development/UI开发指南.md`