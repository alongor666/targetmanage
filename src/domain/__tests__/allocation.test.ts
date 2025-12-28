/**
 * allocation.ts 单元测试
 *
 * 测试目标分配相关函数
 * @doc docs/business/目标分配规则.md
 */

import { describe, it, expect } from 'vitest';
import {
  allocateAnnualToMonthly,
  calculateActual2025Weights,
  monthlyToQuarterly,
  monthlyToYtd,
} from '../allocation';

describe('allocateAnnualToMonthly - 年度目标分配到月度', () => {
  describe('均匀权重场景', () => {
    const uniformWeights = Array(12).fill(1 / 12);

    it('应该均匀分配年度目标', () => {
      const monthly = allocateAnnualToMonthly(12000, uniformWeights, 'none');

      expect(monthly).toHaveLength(12);
      monthly.forEach((value) => {
        expect(value).toBeCloseTo(1000, 2);
      });
    });

    it('整数舍入模式应确保总和等于年度目标', () => {
      const monthly = allocateAnnualToMonthly(10000, uniformWeights, 'integer');

      const sum = monthly.reduce((a, b) => a + b, 0);
      expect(sum).toBe(10000);

      // 每月应接近 833
      monthly.slice(0, 11).forEach((value) => {
        expect(value).toBeCloseTo(833, 0);
      });
    });

    it('2位小数舍入模式', () => {
      const monthly = allocateAnnualToMonthly(10000, uniformWeights, '2dp');

      const sum = monthly.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(10000, 2);
    });
  });

  describe('不均匀权重场景', () => {
    // Q1高 (40%), Q2-Q4均衡 (各20%)
    const seasonalWeights = [
      0.15, 0.15, 0.10, // Q1: 40%
      0.07, 0.07, 0.06, // Q2: 20%
      0.07, 0.07, 0.06, // Q3: 20%
      0.07, 0.07, 0.06, // Q4: 20%
    ];

    it('应该按权重比例分配', () => {
      const monthly = allocateAnnualToMonthly(10000, seasonalWeights, 'none');

      expect(monthly[0]).toBeCloseTo(1500, 1); // 15%
      expect(monthly[1]).toBeCloseTo(1500, 1); // 15%
      expect(monthly[2]).toBeCloseTo(1000, 1); // 10%
      expect(monthly[3]).toBeCloseTo(700, 1);  // 7%
    });

    it('舍入后总和应等于年度目标', () => {
      const monthly = allocateAnnualToMonthly(10000, seasonalWeights, 'integer');

      const sum = monthly.reduce((a, b) => a + b, 0);
      expect(sum).toBe(10000);
    });
  });

  describe('边界场景', () => {
    const uniformWeights = Array(12).fill(1 / 12);

    it('年度目标为0时应返回全0数组', () => {
      const monthly = allocateAnnualToMonthly(0, uniformWeights, 'none');

      monthly.forEach((value) => {
        expect(value).toBe(0);
      });
    });

    it('应该正确处理小数年度目标', () => {
      const monthly = allocateAnnualToMonthly(1000.5, uniformWeights, 'none');

      const sum = monthly.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1000.5, 2);
    });

    it('应该正确处理大数值', () => {
      const monthly = allocateAnnualToMonthly(1000000, uniformWeights, 'none');

      monthly.forEach((value) => {
        expect(value).toBeCloseTo(83333.33, 2);
      });
    });
  });
});

describe('calculateActual2025Weights - 计算2025年实际权重', () => {
  describe('正常场景', () => {
    it('应该正确计算各月贡献度权重', () => {
      const actuals = [100, 120, 150, 200, 220, 250, 280, 300, 320, 350, 380, 400];
      const weights = calculateActual2025Weights(actuals);

      expect(weights).toHaveLength(12);

      // 总和 = 3070
      expect(weights[0]).toBeCloseTo(100 / 3070, 4);
      expect(weights[11]).toBeCloseTo(400 / 3070, 4);

      // 权重总和应为 1.0
      const sum = weights.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 4);
    });

    it('应该正确处理均匀分布', () => {
      const actuals = Array(12).fill(100);
      const weights = calculateActual2025Weights(actuals);

      weights.forEach((weight) => {
        expect(weight).toBeCloseTo(1 / 12, 4);
      });
    });
  });

  describe('包含 null 值场景', () => {
    it('null 值应计为 0 权重', () => {
      const actuals = [100, null, 150, 200, 220, 250, 280, 300, 320, 350, 380, 400];
      const weights = calculateActual2025Weights(actuals);

      // 总和 = 2950 (不含null)
      expect(weights[0]).toBeCloseTo(100 / 2950, 4);
      expect(weights[1]).toBe(0); // null -> 0 权重

      const sum = weights.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 4);
    });

    it('全为 null 时应返回全 0 数组', () => {
      const actuals = Array(12).fill(null);
      const weights = calculateActual2025Weights(actuals);

      weights.forEach((weight) => {
        expect(weight).toBe(0);
      });
    });
  });

  describe('边界场景', () => {
    it('数组长度不为12时应返回全0数组', () => {
      const actuals = [100, 200, 300];
      const weights = calculateActual2025Weights(actuals);

      expect(weights).toHaveLength(12);
      weights.forEach((weight) => {
        expect(weight).toBe(0);
      });
    });

    it('全为0时应返回全0数组', () => {
      const actuals = Array(12).fill(0);
      const weights = calculateActual2025Weights(actuals);

      weights.forEach((weight) => {
        expect(weight).toBe(0);
      });
    });
  });

  describe('业务场景', () => {
    it('季节性明显的业务数据', () => {
      // 模拟季节性: Q1低, Q2-Q3高, Q4中
      const actuals = [
        50, 60, 70,      // Q1: 淡季
        150, 180, 200,   // Q2: 旺季
        190, 200, 180,   // Q3: 旺季
        100, 110, 120,   // Q4: 平季
      ]; // 总和 = 1610

      const weights = calculateActual2025Weights(actuals);

      // Q2-Q3权重应明显高于Q1
      expect(weights[3]).toBeGreaterThan(weights[0]); // 4月 > 1月
      expect(weights[4]).toBeGreaterThan(weights[1]); // 5月 > 2月

      const sum = weights.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 4);
    });
  });
});

