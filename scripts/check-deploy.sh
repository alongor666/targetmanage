#!/bin/bash

# 部署状态检查脚本
# 用于检查GitHub Pages部署状态

echo "🚀 川分目标管理系统 - GitHub Pages 部署状态检查"
echo "=================================================="

# 项目信息
REPO_URL="https://github.com/alongor666/targetmanage"
PAGES_URL="https://alongor666.github.io/targetmanage"

echo "📍 仓库地址: $REPO_URL"
echo "🌐 Pages地址: $PAGES_URL"
echo ""

# 检查Git状态
echo "📋 Git状态检查:"
echo "-------------------"
git status
echo ""

# 检查最新提交
echo "📝 最新提交信息:"
echo "-------------------"
git log --oneline -1
echo ""

# 检查分支
echo "🌿 当前分支:"
echo "-------------"
git branch --show-current
echo ""

# 检查远程仓库
echo "🔗 远程仓库:"
echo "------------"
git remote -v
echo ""

# 构建测试
echo "🔨 构建测试:"
echo "-------------"
npm run build:github
echo ""

# 检查构建产物
echo "📦 构建产物检查:"
echo "-----------------"
if [ -d "out" ]; then
    echo "✅ 构建成功！"
    echo "📁 out目录内容:"
    ls -la out/
    echo ""
    echo "📊 构建产物统计:"
    find out -type f | wc -l | xargs echo "文件总数:"
    du -sh out | xargs echo "总大小:"
else
    echo "❌ 构建失败，out目录不存在"
fi

echo ""
echo "✨ 部署检查完成！"
echo "🎯 访问地址: $PAGES_URL"
echo "⚠️  注意: 如果是首次部署，请等待几分钟让GitHub Actions完成构建"