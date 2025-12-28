import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // 使用 jsdom 环境模拟浏览器
    environment: 'jsdom',

    // 启用全局 API (describe, it, expect 等)
    globals: true,

    // 测试设置文件
    setupFiles: ['./tests/setup.ts'],

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.types.ts',
        'src/app/**',  // App Router 页面文件暂时排除
        'src/components/**', // UI 组件暂时排除,优先测试业务逻辑
      ],
      // 覆盖率阈值 - 设置为当前基线，防止覆盖率下降
      // ✅ Domain 层核心业务逻辑已达到 100% 覆盖率:
      //    - achievement.ts: 100%
      //    - growth.ts: 100%
      //    - time.ts: 100%
      // 下一步: 逐步为 allocation、aggregate、validate 等添加测试
      thresholds: {
        lines: 12,
        functions: 20,
        branches: 15,
        statements: 15,
      },
    },

    // 包含的测试文件模式
    include: ['src/**/*.{test,spec}.{ts,tsx}'],

    // 排除的文件
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'out',
    ],
  },

  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
