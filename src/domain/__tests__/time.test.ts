/**
 * time.ts 单元测试
 *
 * 测试时间进度计算相关函数（3种模式：线性、权重、2025实际）
 * @doc docs/business/目标分配规则.md:29-36
 */

import { describe, it, expect } from 'vitest';
import {
  monthToQuarter,
  linearProgressYear,
  weightedProgressYear,
  linearProgressQuarter,
  weightedProgressQuarter,
  actual2025ProgressYear,
  actual2025ProgressQuarter,
} from '../time';

describe('monthToQuarter - 月份转季度', () => {
  it('应该正确转换Q1月份', () => {
    expect(monthToQuarter(1)).toBe(1);
    expect(monthToQuarter(2)).toBe(1);
    expect(monthToQuarter(3)).toBe(1);
  });

  it('应该正确转换Q2月份', () => {
    expect(monthToQuarter(4)).toBe(2);
    expect(monthToQuarter(5)).toBe(2);
    expect(monthToQuarter(6)).toBe(2);
  });

  it('应该正确转换Q3月份', () => {
    expect(monthToQuarter(7)).toBe(3);
    expect(monthToQuarter(8)).toBe(3);
    expect(monthToQuarter(9)).toBe(3);
  });

  it('应该正确转换Q4月份', () => {
    expect(monthToQuarter(10)).toBe(4);
    expect(monthToQuarter(11)).toBe(4);
    expect(monthToQuarter(12)).toBe(4);
  });
});

describe('linearProgressYear - 年度线性进度', () => {
  it('1月进度应为 1/12', () => {
    expect(linearProgressYear(1)).toBeCloseTo(0.0833, 4);
  });

  it('6月进度应为 6/12 = 0.5', () => {
    expect(linearProgressYear(6)).toBe(0.5);
  });

  it('12月进度应为 12/12 = 1.0', () => {
    expect(linearProgressYear(12)).toBe(1.0);
  });

  it('应该正确处理年中月份', () => {
    expect(linearProgressYear(3)).toBe(0.25);
    expect(linearProgressYear(9)).toBe(0.75);
  });
});

describe('weightedProgressYear - 年度权重进度', () => {
  // 均匀权重（相当于线性）
  const uniformWeights = Array(12).fill(1 / 12);

  // 不均匀权重示例（前低后高）
  const frontLoadedWeights = [
    0.05, 0.05, 0.05, 0.05, // Q1: 20%
    0.08, 0.08, 0.08, 0.08, // Q2: 32%
    0.10, 0.10, 0.10, 0.10, // Q3: 40%
    0.02, 0.02, 0.02, 0.02, // Q4: 8%
  ]; // 总和 = 1.0

  describe('均匀权重', () => {
    it('1月进度应接近 1/12', () => {
      const progress = weightedProgressYear(uniformWeights, 1);
      expect(progress).toBeCloseTo(0.0833, 4);
    });

    it('6月进度应接近 0.5', () => {
      const progress = weightedProgressYear(uniformWeights, 6);
      expect(progress).toBeCloseTo(0.5, 4);
    });

    it('12月进度应为 1.0', () => {
      const progress = weightedProgressYear(uniformWeights, 12);
      expect(progress).toBeCloseTo(1.0, 4);
    });
  });

  describe('不均匀权重', () => {
    it('3月进度应为前3个月权重之和 (0.15)', () => {
      const progress = weightedProgressYear(frontLoadedWeights, 3);
      expect(progress).toBeCloseTo(0.15, 2);
    });

    it('6月进度应为前6个月权重之和 (0.36)', () => {
      const progress = weightedProgressYear(frontLoadedWeights, 6);
      // 0.05+0.05+0.05+0.05 + 0.08+0.08 = 0.36
      expect(progress).toBeCloseTo(0.36, 2);
    });

    it('9月进度应为前9个月权重之和 (0.62)', () => {
      const progress = weightedProgressYear(frontLoadedWeights, 9);
      // 0.36 + 0.08+0.10+0.10 = 0.62
      expect(progress).toBeCloseTo(0.62, 2);
    });
  });

  describe('边界场景', () => {
    it('应该处理月份超出范围（自动限制在1-12）', () => {
      const progress = weightedProgressYear(uniformWeights, 15);
      expect(progress).toBeCloseTo(1.0, 4); // 被限制为12月
    });

    it('应该处理月份小于1', () => {
      const progress = weightedProgressYear(uniformWeights, 0);
      expect(progress).toBeCloseTo(0.0833, 4); // 被限制为1月
    });
  });
});

