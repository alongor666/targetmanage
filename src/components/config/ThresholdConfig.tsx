"use client";

import { useState } from "react";
import type { ThresholdRule } from "@/schemas/types";
import { DEFAULT_THRESHOLD_RULES } from "@/config/thresholdRules";
import { validateThresholds } from "@/schemas/schema";

interface ThresholdConfigProps {
  thresholds?: ThresholdRule;
  onChange?: (thresholds: ThresholdRule) => void;
  readonly?: boolean;
}

/**
 * Threshold Configuration Component
 *
 * Allows users to configure threshold rules for achievement rate and growth rate status determination.
 *
 * Achievement Rate Logic:
 * - Excellent: rate >= good_min
 * - Normal: 1 <= rate < good_min
 * - Warning: warning_min <= rate < 1
 * - Danger: rate < warning_min
 *
 * Growth Rate Logic:
 * - Excellent: rate >= good_min
 * - Normal: warning_min <= rate < good_min
 * - Warning: 0 <= rate < warning_min
 * - Danger: rate < 0
 */
export function ThresholdConfig({
  thresholds: initialThresholds = DEFAULT_THRESHOLD_RULES,
  onChange,
  readonly = false,
}: ThresholdConfigProps) {
  const [thresholds, setThresholds] = useState<ThresholdRule>(initialThresholds);
  const [validationError, setValidationError] = useState<string | null>(null);

  const updateThreshold = (
    category: 'achievement' | 'growth',
    field: 'good_min' | 'warning_min',
    value: number
  ) => {
    const updated = {
      ...thresholds,
      [category]: {
        ...thresholds[category],
        [field]: value,
      },
    };

    try {
      validateThresholds(updated);
      setValidationError(null);
      setThresholds(updated);
      onChange?.(updated);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setValidationError(message.split(':')[0] || message);
    }
  };

  return (
    <div className="space-y-6">
      {/* 达成率阈值配置 */}
      <section
        className="rounded-xl border p-4 transition-shadow duration-250 hover:shadow-[0_2px_8px_rgba(0,112,192,0.15)]"
        style={{ borderColor: '#e0e0e0' }}
      >
        <h3 className="text-sm font-medium" style={{ color: '#333' }}>
          达成率阈值
        </h3>
        <p className="mt-1 text-xs" style={{ color: '#666' }}>
          基于目标达成率判断状态：≥优秀线为优秀，≥100%为正常，≥预警线为预警，&lt;预警线为危险
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* 优秀阈值 */}
          <div className="rounded-lg border p-3" style={{ borderColor: '#e0e0e0' }}>
            <div className="flex items-center justify-between">
              <label className="text-xs" style={{ color: '#666' }}>
                优秀线
              </label>
              <div
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: 'rgba(0, 176, 80, 0.1)', color: '#00b050' }}
              >
                优秀
              </div>
            </div>
            <input
              className="mt-2 w-full rounded border px-2 py-1 text-sm"
              style={{ borderColor: '#e0e0e0' }}
              type="number"
              step="0.01"
              min="1"
              max="2"
              value={thresholds.achievement.good_min}
              onChange={(e) => updateThreshold('achievement', 'good_min', Number(e.target.value))}
              disabled={readonly}
            />
            <div className="mt-2 text-xs" style={{ color: '#999' }}>
              {(thresholds.achievement.good_min * 100).toFixed(0)}% 及以上为优秀
            </div>
          </div>

          {/* 预警阈值 */}
          <div className="rounded-lg border p-3" style={{ borderColor: '#e0e0e0' }}>
            <div className="flex items-center justify-between">
              <label className="text-xs" style={{ color: '#666' }}>
                预警线
              </label>
              <div
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: 'rgba(255, 192, 0, 0.1)', color: '#ffc000' }}
              >
                预警
              </div>
            </div>
            <input
              className="mt-2 w-full rounded border px-2 py-1 text-sm"
              style={{ borderColor: '#e0e0e0' }}
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={thresholds.achievement.warning_min}
              onChange={(e) => updateThreshold('achievement', 'warning_min', Number(e.target.value))}
              disabled={readonly}
            />
            <div className="mt-2 text-xs" style={{ color: '#999' }}>
              {(thresholds.achievement.warning_min * 100).toFixed(0)}% 以下为危险
            </div>
          </div>
        </div>

        {/* 状态说明 */}
        <div className="mt-3 rounded bg-gray-50 p-2 text-xs" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="flex flex-wrap gap-2">
            <span style={{ color: '#00b050' }}>
              ● 优秀: ≥{(thresholds.achievement.good_min * 100).toFixed(0)}%
            </span>
            <span style={{ color: '#666' }}>
              ● 正常: 100% - {(thresholds.achievement.good_min * 100).toFixed(0)}%
            </span>
            <span style={{ color: '#ffc000' }}>
              ● 预警: {(thresholds.achievement.warning_min * 100).toFixed(0)}% - 100%
            </span>
            <span style={{ color: '#c00000' }}>
              ● 危险: &lt;{(thresholds.achievement.warning_min * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </section>

      {/* 增长率阈值配置 */}
      <section
        className="rounded-xl border p-4 transition-shadow duration-250 hover:shadow-[0_2px_8px_rgba(0,112,192,0.15)]"
        style={{ borderColor: '#e0e0e0' }}
      >
        <h3 className="text-sm font-medium" style={{ color: '#333' }}>
          增长率阈值
        </h3>
        <p className="mt-1 text-xs" style={{ color: '#666' }}>
          基于同比增长率判断状态：≥优秀线为优秀，≥预警线为正常，≥0为预警，&lt;0为危险
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* 优秀阈值 */}
          <div className="rounded-lg border p-3" style={{ borderColor: '#e0e0e0' }}>
            <div className="flex items-center justify-between">
              <label className="text-xs" style={{ color: '#666' }}>
                优秀线
              </label>
              <div
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: 'rgba(0, 176, 80, 0.1)', color: '#00b050' }}
              >
                优秀
              </div>
            </div>
            <input
              className="mt-2 w-full rounded border px-2 py-1 text-sm"
              style={{ borderColor: '#e0e0e0' }}
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={thresholds.growth.good_min}
              onChange={(e) => updateThreshold('growth', 'good_min', Number(e.target.value))}
              disabled={readonly}
            />
            <div className="mt-2 text-xs" style={{ color: '#999' }}>
              {(thresholds.growth.good_min * 100).toFixed(0)}% 及以上为优秀
            </div>
          </div>

          {/* 预警阈值 */}
          <div className="rounded-lg border p-3" style={{ borderColor: '#e0e0e0' }}>
            <div className="flex items-center justify-between">
              <label className="text-xs" style={{ color: '#666' }}>
                预警线
              </label>
              <div
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: 'rgba(255, 192, 0, 0.1)', color: '#ffc000' }}
              >
                预警
              </div>
            </div>
            <input
              className="mt-2 w-full rounded border px-2 py-1 text-sm"
              style={{ borderColor: '#e0e0e0' }}
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={thresholds.growth.warning_min}
              onChange={(e) => updateThreshold('growth', 'warning_min', Number(e.target.value))}
              disabled={readonly}
            />
            <div className="mt-2 text-xs" style={{ color: '#999' }}>
              {(thresholds.growth.warning_min * 100).toFixed(0)}% - {(thresholds.growth.good_min * 100).toFixed(0)}% 为正常
            </div>
          </div>
        </div>

        {/* 状态说明 */}
        <div className="mt-3 rounded bg-gray-50 p-2 text-xs" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="flex flex-wrap gap-2">
            <span style={{ color: '#00b050' }}>
              ● 优秀: ≥{(thresholds.growth.good_min * 100).toFixed(0)}%
            </span>
            <span style={{ color: '#666' }}>
              ● 正常: {(thresholds.growth.warning_min * 100).toFixed(0)}% - {(thresholds.growth.good_min * 100).toFixed(0)}%
            </span>
            <span style={{ color: '#ffc000' }}>
              ● 预警: 0% - {(thresholds.growth.warning_min * 100).toFixed(0)}%
            </span>
            <span style={{ color: '#c00000' }}>
              ● 危险: &lt;0%
            </span>
          </div>
        </div>
      </section>

      {/* 验证错误提示 */}
      {validationError && (
        <div
          className="rounded-lg border p-3 text-sm"
          style={{ backgroundColor: 'rgba(192, 0, 0, 0.05)', borderColor: 'rgba(192, 0, 0, 0.2)', color: '#c00000' }}
        >
          <div className="font-medium">配置错误</div>
          <div className="mt-1 text-xs">{validationError}</div>
        </div>
      )}

      {/* 备注 */}
      {!readonly && (
        <div className="rounded-lg border p-3 text-xs" style={{ backgroundColor: '#f8f9fa', borderColor: '#e0e0e0' }}>
          <div className="font-medium" style={{ color: '#333' }}>配置说明</div>
          <ul className="mt-2 space-y-1" style={{ color: '#666' }}>
            <li>• 达成率：优秀线必须大于100%，预警线必须小于100%</li>
            <li>• 增长率：优秀线必须大于预警线</li>
            <li>• 预警线以下（达成率）或负增长（增长率）为危险状态</li>
          </ul>
        </div>
      )}
    </div>
  );
}
