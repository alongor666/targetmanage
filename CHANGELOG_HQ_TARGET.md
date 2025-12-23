# 总公司目标达成预测功能 - 更新日志

## 功能概述

基于三级机构的实际达成情况，预测四川分公司整体对总公司目标的完成度。该功能不按三级机构拆分，仅按产品分类展示预测达成率。

## 数据配置

### 总公司目标设定（2026年）

文件位置：`public/data/headquarters_targets_annual_2026.json`

| 产品 | 总公司目标 | 三级机构目标总和 | 差异 | 超额比例 |
|------|-----------|----------------|------|---------|
| 车险 | 43,000万元 | 45,470万元 | +2,470 | +5.74% |
| 财产险 | 10,850万元 | 12,050万元 | +1,200 | +11.06% |
| 人身险 | 13,800万元 | 15,590万元 | +1,790 | +12.97% |
| 健康险 | 0万元 | 0万元 | 0 | - |
| **合计** | **67,650万元** | **73,110万元** | **+5,460** | **+8.07%** |

**关键洞察：**
- 三级机构目标总和比总公司目标高8.07%
- 这意味着如果所有三级机构都达成各自目标，将超额完成总公司目标
- 提供了约8%的安全边际

## 技术实现

### 1. 数据层 (Schema & Types)
- `src/schemas/schema.ts`: 添加 `HeadquartersTargetRecordSchema`
- `src/schemas/types.ts`: 添加 `HeadquartersTargetRecord` 类型

### 2. 数据加载 (Services)
- `src/services/loaders.ts`:
  - 新增 `HeadquartersTargetsFileSchema`
  - 新增 `loadHeadquartersTargetsAnnual2026()` 函数

### 3. 业务逻辑 (Domain)
- `src/domain/headquarters.ts` (新文件):
  - `calculateHqAchievementRate()`: 计算达成率
  - `calculateHqGap()`: 计算差距
  - `aggregateHqTargetsByProduct()`: 按产品聚合
  - `predictMonthlyHqAchievement()`: 月度预测
  - `calculateQuarterHqAchievementRate()`: 季度达成率

### 4. UI组件 (App)
- `src/app/page.tsx`:
  - 添加 `hqPrediction` useMemo计算逻辑
  - 新增蓝色背景预测展示区块
  - 5个产品卡片（车险、财产险、人身险、健康险、汇总）
  - 月度累计达成预测图表（ECharts双Y轴）

## UI展示

### 预测卡片
每个产品显示：
- 总公司目标金额
- YTD实际完成金额
- 当前达成率（带颜色标识）

颜色规则：
- 🟢 绿色：达成率 ≥ 100%（超额完成）
- 🔴 红色：达成率 < 80%（严重未达标）
- 🔵 蓝色：80% ≤ 达成率 < 100%（需加强）

### 预测图表
- X轴：1-12月
- 左Y轴：保费金额（万元）
  - 柱状图：累计实际
  - 折线图：累计目标
- 右Y轴：达成率（%）
  - 折线图：月度达成率趋势

## 业务文档

更新文件：`docs/business/指标定义规范.md`

新增章节：**总公司目标达成预测（V1）**
- 核心概念说明
- 数据来源
- 预测指标定义
- 差距分析方法
- UI展示规范
- 使用场景说明

## 使用场景

1. **目标差异监控**
   - 实时监控三级机构实际达成情况与总公司目标的关系
   - 当前有8.07%的安全边际

2. **提前预警**
   - 基于当前进度预测年底是否能达成总公司目标
   - 及时发现偏差并采取措施

3. **产品结构调整**
   - 识别哪些产品需要加强推动
   - 优化资源配置

4. **安全边际分析**
   - 评估三级机构目标设定是否合理
   - 容错空间分析

## 如何使用

### 查看预测
1. 启动开发服务器：`pnpm dev`
2. 访问主页：http://localhost:3000
3. 在页面下方找到蓝色背景的"总公司目标达成预测"区块
4. 查看各产品的达成情况
5. 切换产品下拉框，查看不同产品的月度预测趋势

### 修改总公司目标
编辑文件：`public/data/headquarters_targets_annual_2026.json`

```json
{
  "year": 2026,
  "unit": "万元",
  "type": "headquarters_targets_annual",
  "records": [
    {
      "year": 2026,
      "product": "auto",
      "annual_target": 43000,
      "unit": "万元"
    }
    // ... 其他产品
  ]
}
```

修改后刷新页面即可生效。

## 数据流程

```
三级机构月度实际数据
    ↓
aggregateMonthlyActuals() - 聚合到全省维度（all视角）
    ↓
loadHeadquartersTargetsAnnual2026() - 加载总公司目标
    ↓
aggregateHqTargetsByProduct() - 按产品分组
    ↓
calculateHqAchievementRate() - 计算达成率
    ↓
UI展示（卡片 + 图表）
```

## 验证

- ✅ TypeScript类型检查通过
- ✅ 生产构建成功
- ✅ 所有页面正常生成
- ✅ 数据加载正常
- ✅ 计算逻辑正确
- ✅ UI渲染正常

## 版本信息

- **创建日期**: 2025-12-23
- **版本**: V1.0
- **作者**: Claude Code
- **相关PR**: (待填写)

## 未来优化方向

1. 支持按时间进度口径（线性/权重/2025实际）计算总公司目标达成率
2. 添加季度维度的预测展示
3. 支持历史趋势对比
4. 添加导出预测报告功能
5. 支持自定义预警阈值