describe('linearProgressQuarter - 季度线性进度', () => {
  describe('Q1 (1-3月)', () => {
    it('1月进度应为 1/3', () => {
      expect(linearProgressQuarter(1)).toBeCloseTo(0.3333, 4);
    });

    it('2月进度应为 2/3', () => {
      expect(linearProgressQuarter(2)).toBeCloseTo(0.6667, 4);
    });

    it('3月进度应为 3/3 = 1.0', () => {
      expect(linearProgressQuarter(3)).toBe(1.0);
    });
  });

  describe('Q2 (4-6月)', () => {
    it('4月进度应为 1/3', () => {
      expect(linearProgressQuarter(4)).toBeCloseTo(0.3333, 4);
    });

    it('5月进度应为 2/3', () => {
      expect(linearProgressQuarter(5)).toBeCloseTo(0.6667, 4);
    });

    it('6月进度应为 1.0', () => {
      expect(linearProgressQuarter(6)).toBe(1.0);
    });
  });

  describe('Q3 (7-9月)', () => {
    it('7月进度应为 1/3', () => {
      expect(linearProgressQuarter(7)).toBeCloseTo(0.3333, 4);
    });

    it('9月进度应为 1.0', () => {
      expect(linearProgressQuarter(9)).toBe(1.0);
    });
  });

  describe('Q4 (10-12月)', () => {
    it('10月进度应为 1/3', () => {
      expect(linearProgressQuarter(10)).toBeCloseTo(0.3333, 4);
    });

    it('12月进度应为 1.0', () => {
      expect(linearProgressQuarter(12)).toBe(1.0);
    });
  });
});

describe('weightedProgressQuarter - 季度权重进度', () => {
  // Q1权重高，其他季度均衡
  const q1HighWeights = [
    0.15, 0.15, 0.10, // Q1: 40%
    0.08, 0.08, 0.08, // Q2: 24%
    0.08, 0.08, 0.08, // Q3: 24%
    0.04, 0.04, 0.04, // Q4: 12%
  ]; // 总和 = 1.0

  describe('Q1季度内权重进度', () => {
    it('1月进度应为第1个月权重占Q1的比例', () => {
      // Q1总权重 = 0.4, 1月权重 = 0.15
      const progress = weightedProgressQuarter(q1HighWeights, 1);
      expect(progress).toBeCloseTo(0.15 / 0.4, 2); // 0.375
    });

    it('2月进度应为前2个月权重占Q1的比例', () => {
      // (0.15 + 0.15) / 0.4 = 0.75
      const progress = weightedProgressQuarter(q1HighWeights, 2);
      expect(progress).toBeCloseTo(0.75, 2);
    });

    it('3月进度应为 1.0 (Q1结束)', () => {
      const progress = weightedProgressQuarter(q1HighWeights, 3);
      expect(progress).toBeCloseTo(1.0, 2);
    });
  });

  describe('Q2季度内权重进度', () => {
    it('4月进度应为第1个月权重占Q2的比例', () => {
      // Q2总权重 = 0.24, 4月权重 = 0.08
      const progress = weightedProgressQuarter(q1HighWeights, 4);
      expect(progress).toBeCloseTo(0.08 / 0.24, 2); // 0.333
    });

    it('6月进度应为 1.0', () => {
      const progress = weightedProgressQuarter(q1HighWeights, 6);
      expect(progress).toBeCloseTo(1.0, 2);
    });
  });

  describe('边界场景', () => {
    it('权重总和为0时应返回0', () => {
      const zeroWeights = Array(12).fill(0);
      const progress = weightedProgressQuarter(zeroWeights, 3);
      expect(progress).toBe(0);
    });
  });
});

