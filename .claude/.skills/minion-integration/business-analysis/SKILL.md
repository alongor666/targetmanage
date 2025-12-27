---
name: business-analysis
description: 使用 Minion 框架进行智能业务分析
license: MIT
version: 1.0.0
category: minion-integration
---

# Business Analysis Skill

## 能力概述

此技能利用 Minion 的推理能力对业务数据进行深度分析，识别异常趋势、生成洞察、提供优化建议。与项目 Domain 层计算函数配合，提供智能分析能力。

## 核心功能

- **异常检测**：识别达成率、增长率异常机构
- **趋势分析**：时间序列分析、趋势预测
- **对比分析**：机构间、产品间对比
- **洞察生成**：自动生成业务洞察和建议

## 工作流程

```
用户发起分析请求
    ↓
Claude Code 调用此 Skill
    ↓
准备分析数据（从 Domain 层获取）
    ↓
调用 Minion API 进行分析
    ↓
返回分析报告和洞察
    ↓
展示可视化结果
```

## 使用示例

### 场景：分析机构达成情况

```typescript
// 1. 使用现有 Domain 函数准备数据
import { loadActualsMonthly2026, loadTargetsAnnual2026 } from '@/services/loaders';
import { calculateAchievementRate } from '@/domain/achievement';
import { calculateGrowthMetrics } from '@/domain/growth';

const actuals = await loadActualsMonthly2026();
const targets = await loadTargetsAnnual2026();

// 2. 准备分析数据
const analysisData = {
  organizations: actuals.map(record => ({
    id: record.org_id,
    product: record.product,
    metrics: {
      achievementRate: calculateAchievementRate(record.actual, findTarget(targets, record)),
      actual: record.actual,
      target: findTarget(targets, record)
    }
  })),
  timeRange: '2026-01:2026-03'
};

// 3. 调用 Minion 分析
import { callMinionAPI } from '@/lib/minion-client';

const analysis = await callMinionAPI({
  endpoint: '/api/analyze',
  method: 'POST',
  body: {
    type: 'achievement-analysis',
    data: analysisData,
    options: {
      detectAnomalies: true,
      compareWith: 'previous-year',
      generateInsights: true,
      threshold: 3
    }
  }
});

// 4. 展示分析结果
displayAnalysisReport(analysis);
```

## 集成方式

### 与 Domain 层配合

Minion 不替代 Domain 层计算，而是增强分析能力：

```typescript
// Domain 层：纯函数计算
const achievementRate = calculateAchievementRate(8500, 10000);  // 0.85
const growthRate = calculateGrowthRate(current, baseline);      // 0.15

// Minion：深度分析和洞察
const insights = await callMinionAPI({
  endpoint: '/api/analyze',
  method: 'POST',
  body: {
    data: {
      metrics: { achievementRate, growthRate },
      context: { org: '成都分公司', product: '车险' }
    },
    options: {
      analyzeTrends: true,
      compareWithPeers: true
    }
  }
});
// 返回: "达成率 85%，低于同类机构平均水平（92%），建议优化..."
```

### 分析配置

```typescript
// .claude/minion-analysis.config.json
{
  "anomalyDetection": {
    "method": "zscore",     // zscore, iqr, isolation_forest
    "threshold": 3
  },
  "trendAnalysis": {
    "windowSize": 3,        // 滑动窗口大小
    "forecastPeriods": 4    // 预测未来期数
  },
  "comparison": {
    "baseline": "2025-actual",
    "peers": "same-product"
  }
}
```

## 数据格式

### 输入格式

```json
{
  "type": "achievement-analysis",
  "data": {
    "organizations": [
      {
        "id": "chengdu",
        "product": "auto",
        "metrics": {
          "achievementRate": 0.85,
          "growthRate": 0.15,
          "actual": 8500,
          "target": 10000
        }
      }
    ],
    "timeRange": "2026-01:2026-03"
  },
  "options": {
    "detectAnomalies": true,
    "compareWith": "previous-year",
    "generateInsights": true,
    "threshold": 3
  }
}
```

