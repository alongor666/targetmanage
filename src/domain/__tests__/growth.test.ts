/**
 * growth.ts 单元测试
 *
 * 测试增长率与增量计算引擎
 * @doc docs/business/指标定义规范.md:121-147
 */

import { describe, it, expect } from 'vitest';
import {
  calculateGrowthMetrics,
  formatGrowthRate,
  formatIncrement,
  type GrowthMetrics,
} from '../growth';

describe('calculateGrowthMetrics - 计算增长指标', () => {
  describe('正常场景 - 有完整基线数据', () => {
    it('应该正确计算正增长场景', () => {
      const current = { month: 120, quarter: 360, ytd: 1200 };
      const baseline = { month: 100, quarter: 300, ytd: 1000 };

      const metrics = calculateGrowthMetrics(current, baseline);

      // 增长率
      expect(metrics.growth_month_rate).toBeCloseTo(0.2, 2); // 20%
      expect(metrics.growth_quarter_rate).toBeCloseTo(0.2, 2); // 20%
      expect(metrics.growth_ytd_rate).toBeCloseTo(0.2, 2); // 20%

      // 增量
      expect(metrics.inc_month).toBe(20);
      expect(metrics.inc_quarter).toBe(60);
      expect(metrics.inc_ytd).toBe(200);
    });

    it('应该正确计算负增长场景', () => {
      const current = { month: 80, quarter: 240, ytd: 800 };
      const baseline = { month: 100, quarter: 300, ytd: 1000 };

      const metrics = calculateGrowthMetrics(current, baseline);

      // 增长率（负值）
      expect(metrics.growth_month_rate).toBeCloseTo(-0.2, 2); // -20%
      expect(metrics.growth_quarter_rate).toBeCloseTo(-0.2, 2);
      expect(metrics.growth_ytd_rate).toBeCloseTo(-0.2, 2);

      // 增量（负值）
      expect(metrics.inc_month).toBe(-20);
      expect(metrics.inc_quarter).toBe(-60);
      expect(metrics.inc_ytd).toBe(-200);
    });

    it('应该正确处理零增长', () => {
      const current = { month: 100, quarter: 300, ytd: 1000 };
      const baseline = { month: 100, quarter: 300, ytd: 1000 };

      const metrics = calculateGrowthMetrics(current, baseline);

      expect(metrics.growth_month_rate).toBe(0);
      expect(metrics.growth_quarter_rate).toBe(0);
      expect(metrics.growth_ytd_rate).toBe(0);

      expect(metrics.inc_month).toBe(0);
      expect(metrics.inc_quarter).toBe(0);
      expect(metrics.inc_ytd).toBe(0);
    });

    it('应该正确计算高增长场景', () => {
      const current = { month: 300, quarter: 900, ytd: 3000 };
      const baseline = { month: 100, quarter: 300, ytd: 1000 };

      const metrics = calculateGrowthMetrics(current, baseline);

      // 增长率 200%
      expect(metrics.growth_month_rate).toBe(2);
      expect(metrics.growth_quarter_rate).toBe(2);
      expect(metrics.growth_ytd_rate).toBe(2);

      // 增量
      expect(metrics.inc_month).toBe(200);
      expect(metrics.inc_quarter).toBe(600);
      expect(metrics.inc_ytd).toBe(2000);
    });
  });

  describe('无基线数据场景', () => {
    it('当基线全为null时,增长率应为null', () => {
      const current = { month: 120, quarter: 360, ytd: 1200 };
      const baseline = { month: null, quarter: null, ytd: null };

      const metrics = calculateGrowthMetrics(current, baseline);

      expect(metrics.growth_month_rate).toBeNull();
      expect(metrics.growth_quarter_rate).toBeNull();
      expect(metrics.growth_ytd_rate).toBeNull();

      expect(metrics.inc_month).toBeNull();
      expect(metrics.inc_quarter).toBeNull();
      expect(metrics.inc_ytd).toBeNull();

      expect(metrics.reason).toBe('no_baseline_data');
    });

    it('当基线月度为null时,仅月度指标为null', () => {
      const current = { month: 120, quarter: 360, ytd: 1200 };
      const baseline = { month: null, quarter: 300, ytd: 1000 };

      const metrics = calculateGrowthMetrics(current, baseline);

      expect(metrics.growth_month_rate).toBeNull();
      expect(metrics.growth_quarter_rate).toBeCloseTo(0.2, 2);
      expect(metrics.growth_ytd_rate).toBeCloseTo(0.2, 2);

      expect(metrics.inc_month).toBeNull();
      expect(metrics.inc_quarter).toBe(60);
      expect(metrics.inc_ytd).toBe(200);
    });
  });

  describe('无当前数据场景', () => {
    it('当当前数据全为null时,所有指标应为null', () => {
      const current = { month: null, quarter: null, ytd: null };
      const baseline = { month: 100, quarter: 300, ytd: 1000 };

      const metrics = calculateGrowthMetrics(current, baseline);

      expect(metrics.growth_month_rate).toBeNull();
      expect(metrics.growth_quarter_rate).toBeNull();
      expect(metrics.growth_ytd_rate).toBeNull();

      expect(metrics.inc_month).toBeNull();
      expect(metrics.inc_quarter).toBeNull();
      expect(metrics.inc_ytd).toBeNull();

      expect(metrics.reason).toBe('no_current_data');
    });

    it('当当前季度为null时,仅季度指标为null', () => {
      const current = { month: 120, quarter: null, ytd: 1200 };
      const baseline = { month: 100, quarter: 300, ytd: 1000 };

      const metrics = calculateGrowthMetrics(current, baseline);

      expect(metrics.growth_month_rate).toBeCloseTo(0.2, 2);
      expect(metrics.growth_quarter_rate).toBeNull();
      expect(metrics.growth_ytd_rate).toBeCloseTo(0.2, 2);

      expect(metrics.inc_month).toBe(20);
      expect(metrics.inc_quarter).toBeNull();
      expect(metrics.inc_ytd).toBe(200);
    });
  });

  describe('基线为0的场景', () => {
    it('当基线月度为0时,月度增长率应为null(division_by_zero)', () => {
      const current = { month: 120, quarter: 360, ytd: 1200 };
      const baseline = { month: 0, quarter: 300, ytd: 1000 };

      const metrics = calculateGrowthMetrics(current, baseline);

      expect(metrics.growth_month_rate).toBeNull();
      expect(metrics.growth_quarter_rate).toBeCloseTo(0.2, 2);
      expect(metrics.growth_ytd_rate).toBeCloseTo(0.2, 2);

      // 增量可以计算
      expect(metrics.inc_month).toBe(120);
      expect(metrics.inc_quarter).toBe(60);
      expect(metrics.inc_ytd).toBe(200);

      expect(metrics.reason).toBe('division_by_zero');
    });

    it('当基线全为0时,增长率全为null但增量可计算', () => {
      const current = { month: 120, quarter: 360, ytd: 1200 };
      const baseline = { month: 0, quarter: 0, ytd: 0 };

      const metrics = calculateGrowthMetrics(current, baseline);

      expect(metrics.growth_month_rate).toBeNull();
      expect(metrics.growth_quarter_rate).toBeNull();
      expect(metrics.growth_ytd_rate).toBeNull();

      expect(metrics.inc_month).toBe(120);
      expect(metrics.inc_quarter).toBe(360);
      expect(metrics.inc_ytd).toBe(1200);
    });
  });

  describe('业务场景测试', () => {
    it('实际业务案例: Q1季度同比增长15%', () => {
      // 2026年Q1: 实际400万, 2025年Q1: 实际350万
      const current = { month: 130, quarter: 400, ytd: 400 };
      const baseline = { month: 115, quarter: 350, ytd: 350 };

      const metrics = calculateGrowthMetrics(current, baseline);

      expect(metrics.growth_quarter_rate).toBeCloseTo(0.1429, 3); // ~14.29%
      expect(metrics.inc_quarter).toBe(50);
    });

    it('实际业务案例: 年累计负增长5%', () => {
      // 2026年YTD: 950万, 2025年YTD: 1000万
      const current = { month: 80, quarter: 240, ytd: 950 };
      const baseline = { month: 85, quarter: 250, ytd: 1000 };

      const metrics = calculateGrowthMetrics(current, baseline);

      expect(metrics.growth_ytd_rate).toBeCloseTo(-0.05, 2);
      expect(metrics.inc_ytd).toBe(-50);
    });

    it('新产品无基线数据场景', () => {
      const current = { month: 50, quarter: 150, ytd: 500 };
      const baseline = { month: null, quarter: null, ytd: null };

      const metrics = calculateGrowthMetrics(current, baseline);

      expect(metrics.growth_month_rate).toBeNull();
      expect(metrics.inc_month).toBeNull();
      expect(metrics.reason).toBe('no_baseline_data');
    });
  });

  describe('精度测试', () => {
    it('应该正确处理小数增长率', () => {
      const current = { month: 100.5, quarter: 301.5, ytd: 1010 };
      const baseline = { month: 100, quarter: 300, ytd: 1000 };

      const metrics = calculateGrowthMetrics(current, baseline);

      expect(metrics.growth_month_rate).toBeCloseTo(0.005, 3); // 0.5%
      expect(metrics.inc_month).toBeCloseTo(0.5, 1);
    });

    it('应该正确处理高精度场景', () => {
      const current = { month: 123.456, quarter: 370.368, ytd: 1234.56 };
      const baseline = { month: 120.000, quarter: 360.000, ytd: 1200.00 };

      const metrics = calculateGrowthMetrics(current, baseline);

      expect(metrics.growth_month_rate).toBeCloseTo(0.0288, 4);
      expect(metrics.inc_month).toBeCloseTo(3.456, 3);
    });
  });
});