describe('actual2025ProgressYear - 年度2025实际进度', () => {
  // 模拟2025年实际数据（万元）
  const actuals2025 = [
    100, 120, 150, // Q1
    200, 220, 250, // Q2
    280, 300, 320, // Q3
    350, 380, 400, // Q4
  ]; // 总和 = 3070

  describe('正常场景', () => {
    it('1月进度应为 100/3070', () => {
      const progress = actual2025ProgressYear(actuals2025, 1);
      expect(progress).toBeCloseTo(100 / 3070, 4);
    });

    it('6月进度应为 250/3070', () => {
      const progress = actual2025ProgressYear(actuals2025, 6);
      expect(progress).toBeCloseTo(250 / 3070, 4);
    });

    it('12月进度应为 400/3070', () => {
      const progress = actual2025ProgressYear(actuals2025, 12);
      expect(progress).toBeCloseTo(400 / 3070, 4);
    });
  });

  describe('包含 null 值的场景', () => {
    const actualsWithNull = [
      100, 120, null, // Q1
      200, 220, 250,  // Q2
      280, null, 320, // Q3
      350, 380, 400,  // Q4
    ];

    it('应该跳过 null 值计算总和', () => {
      // 总和 = 100+120+200+220+250+280+320+350+380+400 = 2620
      const progress = actual2025ProgressYear(actualsWithNull, 1);
      expect(progress).toBeCloseTo(100 / 2620, 4);
    });

    it('当前月为 null 时应返回 0', () => {
      const progress = actual2025ProgressYear(actualsWithNull, 3);
      expect(progress).toBe(0);
    });
  });

  describe('边界场景', () => {
    it('数组长度不为12时应返回0', () => {
      const invalidData = [100, 200, 300];
      const progress = actual2025ProgressYear(invalidData, 1);
      expect(progress).toBe(0);
    });

    it('年度总计为0时应返回0', () => {
      const zeroData = Array(12).fill(0);
      const progress = actual2025ProgressYear(zeroData, 6);
      expect(progress).toBe(0);
    });

    it('全为 null 时应返回0', () => {
      const nullData = Array(12).fill(null);
      const progress = actual2025ProgressYear(nullData, 6);
      expect(progress).toBe(0);
    });
  });

  describe('月份边界', () => {
    it('应该正确处理月份超出范围', () => {
      const progress = actual2025ProgressYear(actuals2025, 15);
      expect(progress).toBeCloseTo(400 / 3070, 4); // 限制为12月
    });

    it('应该正确处理月份小于1', () => {
      const progress = actual2025ProgressYear(actuals2025, 0);
      expect(progress).toBeCloseTo(100 / 3070, 4); // 限制为1月
    });
  });
});

describe('actual2025ProgressQuarter - 季度2025实际进度', () => {
  const actuals2025 = [
    100, 120, 150, // Q1: 370
    200, 220, 250, // Q2: 670
    280, 300, 320, // Q3: 900
    350, 380, 400, // Q4: 1130
  ];

  describe('Q1场景', () => {
    it('1月进度应为 100/370', () => {
      const progress = actual2025ProgressQuarter(actuals2025, 1);
      expect(progress).toBeCloseTo(100 / 370, 4);
    });

    it('2月进度应为 120/370', () => {
      const progress = actual2025ProgressQuarter(actuals2025, 2);
      expect(progress).toBeCloseTo(120 / 370, 4);
    });

    it('3月进度应为 150/370', () => {
      const progress = actual2025ProgressQuarter(actuals2025, 3);
      expect(progress).toBeCloseTo(150 / 370, 4);
    });
  });

  describe('Q2场景', () => {
    it('4月进度应为 200/670', () => {
      const progress = actual2025ProgressQuarter(actuals2025, 4);
      expect(progress).toBeCloseTo(200 / 670, 4);
    });

    it('6月进度应为 250/670', () => {
      const progress = actual2025ProgressQuarter(actuals2025, 6);
      expect(progress).toBeCloseTo(250 / 670, 4);
    });
  });

  describe('包含 null 值的场景', () => {
    const actualsWithNull = [
      100, null, 150,  // Q1
      200, 220, 250,   // Q2
      null, 300, 320,  // Q3
      350, 380, 400,   // Q4
    ];

    it('Q1当2月为null时应跳过', () => {
      // Q1总和 = 100 + 150 = 250
      const progress = actual2025ProgressQuarter(actualsWithNull, 1);
      expect(progress).toBeCloseTo(100 / 250, 4);
    });

    it('当前月为null时应返回0', () => {
      const progress = actual2025ProgressQuarter(actualsWithNull, 2);
      expect(progress).toBe(0);
    });
  });

  describe('边界场景', () => {
    it('数组长度不为12时应返回0', () => {
      const invalidData = [100, 200, 300];
      const progress = actual2025ProgressQuarter(invalidData, 1);
      expect(progress).toBe(0);
    });

    it('季度总计为0时应返回0', () => {
      const zeroQ1 = [0, 0, 0, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      const progress = actual2025ProgressQuarter(zeroQ1, 1);
      expect(progress).toBe(0);
    });
  });
});
