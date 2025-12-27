# UI重构开发计划

## 📋 已完成工作

✅ **设计系统搭建**
- `src/styles/design-tokens-v2.ts` - 完整的设计token配置
- 色彩、字体、布局、阴影等全部规范化

✅ **V2组件库**（`src/components/v2/`）
- Button.tsx - 按钮组件
- Card.tsx - 卡片容器
- KpiCard.tsx - KPI卡片
- Dropdown.tsx - 下拉选择器
- FilterTag.tsx - 筛选标签
- Navbar.tsx - 顶部导航栏
- index.ts - 统一导出

✅ **Demo页面**（`src/app/demo/page.tsx`）
- 完整的新布局展示
- 4个KPI卡片：年度目标、年度达成、年增长率、年达成率
- 模拟数据填充完整

---

## 🚀 后续开发计划

### 阶段1：数据集成（P0 - 最高优先级）

**目标**：将旧版页面的真实数据集成到新UI

#### 1.1 创建新版主页（基于demo）
- [ ] 复制 `src/app/demo/page.tsx` → `src/app/demo-v2/page.tsx`
- [ ] 保留旧版页面 `/` 作为备份
- [ ] 新版页面路径：`/demo-v2`

#### 1.2 数据层集成
- [ ] 复制旧版数据加载逻辑（`src/app/page.tsx` lines 168-187）
  ```typescript
  // 导入所有数据加载函数
  loadOrgs(), loadAllocationRules(), loadTargetsAnnual2026(),
  loadActualsAnnual2025(), loadActualsMonthly2025(),
  loadActualsMonthly2026(), loadHeadquartersTargetsAnnual2026()
  ```

- [ ] 复制所有useMemo计算逻辑
  - `orgMap` - 机构映射
  - `annualTargetAgg` - 年度目标聚合
  - `annualActualAgg2025` - 2025年度实际聚合
  - `actualsPeriod2026` - 2026年度实际数据
  - `actualsPeriod2025` - 2025年度实际数据
  - `kpi` - 核心KPI计算
  - `hqPrediction` - 总公司预测

#### 1.3 KPI卡片数据绑定
- [ ] 年度目标 → `kpi.annual`
- [ ] 年度达成 → `actualsPeriod2026.ytd`
- [ ] 年增长率 → `kpi.growthMetrics.growth_ytd_rate`
- [ ] 年达成率 → `actualsPeriod2026.ytd / kpi.annual`

---

### 阶段2：图表集成（P1 - 高优先级）

#### 2.1 季度保费规划图
- [ ] 集成 `quarterlyPremiumData`（旧版 lines 438-475）
- [ ] 使用 `UniversalChart` 组件
- [ ] 图表类型：`quarterlyPremium`
- [ ] 配置：
  ```typescript
  <UniversalChart
    chartType="quarterlyPremium"
    data={createQuarterlyPremiumAdapter().adapt(quarterlyPremiumData)}
    config={{
      title: generateChartTitle(viewLabel, {...}),
      height: 360,
    }}
  />
  ```

#### 2.2 月度保费规划图
- [ ] 集成 `monthlyPremiumData`（旧版 lines 478-526）
- [ ] 使用 `UniversalChart` 组件
- [ ] 图表类型：`monthlyPremium`
- [ ] 配置：
  ```typescript
  <UniversalChart
    chartType="monthlyPremium"
    data={createMonthlyPremiumAdapter().adapt(monthlyPremiumData)}
    config={{
      title: generateChartTitle(viewLabel, {...}),
      height: 360,
      showDataLabel: true,
      currentMonth: month,
    }}
  />
  ```

#### 2.3 总公司预测图
- [ ] 集成 `hqPredictionData`（旧版 lines 529-551）
- [ ] 使用 `UniversalChart` 组件
- [ ] 图表类型：`hqPrediction`
- [ ] 4个产品卡片数据绑定

---

### 阶段3：筛选器功能（P1）

#### 3.1 筛选器状态管理
- [ ] 视角选择器 → `viewKey`（all/local/remote/单机构）
- [ ] 产品选择器 → `product`（total/auto/property/life）
- [ ] 截至月份 → `month`（1-12）
- [ ] 时间进度口径 → `progressMode`（linear/weighted/actual2025）

