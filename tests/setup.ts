/**
 * Vitest 全局测试设置文件
 *
 * 在所有测试运行前执行,用于设置测试环境
 */

import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// 每个测试后自动清理 React Testing Library
afterEach(() => {
  cleanup();
});

// 可选: 添加自定义匹配器
// expect.extend({
//   toBeWithinRange(received: number, floor: number, ceiling: number) {
//     const pass = received >= floor && received <= ceiling;
//     if (pass) {
//       return {
//         message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
//         pass: true,
//       };
//     } else {
//       return {
//         message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
//         pass: false,
//       };
//     }
//   },
// });