describe('monthlyToQuarterly - 月度聚合为季度', () => {
  describe('正常场景', () => {
    it('应该正确聚合12个月为4个季度', () => {
      const monthly = [100, 120, 150, 200, 220, 250, 280, 300, 320, 350, 380, 400];
      const quarterly = monthlyToQuarterly(monthly);

      expect(quarterly).toHaveLength(4);
      expect(quarterly[0]).toBe(370);  // Q1: 100+120+150
      expect(quarterly[1]).toBe(670);  // Q2: 200+220+250
      expect(quarterly[2]).toBe(900);  // Q3: 280+300+320
      expect(quarterly[3]).toBe(1130); // Q4: 350+380+400
    });

    it('应该正确处理均匀分布', () => {
      const monthly = Array(12).fill(100);
      const quarterly = monthlyToQuarterly(monthly);

      quarterly.forEach((value) => {
        expect(value).toBe(300); // 每季度 3个月 × 100
      });
    });

    it('应该正确处理零值', () => {
      const monthly = Array(12).fill(0);
      const quarterly = monthlyToQuarterly(monthly);

      quarterly.forEach((value) => {
        expect(value).toBe(0);
      });
    });
  });

  describe('业务场景', () => {
    it('前高后低场景', () => {
      const monthly = [200, 200, 200, 150, 150, 150, 100, 100, 100, 50, 50, 50];
      const quarterly = monthlyToQuarterly(monthly);

      expect(quarterly[0]).toBe(600);  // Q1
      expect(quarterly[1]).toBe(450);  // Q2
      expect(quarterly[2]).toBe(300);  // Q3
      expect(quarterly[3]).toBe(150);  // Q4

      // Q1应大于Q4
      expect(quarterly[0]).toBeGreaterThan(quarterly[3]);
    });
  });

  describe('精度测试', () => {
    it('应该正确处理小数', () => {
      const monthly = [100.5, 120.3, 150.7, 200.1, 220.2, 250.8, 280.4, 300.5, 320.6, 350.7, 380.8, 400.9];
      const quarterly = monthlyToQuarterly(monthly);

      expect(quarterly[0]).toBeCloseTo(371.5, 1);  // Q1
      expect(quarterly[1]).toBeCloseTo(671.1, 1);  // Q2
      expect(quarterly[2]).toBeCloseTo(901.5, 1);  // Q3
      expect(quarterly[3]).toBeCloseTo(1132.4, 1); // Q4
    });
  });
});

describe('monthlyToYtd - 计算年累计', () => {
  const monthly = [100, 120, 150, 200, 220, 250, 280, 300, 320, 350, 380, 400];

  describe('正常场景', () => {
    it('1月YTD应等于1月值', () => {
      expect(monthlyToYtd(monthly, 1)).toBe(100);
    });

    it('3月YTD应为前3个月之和', () => {
      expect(monthlyToYtd(monthly, 3)).toBe(370); // 100+120+150
    });

    it('6月YTD应为上半年之和', () => {
      expect(monthlyToYtd(monthly, 6)).toBe(1040); // sum(0-5)
    });

    it('12月YTD应为全年之和', () => {
      expect(monthlyToYtd(monthly, 12)).toBe(3070);
    });
  });

  describe('边界场景', () => {
    it('月份超出范围应限制为12月', () => {
      const ytd = monthlyToYtd(monthly, 15);
      expect(ytd).toBe(3070); // 等于12月YTD
    });

    it('月份小于1应限制为1月', () => {
      const ytd = monthlyToYtd(monthly, 0);
      expect(ytd).toBe(100); // 等于1月YTD
    });

    it('负月份应限制为1月', () => {
      const ytd = monthlyToYtd(monthly, -5);
      expect(ytd).toBe(100);
    });
  });

  describe('业务场景', () => {
    it('Q1结束时YTD', () => {
      expect(monthlyToYtd(monthly, 3)).toBe(370);
    });

    it('Q2结束时YTD', () => {
      expect(monthlyToYtd(monthly, 6)).toBe(1040); // Q1+Q2
    });

    it('Q3结束时YTD', () => {
      expect(monthlyToYtd(monthly, 9)).toBe(1940); // Q1+Q2+Q3
    });

    it('年度结束时YTD', () => {
      expect(monthlyToYtd(monthly, 12)).toBe(3070);
    });
  });

  describe('全零场景', () => {
    it('全零数组的YTD应为0', () => {
      const zeroMonthly = Array(12).fill(0);
      expect(monthlyToYtd(zeroMonthly, 6)).toBe(0);
    });
  });

  describe('精度测试', () => {
    const preciseMonthly = [100.5, 120.3, 150.7, 200.1, 220.2, 250.8, 280.4, 300.5, 320.6, 350.7, 380.8, 400.9];

    it('应该正确处理小数累加', () => {
      const ytd3 = monthlyToYtd(preciseMonthly, 3);
      expect(ytd3).toBeCloseTo(371.5, 1);

      const ytd12 = monthlyToYtd(preciseMonthly, 12);
      expect(ytd12).toBeCloseTo(3076.5, 1);
    });
  });
});
