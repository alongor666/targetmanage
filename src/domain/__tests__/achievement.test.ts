/**
 * achievement.ts 单元测试
 *
 * 测试达成率相关的计算函数
 * @doc docs/business/指标定义规范.md:144-147
 */

import { describe, it, expect } from 'vitest';
import { safeDivide, diff, growthRate } from '../achievement';

describe('safeDivide - 安全除法', () => {
  describe('正常场景', () => {
    it('应该正确计算普通除法', () => {
      const result = safeDivide(10, 2);
      expect(result.value).toBe(5);
      expect(result.reason).toBeUndefined();
    });

    it('应该正确处理小数除法', () => {
      const result = safeDivide(7, 3);
      expect(result.value).toBeCloseTo(2.333, 2);
    });

    it('应该正确处理负数除法', () => {
      const result = safeDivide(-10, 2);
      expect(result.value).toBe(-5);
    });

    it('应该正确处理零除以非零', () => {
      const result = safeDivide(0, 5);
      expect(result.value).toBe(0);
    });

    it('应该正确处理大数字除法', () => {
      const result = safeDivide(1000000, 100);
      expect(result.value).toBe(10000);
    });
  });

  describe('边界场景', () => {
    it('除数为0时应返回 null 并提供原因', () => {
      const result = safeDivide(10, 0);
      expect(result.value).toBeNull();
      expect(result.reason).toBe('division_by_zero');
    });

    it('分子和分母都为0时应返回 null', () => {
      const result = safeDivide(0, 0);
      expect(result.value).toBeNull();
      expect(result.reason).toBe('division_by_zero');
    });

    it('应该正确处理非常小的分母', () => {
      const result = safeDivide(1, 0.0001);
      expect(result.value).toBe(10000);
    });
  });

  describe('业务场景', () => {
    it('达成率计算: 实际100万 / 目标80万 = 125%', () => {
      const result = safeDivide(100, 80);
      expect(result.value).toBeCloseTo(1.25, 2);
    });

    it('达成率计算: 实际50万 / 目标100万 = 50%', () => {
      const result = safeDivide(50, 100);
      expect(result.value).toBe(0.5);
    });

    it('达成率计算: 目标为0时应返回 null (业务异常)', () => {
      const result = safeDivide(100, 0);
      expect(result.value).toBeNull();
    });
  });
});

describe('diff - 计算差值', () => {
  describe('正常场景', () => {
    it('应该正确计算正增量', () => {
      const result = diff(120, 100);
      expect(result).toBe(20);
    });

    it('应该正确计算负增量', () => {
      const result = diff(80, 100);
      expect(result).toBe(-20);
    });

    it('应该正确处理零增量', () => {
      const result = diff(100, 100);
      expect(result).toBe(0);
    });

    it('应该正确处理小数差值', () => {
      const result = diff(10.5, 7.3);
      expect(result).toBeCloseTo(3.2, 1);
    });
  });

  describe('业务场景', () => {
    it('月度增量: 本月120万 - 上月100万 = 20万', () => {
      const result = diff(120, 100);
      expect(result).toBe(20);
    });

    it('同比增量: 今年150万 - 去年130万 = 20万', () => {
      const result = diff(150, 130);
      expect(result).toBe(20);
    });

    it('负增量场景: 本月80万 - 上月100万 = -20万', () => {
      const result = diff(80, 100);
      expect(result).toBe(-20);
    });
  });
});

describe('growthRate - 计算增长率', () => {
  describe('正常场景', () => {
    it('应该正确计算正增长率', () => {
      const result = growthRate(120, 100);
      expect(result.value).toBeCloseTo(0.2, 2); // 20% 增长
    });

    it('应该正确计算负增长率', () => {
      const result = growthRate(80, 100);
      expect(result.value).toBeCloseTo(-0.2, 2); // -20% 下降
    });

    it('应该正确处理零增长', () => {
      const result = growthRate(100, 100);
      expect(result.value).toBe(0);
    });

    it('应该正确处理从零开始的增长', () => {
      const result = growthRate(100, 0);
      expect(result.value).toBeNull(); // 无法计算
      expect(result.reason).toBe('division_by_zero');
    });
  });

  describe('边界场景', () => {
    it('基期为0时应返回 null', () => {
      const result = growthRate(150, 0);
      expect(result.value).toBeNull();
      expect(result.reason).toBe('division_by_zero');
    });

    it('当前期和基期都为0时应返回 null', () => {
      const result = growthRate(0, 0);
      expect(result.value).toBeNull();
    });

    it('应该正确处理负基期', () => {
      const result = growthRate(50, -100);
      expect(result.value).toBeCloseTo(-1.5, 2); // -150% 变化
    });
  });

  describe('业务场景', () => {
    it('同比增长率: 今年120万 vs 去年100万 = 20%增长', () => {
      const result = growthRate(120, 100);
      expect(result.value).toBeCloseTo(0.2, 2);
    });

    it('月度增长率: 本月90万 vs 上月100万 = -10%下降', () => {
      const result = growthRate(90, 100);
      expect(result.value).toBeCloseTo(-0.1, 2);
    });

    it('高增长场景: 今年300万 vs 去年100万 = 200%增长', () => {
      const result = growthRate(300, 100);
      expect(result.value).toBe(2);
    });

    it('无基线数据时应返回 null', () => {
      const result = growthRate(100, 0);
      expect(result.value).toBeNull();
    });
  });

  describe('精度测试', () => {
    it('应该正确处理小增长率', () => {
      const result = growthRate(100.5, 100);
      expect(result.value).toBeCloseTo(0.005, 3); // 0.5% 增长
    });

    it('应该正确处理高精度场景', () => {
      const result = growthRate(123.456, 120.000);
      expect(result.value).toBeCloseTo(0.0288, 4);
    });
  });
});
