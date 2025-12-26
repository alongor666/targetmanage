# 常见问题排查指南

本文档收集了开发过程中常见的问题及其解决方案。

**Last Updated:** 2025-12-26

---

## 📝 文档同步问题

### 索引文件不同步

**症状**：
- `code-index.json` 或 `docs-index.json` 内容过期
- @doc 标签指向的文档不存在
- 文档链接检查失败

**解决方案**：

```bash
# 强制重新生成索引文件
pnpm docs:sync --force

# 检查文档链接是否有效
pnpm docs:check

# 查看索引生成日志（如果有问题）
pnpm docs:sync --verbose
```

**预防措施**：
- 移动或重命名文件时，记得更新相关的 @doc 标签
- 提交前运行 `pnpm docs:check` 验证
- 可以设置 pre-commit hook 自动检查

---

## 🏗️ 构建失败

### TypeScript 类型错误

**症状**：
- `pnpm build` 失败
- IDE 显示类型错误
- Domain 层函数类型不匹配

**解决方案**：

```bash
# 运行类型检查查看详细错误
pnpm typecheck

# 如果是增量构建问题，清理缓存
rm -rf .next
pnpm typecheck

# 检查 tsconfig.json 配置是否正确
cat tsconfig.json
```

**常见原因**：
- 忘记在 domain 函数中返回 `null` 类型
- Zod schema 与 TypeScript 类型定义不一致
- 导入路径错误（检查 `@/` 别名）

---

### Next.js 构建错误

**症状**：
- `pnpm build` 在生产构建时失败
- 开发环境正常，生产环境报错
- 静态生成或服务端渲染错误

**解决方案**：

```bash
# 清理 Next.js 缓存并重新构建
rm -rf .next
pnpm build

# 如果是依赖问题，重装依赖
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build

# 检查 Next.js 配置
cat next.config.ts
```

**常见原因**：
- 使用了浏览器专用 API（如 localStorage）在服务端
- 环境变量未正确配置
- 动态导入的组件缺少 `'use client'` 指令

---

### 依赖安装问题

**症状**：
- `pnpm install` 失败
- 依赖版本冲突
- 缺少某些包

**解决方案**：

```bash
# 完全清理并重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 如果是 pnpm 缓存问题
pnpm store prune
pnpm install

# 检查 Node.js 版本（需要 20+）
node -v
nvm use 20  # 如果版本不对
```

**常见原因**：
- Node.js 版本过低（需要 20+）
- pnpm 版本过旧（需要 9+）
- package.json 中的版本范围冲突

---

## 📊 数据加载问题

### JSON 文件加载失败

**症状**：
- 页面显示空数据或 fallback 数据
- 控制台显示 404 错误
- localStorage 数据未正确加载

**诊断步骤**：

```bash
# 1. 检查浏览器控制台是否有错误
# 打开 Chrome DevTools → Console 标签

# 2. 验证 JSON 文件是否存在
ls -la public/data/*.json

# 3. 验证 JSON 文件格式是否正确
cat public/data/targets-2026.json | jq .  # 需要安装 jq

# 4. 检查文件权限
ls -l public/data/
```

**常见原因**：
- JSON 文件不在 `public/data/` 目录
- JSON 文件格式错误（语法错误）
- 文件名大小写不匹配（Linux 区分大小写）

---

### Zod Schema 验证失败

**症状**：
- 数据加载后显示为空
- 控制台显示 Zod 验证错误
- 数据结构与 schema 不匹配

**解决方案**：

```bash
# 查看 schema 定义
cat src/schemas/schema.ts

# 检查 JSON 数据结构
cat public/data/targets-2026.json | jq '.organizations[0]'

# 使用 TypeScript 类型检查
pnpm typecheck
```

**调试技巧**：
```typescript
// 在 loaders.ts 中临时添加调试代码
import { z } from 'zod';

try {
  const result = TargetsSchema.parse(jsonData);
  return result;
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Zod validation errors:', error.errors);
    // 查看具体哪个字段验证失败
  }
  throw error;
}
```

---

### localStorage 数据损坏

**症状**：
- 用户导入的数据无法加载
- 页面行为异常
- 数据重置后仍有问题

**解决方案**：

```javascript
// 在浏览器控制台执行
// 1. 查看 localStorage 内容
console.log(localStorage.getItem('targets-2026'));

// 2. 清除损坏的数据
localStorage.removeItem('targets-2026');
localStorage.removeItem('baseline-2025');
localStorage.clear();  // 清除所有数据（谨慎使用）

// 3. 刷新页面，应该会加载默认数据
location.reload();
```

**预防措施**：
- 导入 JSON 前先在 https://jsonlint.com 验证格式
- 提供数据导出功能，方便用户备份
- 在 loaders 中添加 try-catch 处理

---

## 🎨 UI 显示问题

### 图表不显示或显示异常

**症状**：
- Recharts 图表空白
- 图表数据不更新
- 图表样式错误

**解决方案**：

```bash
# 检查 Recharts 版本
pnpm list recharts

# 查看控制台是否有 React 错误
# Chrome DevTools → Console

# 检查数据是否正确传递
# 在组件中添加 console.log(data)
```

**常见原因**：
- 数据包含 `null` 值但图表未处理
- 图表容器没有设置高度
- ResponsiveContainer 的父元素高度为 0

---

### Tailwind CSS 样式不生效

**症状**：
- 类名存在但样式未应用
- 动态类名不工作
- 生产环境样式丢失

**解决方案**：

```bash
# 检查 Tailwind 配置
cat tailwind.config.ts

# 重新构建（清理缓存）
rm -rf .next
pnpm dev

# 检查是否使用了动态类名（不推荐）
# ❌ 错误：className={`text-${color}-500`}
# ✅ 正确：className={color === 'red' ? 'text-red-500' : 'text-blue-500'}
```

---

## 🔧 开发环境问题

### 热更新不工作

**症状**：
- 修改代码后页面不自动刷新
- 需要手动刷新浏览器
- Fast Refresh 失败

**解决方案**：

```bash
# 重启开发服务器
# Ctrl+C 停止，然后重新启动
pnpm dev

# 检查是否有语法错误
pnpm typecheck

# 清理缓存
rm -rf .next
pnpm dev
```

---

### 端口占用

**症状**：
- `pnpm dev` 提示端口已被占用
- 无法启动开发服务器

**解决方案**：

```bash
# 查找占用 3000 端口的进程
lsof -ti:3000

# 杀死占用的进程
kill -9 $(lsof -ti:3000)

# 或者使用不同端口启动
pnpm dev -- -p 3001
```

---

## 📚 相关文档

- **开发指南**：`docs/development/开发指南.md`
- **架构设计**：`docs/architecture/系统架构设计.md`
- **代码示例**：`docs/development/code-examples.md`

---

**维护者**：开发团队
**版本**：1.0.0
**最后更新**：2025-12-26