#### 3.2 筛选器数据联动
- [ ] 选择变更 → 重新计算所有数据
- [ ] 更新当前筛选标签显示
- [ ] 更新数据状态信息

#### 3.3 操作按钮功能
- [ ] 清空缓存按钮 → `lsRemove(LS_KEYS)`
- [ ] 导出数据按钮（新增）
- [ ] 刷新数据按钮 → `setDataResetTick(v => v + 1)`

---

### 阶段4：响应式优化（P2）

#### 4.1 移动端适配
- [ ] KPI卡片：桌面4列 → 平板2列 → 移动1列
- [ ] 图表：保持全宽，调整高度
- [ ] 筛选器：移动端垂直堆叠
- [ ] 总公司卡片：移动端单列

#### 4.2 交互优化
- [ ] 卡片悬停效果测试
- [ ] 下拉框焦点状态测试
- [ ] 按钮点击反馈测试

---

### 阶段5：测试验证（P2）

#### 5.1 功能测试
- [ ] 数据加载测试（有数据/无数据场景）
- [ ] 筛选器联动测试
- [ ] 图表渲染测试
- [ ] 数据计算准确性验证

#### 5.2 兼容性测试
- [ ] Chrome/Edge/Safari浏览器测试
- [ ] 桌面端/平板/移动端测试
- [ ] TypeScript编译测试（`pnpm typecheck`）

---

### 阶段6：上线发布（P3）

#### 6.1 代码清理
- [ ] 删除demo页面中的模拟数据
- [ ] 代码格式化和注释完善
- [ ] 删除未使用的旧组件（可选）

#### 6.2 文档更新
- [ ] 更新README.md
- [ ] 更新组件使用文档
- [ ] 更新部署文档

#### 6.3 版本切换
- [ ] 将 `/demo-v2` 切换为默认首页 `/`
- [ ] 旧版页面保留为 `/legacy`
- [ ] 更新导航链接

---

## 📝 关键文件清单

### 数据源文件（不需修改）
```
src/services/loaders.ts        # 数据加载函数
src/domain/achievement.ts      # 达成率计算
src/domain/allocation.ts       # 目标分配
src/domain/growth.ts           # 增长率计算
src/domain/time.ts             # 时间进度计算
src/domain/headquarters.ts     # 总公司计算
```

### 需要创建的文件
```
src/app/demo-v2/page.tsx       # 新版主页（基于demo）
```

### 需要更新的文件
```
src/app/demo-v2/page.tsx       # 集成真实数据
```

---

## ⏱️ 预估时间

| 阶段 | 任务 | 预估时间 |
|------|------|----------|
| 阶段1 | 数据集成 | 2-3小时 |
| 阶段2 | 图表集成 | 2-3小时 |
| 阶段3 | 筛选器功能 | 1-2小时 |
| 阶段4 | 响应式优化 | 1小时 |
| 阶段5 | 测试验证 | 1-2小时 |
| 阶段6 | 上线发布 | 1小时 |
| **总计** | | **8-12小时** |

---

## 🎯 开发顺序建议

1. **先做阶段1**：数据集成是基础，必须先完成
2. **再做阶段2**：图表是核心功能，优先级高
3. **然后阶段3**：筛选器功能完善用户体验
4. **最后阶段4-6**：优化和发布

---

## 💡 注意事项

1. **保留旧版页面**：在新版完全稳定前，保留 `/` 作为备份
2. **渐进式迁移**：可以先完成部分功能就上线测试
3. **数据验证**：每个阶段完成后都要验证数据准确性
4. **用户反馈**：上线后收集用户反馈，持续优化

---

## 🚦 下一步行动

**立即开始**：
```bash
# 1. 启动开发服务器
pnpm dev

# 2. 访问demo页面查看效果
# http://localhost:3000/demo

# 3. 开始阶段1：数据集成
# 复制 src/app/demo/page.tsx → src/app/demo-v2/page.tsx
# 开始集成真实数据
```