describe('formatGrowthRate - 格式化增长率', () => {
  it('应该正确格式化正增长率', () => {
    expect(formatGrowthRate(0.2)).toBe('20.0%');
    expect(formatGrowthRate(0.15)).toBe('15.0%');
    expect(formatGrowthRate(1.5)).toBe('150.0%');
  });

  it('应该正确格式化负增长率', () => {
    expect(formatGrowthRate(-0.1)).toBe('-10.0%');
    expect(formatGrowthRate(-0.25)).toBe('-25.0%');
  });

  it('应该正确格式化零增长', () => {
    expect(formatGrowthRate(0)).toBe('0.0%');
  });

  it('应该正确格式化小数增长率', () => {
    expect(formatGrowthRate(0.005)).toBe('0.5%');
    expect(formatGrowthRate(0.123)).toBe('12.3%');
    expect(formatGrowthRate(0.1234)).toBe('12.3%'); // 保留1位小数
  });

  it('null值应显示为"—"', () => {
    expect(formatGrowthRate(null)).toBe('—');
  });

  it('应该正确处理大数值', () => {
    expect(formatGrowthRate(5.0)).toBe('500.0%');
    expect(formatGrowthRate(10.5)).toBe('1050.0%');
  });
});

describe('formatIncrement - 格式化增量', () => {
  it('应该正确格式化正增量', () => {
    expect(formatIncrement(100)).toBe('100');
    expect(formatIncrement(1234)).toBe('1234');
  });

  it('应该正确格式化负增量', () => {
    expect(formatIncrement(-50)).toBe('-50');
    expect(formatIncrement(-1234)).toBe('-1234');
  });

  it('应该正确格式化零增量', () => {
    expect(formatIncrement(0)).toBe('0');
  });

  it('应该四舍五入到整数', () => {
    expect(formatIncrement(123.4)).toBe('123');
    expect(formatIncrement(123.5)).toBe('124');
    expect(formatIncrement(123.9)).toBe('124');
  });

  it('null值应显示为"—"', () => {
    expect(formatIncrement(null)).toBe('—');
  });

  it('应该正确处理大数值', () => {
    expect(formatIncrement(1000000)).toBe('1000000');
    expect(formatIncrement(1234567.89)).toBe('1234568');
  });

  it('应该正确处理小数', () => {
    expect(formatIncrement(0.4)).toBe('0');
    expect(formatIncrement(0.6)).toBe('1');
  });
});
