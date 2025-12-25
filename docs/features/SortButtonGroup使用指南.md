# 排序按钮组件使用指南

## 概述

`SortButtonGroup` 是一个全局可复用的排序按钮组件，支持多种排序方式切换。

## 特性

- ✅ 支持升序/降序切换
- ✅ 可配置多个排序选项
- ✅ 活动状态高亮显示
- ✅ 箭头指示排序方向
- ✅ 完全可复用的设计
- ✅ 支持 readonly 数组
- ✅ 可自定义尺寸和样式

## 基础用法

```tsx
import { SortButtonGroup, SortPresets, type SortOrder } from 'src/components/ui/SortButtonGroup';

function MyComponent() {
  const [sortKey, setSortKey] = useState<OrgSortKey>('premium');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  return (
    <SortButtonGroup
      options={SortPresets.orgPremium}
      activeKey={sortKey}
      sortOrder={sortOrder}
      onSortChange={(key, order) => {
        setSortKey(key);
        setSortOrder(order);
      }}
    />
  );
}
```

## 预设选项

组件提供了常用的预设选项：

```tsx
import { SortPresets } from 'src/components/ui/SortButtonGroup';

// 保费规划图排序选项
SortPresets.orgPremium
// => [
//      { key: 'premium', label: '保费规划' },
//      { key: 'share', label: '占比规划' },
//      { key: 'growth', label: '增长率规划' },
//    ]

// 通用数值排序选项
SortPresets.numeric
// => [
//      { key: 'value', label: '数值' },
//      { key: 'percent', label: '百分比' },
//    ]

// 时间排序选项
SortPresets.temporal
// => [
//      { key: 'date', label: '日期' },
//      { key: 'period', label: '周期' },
//    ]
```

## 自定义选项

```tsx
const customOptions = [
  { key: 'name', label: '名称' },
  { key: 'date', label: '日期', disabled: true }, // 禁用该选项
  { key: 'amount', label: '金额' },
];

<SortButtonGroup
  options={customOptions}
  activeKey="name"
  sortOrder="asc"
  onSortChange={(key, order) => console.log(key, order)}
/>
```

## 尺寸和样式

```tsx
// 小尺寸
<SortButtonGroup size="sm" />

// 中等尺寸（默认）
<SortButtonGroup size="md" />

// 大尺寸
<SortButtonGroup size="lg" />

// 样式变体
<SortButtonGroup variant="default" />  // 默认
<SortButtonGroup variant="outline" />  // 轮廓
<SortButtonGroup variant="ghost" />    // 幽灵
```

## 与排序工具结合使用

```tsx
import { sortOrgItems, type SortableOrgItem } from 'src/lib/sorting';

// 准备数据
const sortableData: SortableOrgItem[] = [
  { org_id: '1', org_name: '机构A', premium: 100, share: 20, growth: 5.5 },
  { org_id: '2', org_name: '机构B', premium: 200, share: 40, growth: 10.2 },
];

// 应用排序
const result = sortOrgItems(sortableData, sortKey, sortOrder);

// 使用排序结果
console.log(result.sortedItems);   // 排序后的数据
console.log(result.sortedIds);     // 排序后的ID数组
console.log(result.sortIndexes);   // 原始索引映射
```

## 在三级机构保费规划图中的应用

在 `src/app/orgs/[org_id]/OrgDetailClient.tsx` 中：

```tsx
// 排序状态
const [orgSortKey, setOrgSortKey] = useState<OrgSortKey>('premium');
const [orgSortOrder, setOrgSortOrder] = useState<SortOrder>('desc');

// 排序按钮组
<SortButtonGroup
  options={SortPresets.orgPremium}
  activeKey={orgSortKey}
  sortOrder={orgSortOrder}
  onSortChange={(key, order) => {
    setOrgSortKey(key);
    setOrgSortOrder(order);
  }}
  size="sm"
  variant="outline"
/>
```

## API 参考

### SortButtonGroupProps

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| options | `readonly SortOption[] \| SortOption[]` | ✅ | - | 排序选项数组 |
| activeKey | `string` | ✅ | - | 当前激活的排序键 |
| sortOrder | `'asc' \| 'desc'` | ✅ | - | 当前排序方向 |
| onSortChange | `(key: string, order: SortOrder) => void` | ✅ | - | 排序变化回调 |
| className | `string` | ❌ | `''` | 额外的CSS类名 |
| size | `'sm' \| 'md' \| 'lg'` | ❌ | `'md'` | 按钮尺寸 |
| variant | `'default' \| 'outline' \| 'ghost'` | ❌ | `'default'` | 按钮样式变体 |

### SortOption

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | `string` | ✅ | 排序键值 |
| label | `string` | ✅ | 显示标签 |
| disabled | `boolean` | ❌ | 是否禁用该选项 |

## 注意事项

1. **点击行为**：
   - 点击当前激活的按钮：切换排序方向（升序↔降序）
   - 点击不同的按钮：切换到新的排序方式（默认降序）

2. **null 值处理**：
   - 排序工具会自动将 null 值排在最后
   - 适用于增长率等可能为 null 的字段

3. **类型安全**：
   - 组件支持 readonly 数组，可以安全使用 `SortPresets`
   - TypeScript 类型完全覆盖

## 相关文件

- 组件：`src/components/ui/SortButtonGroup.tsx`
- 排序工具：`src/lib/sorting.ts`
- 导出索引：`src/components/ui/index.ts`
- 使用示例：`src/app/orgs/[org_id]/OrgDetailClient.tsx`
