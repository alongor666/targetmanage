# 🎯 川分目标管理系统 (Target Management Visualization)

> 基于 Next.js 14 的车险经营目标管理与可视化分析平台

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](./docs/reference/版本更新日志.md)
[![License](https://img.shields.io/badge/license-Private-red.svg)](./LICENSE)

**项目概述**: 本项目用于将 2026 年度目标（机构×产品）按可配置权重拆解为月度/季度目标，并实时追踪达成率、时间进度及同比增长情况。系统采用“逻辑与数据分离”架构，支持从本地存储或静态文件加载数据，并提供严格的业务指标计算。

---

## ✨ 核心功能

*   **多维目标拆解**: 支持按月度（自定义权重）和季度自动拆解年度目标。
*   **双口径进度追踪**: 提供“线性时间进度”与“权重时间进度”双视角分析。
*   **严格指标计算**: 遵循严格的财务口径，支持同比增长率、增量计算（需 2025 基线）。
*   **动态组织模式**: 支持分公司、同城、异地、单机构等多种组织视图切换。
*   **大屏适配设计**: 针对 2400px 宽度的演示场景优化，支持 6 列 KPI 卡片布局。

## 🛠️ 技术栈

| 领域 | 技术选型 | 说明 |
|------|----------|------|
| **框架** | Next.js 14 (App Router) | 基于 React 的全栈框架 |
| **语言** | TypeScript 5 | 强类型保障 |
| **样式** | Tailwind CSS 3 | 原子化样式系统，自定义设计 Token |
| **可视化** | ECharts 5 | 高性能数据可视化 |
| **状态管理** | Zustand + React Query | 客户端状态 + 服务端数据缓存 |
| **工具库** | Zod + Papa Parse | 数据验证与 CSV 解析 |

## 🚀 快速开始

### 环境要求
*   Node.js 18.17+ 或 20.x (LTS)
*   pnpm (推荐)

### 安装与运行

```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发服务器
pnpm dev
# 访问 http://localhost:3000

# 3. 构建生产版本
pnpm build
pnpm start
```

## 📚 文档中心

本项目拥有完整的文档体系，详情请查阅 `docs/` 目录。

### 核心文档索引

*   **入门指南**: [📚 文档导航](./docs/README.md)
*   **业务规则**: 
    *   [📈 业务指标计算](./docs/business/业务指标计算.md) (核心口径定义)
    *   [⚖️ 权重分配规则](./docs/business/目标分配规则.md)
*   **架构设计**: 
    *   [🏗️ 系统架构设计](./docs/architecture/系统架构设计.md)
    *   [💼 业务架构设计](./docs/architecture/业务架构设计.md)
*   **开发指南**: 
    *   [💻 开发指南](./docs/development/开发指南.md)
    *   [UI开发指南](./docs/development/UI开发指南.md) (实现细节)
*   **设计系统**: 
    *   [🎨 全局设计规范](./docs/design/全局设计规范.md)
    *   [⚡ 设计实现指南](./docs/design/设计实现指南.md)

## 🏗️ 核心架构原则

1.  **数据加载优先级**: `localStorage` (用户导入) > `public/data` (静态默认) > Fallback (空数据)。
2.  **无硬编码**: 所有业务数据通过 JSON/CSV 加载，代码层仅包含计算逻辑与 Schema。
3.  **严格口径**: 不可计算指标（如分母为0）输出 `null`，严禁使用 `0` 代替。

---
**维护团队**: 开发团队 | **文档版本**: 2.0.0 | **更新时间**: 2025-12-23