### 输出格式

```json
{
  "summary": {
    "totalOrgs": 14,
    "anomaliesDetected": 3,
    "topPerformers": ["天府分公司", "高新分公司"],
    "underPerformers": ["宜宾分公司", "泸州分公司"]
  },
  "anomalies": [
    {
      "orgId": "yibin",
      "product": "auto",
      "type": "low-achievement",
      "severity": "high",
      "currentValue": 0.45,
      "expectedRange": [0.7, 1.2],
      "description": "达成率异常偏低（45%）",
      "recommendation": "建议进行专项调研，了解目标设定合理性"
    }
  ],
  "trends": {
    "overall": "increasing",
    "strength": "moderate",
    "forecast": {
      "nextQuarter": 1.05,
      "confidence": "medium"
    }
  },
  "insights": [
    "天府分公司连续 3 个月达成率超过 100%，表现优异",
    "宜宾分公司同比增长率最高（35%），但达成率偏低（45%），目标可能过于激进",
    "车险产品整体表现稳定，健康险产品波动较大"
  ],
  "recommendations": [
    "对达成率低于 60% 的机构进行目标合理性评估",
    "总结天府分公司最佳实践，向其他机构推广",
    "对健康险产品进行深入分析，识别波动原因"
  ]
}
```

## 分析类型

### 1. 达成率分析

- 识别低达成率机构（< 60%）
- 识别高达成率机构（> 100%）
- 对比历史同期
- 分析目标合理性

### 2. 增长率分析

- 识别负增长机构
- 识别高增长机构（> 30%）
- 同比/环比分析
- 增长趋势预测

### 3. 趋势分析

- 时间序列趋势（上升/下降/平稳）
- 季节性模式识别
- 预测未来 3 个月
- 趋势强度评估

### 4. 对比分析

- 机构之间对比
- 产品之间对比
- 时间段对比
- 与行业平均水平对比

## 最佳实践

### 1. 数据准备

```typescript
// ✅ 正确：使用 Domain 层函数
const metrics = {
  achievementRate: calculateAchievementRate(actual, target),
  growthRate: calculateGrowthRate(current, baseline)
};

// ❌ 错误：直接传原始数据让 Minion 计算
const data = { actual, target, current, baseline };
// Minion 不知道业务规则，可能计算错误
```

### 2. 分析配置

```typescript
// 根据分析目标选择配置
const configs = {
  quick: {
    detectAnomalies: false,
    generateInsights: true
  },
  detailed: {
    detectAnomalies: true,
    compareWith: 'previous-year',
    forecast: true,
    generateInsights: true
  }
};
```

### 3. 结果解读

```typescript
// 结合业务背景理解异常
if (anomaly.type === 'low-achievement') {
  if (anomaly.severity === 'high') {
    // 可能是目标设定过高，而非业绩问题
    console.log('建议重新评估目标合理性');
  }
}

// 验证洞察的合理性
const validation = await validateInsight(analysis.insights[0]);
if (!validation.valid) {
  console.warn('洞察可能不准确，建议人工确认');
}
```

### 4. 可视化

```typescript
// 使用现有的 Chart 组件展示分析结果
import { AchievementChart } from '@/components/charts';
import { AnomalyChart } from '@/components/charts';

<AnalysisResult>
  <AchievementChart data={analysis.data} />
  <AnomalyChart anomalies={analysis.anomalies} />
  <TrendChart trends={analysis.trends} />
</AnalysisResult>
```

## 参考文档

### 项目文档
- @doc docs/business/指标定义规范.md
- @doc docs/business/目标分配规则.md
- @doc docs/design/全局设计规范.md

### 代码实现
- @code src/domain/achievement.ts (达成率计算)
- @code src/domain/growth.ts (增长率计算)
- @code src/domain/aggregate.ts (数据聚合)
- @code src/components/charts/ (图表组件)

### 相关技能
- @code .claude/.skills/kpi-calculation/SKILL.md (KPI 计算技能)
- @code .claude/.skills/chart-visualization/SKILL.md (图表可视化技能)
