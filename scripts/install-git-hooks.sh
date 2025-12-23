#!/bin/bash

# 安装 Git Hooks 脚本
# 使用方法: bash scripts/install-git-hooks.sh

set -e

HOOKS_DIR=".git/hooks"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔧 安装 Git Hooks..."

# 确保 hooks 目录存在
mkdir -p "$HOOKS_DIR"

# ============= pre-commit hook =============
cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash

# Pre-commit hook: 提交前检查文档-代码一致性

echo "🔍 检查文档-代码一致性..."

# 检查是否有 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  未找到 pnpm，跳过文档同步检查"
    exit 0
fi

# 检查是否修改了文档或代码
CHANGED_FILES=$(git diff --cached --name-only)
DOC_CHANGED=$(echo "$CHANGED_FILES" | grep -E '\.md$' || true)
CODE_CHANGED=$(echo "$CHANGED_FILES" | grep -E '\.(ts|tsx|js|jsx)$' || true)

if [ -z "$DOC_CHANGED" ] && [ -z "$CODE_CHANGED" ]; then
    echo "✅ 未修改文档或代码，跳过检查"
    exit 0
fi

# 运行一致性检查
if ! pnpm docs:check; then
    echo ""
    echo "❌ 文档-代码不一致！"
    echo ""
    echo "请运行以下命令修复："
    echo "  pnpm docs:sync    # 更新索引"
    echo "  git add docs/.meta/"
    echo ""
    echo "或者强制提交（不推荐）："
    echo "  git commit --no-verify"
    echo ""
    exit 1
fi

echo "✅ 文档-代码检查通过"

# 检查索引文件是否需要提交
if [ -n "$(git status --porcelain docs/.meta)" ]; then
    echo ""
    echo "⚠️  索引文件已更新，但未暂存"
    echo "建议运行: git add docs/.meta/"
    echo ""
    # 不阻塞提交，只是提醒
fi

exit 0
EOF

chmod +x "$HOOKS_DIR/pre-commit"
echo "✅ 已安装 pre-commit hook"

# ============= post-merge hook =============
cat > "$HOOKS_DIR/post-merge" << 'EOF'
#!/bin/bash

# Post-merge hook: 合并后更新索引

echo "🔄 检测到代码合并，更新索引..."

# 检查是否有 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  未找到 pnpm，跳过索引更新"
    exit 0
fi

# 静默更新索引
pnpm docs:sync > /dev/null 2>&1 || {
    echo "⚠️  索引更新失败，请手动运行 pnpm docs:sync"
    exit 0
}

# 检查是否有变更
if [ -n "$(git status --porcelain docs/.meta)" ]; then
    echo "📝 索引文件已更新"
    echo "建议运行:"
    echo "  git add docs/.meta/"
    echo "  git commit -m 'chore: 更新文档-代码索引 [skip ci]'"
fi

echo "✅ 索引更新完成"
exit 0
EOF

chmod +x "$HOOKS_DIR/post-merge"
echo "✅ 已安装 post-merge hook"

# ============= commit-msg hook =============
cat > "$HOOKS_DIR/commit-msg" << 'EOF'
#!/bin/bash

# Commit-msg hook: 检查提交信息格式

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# 如果包含 [skip ci]，跳过检查
if echo "$COMMIT_MSG" | grep -q "\[skip ci\]"; then
    exit 0
fi

# 检查是否符合约定式提交
if ! echo "$COMMIT_MSG" | grep -qE "^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,}"; then
    echo ""
    echo "❌ 提交信息格式不符合规范"
    echo ""
    echo "格式要求: <type>(<scope>): <subject>"
    echo ""
    echo "示例:"
    echo "  feat(domain): 添加2025实际口径计算"
    echo "  fix(ui): 修复时间进度显示问题"
    echo "  docs: 更新API文档"
    echo ""
    echo "类型 (type):"
    echo "  feat     - 新功能"
    echo "  fix      - 修复bug"
    echo "  docs     - 文档变更"
    echo "  style    - 代码格式"
    echo "  refactor - 重构"
    echo "  test     - 测试"
    echo "  chore    - 构建/工具"
    echo "  perf     - 性能优化"
    echo ""
    exit 1
fi

exit 0
EOF

chmod +x "$HOOKS_DIR/commit-msg"
echo "✅ 已安装 commit-msg hook"

# ============= 完成 =============
echo ""
echo "🎉 Git Hooks 安装完成！"
echo ""
echo "已安装的 hooks:"
echo "  - pre-commit   : 提交前检查文档-代码一致性"
echo "  - post-merge   : 合并后自动更新索引"
echo "  - commit-msg   : 检查提交信息格式"
echo ""
echo "测试 hooks:"
echo "  git commit --allow-empty -m 'test: 测试提交'"
echo ""
echo "卸载 hooks:"
echo "  rm .git/hooks/pre-commit"
echo "  rm .git/hooks/post-merge"
echo "  rm .git/hooks/commit-msg"
echo ""
