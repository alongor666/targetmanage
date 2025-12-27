# minion-business-analyzer

使用 Minion 框架进行智能业务分析的 Skill

## 概述

此 Skill 利用 Minion 的多策略推理能力（CoT、代码执行、规划等）对 TargetManage 的业务数据进行深度分析，识别异常趋势、生成洞察、提供优化建议。

## 何时使用

当用户需要：
- 智能分析目标达成情况
- 识别异常数据和趋势
- 获取业务优化建议
- 对比不同机构/产品的表现
- 预测未来趋势

## 工作流程

```
用户发起分析请求
    ↓
Claude Code 调用此 Skill
    ↓
Minion 选择最佳推理策略（CoT / Code / Plan）
    ↓
执行多维度数据分析
    ↓
验证和改进分析结果
    ↓
生成可视化洞察和建议
    ↓
返回分析报告
```

## 核心功能

### 1. 异常检测

```python
# Minion 执行的异常检测脚本
import pandas as pd
import numpy as np
from scipy import stats

def detect_anomalies(data, method='zscore', threshold=3):
    """
    检测业务数据中的异常值

    Args:
        data: 业务数据 DataFrame
        method: 检测方法 (zscore, iqr, isolation_forest)
        threshold: 异常阈值

    Returns:
        异常记录和分析报告
    """
    anomalies = {
        'organizations': [],
        'products': [],
        'time_periods': []
    }

    # 按机构检测异常
    for org in data['org_id'].unique():
        org_data = data[data['org_id'] == org]

        # 检测达成率异常
        achievement_rates = org_data['achievement_rate'].dropna()

        if method == 'zscore':
            z_scores = np.abs(stats.zscore(achievement_rates))
            outlier_mask = z_scores > threshold

            if outlier_mask.any():
                anomalies['organizations'].append({
                    'org_id': org,
                    'type': 'achievement_anomaly',
                    'severity': 'high' if np.max(z_scores) > 4 else 'medium',
                    'z_score': float(np.max(z_scores)),
                    'description': f"异常达成率: {org_data.loc[outlier_mask, 'achievement_rate'].tolist()}"
                })

        # 检测增长率异常
        if 'growth_rate' in org_data.columns:
            growth_rates = org_data['growth_rate'].dropna()
            z_scores = np.abs(stats.zscore(growth_rates))
            outlier_mask = z_scores > threshold

            if outlier_mask.any():
                anomalies['organizations'].append({
                    'org_id': org,
                    'type': 'growth_anomaly',
                    'severity': 'high' if np.max(z_scores) > 4 else 'medium',
                    'z_score': float(np.max(z_scores)),
                    'description': f"异常增长率: {org_data.loc[outlier_mask, 'growth_rate'].tolist()}"
                })

    # 按产品检测异常
    for product in data['product'].unique():
        product_data = data[data['product'] == product]

        # 检测市场份额异常
        if 'market_share' in product_data.columns:
            market_shares = product_data['market_share'].dropna()

            # 使用 IQR 方法
            Q1 = market_shares.quantile(0.25)
            Q3 = market_shares.quantile(0.75)
            IQR = Q3 - Q1

            outliers = market_shares[
                (market_shares < Q1 - 1.5 * IQR) |
                (market_shares > Q3 + 1.5 * IQR)
            ]

            if not outliers.empty:
                anomalies['products'].append({
                    'product': product,
                    'type': 'market_share_anomaly',
                    'outliers': outliers.tolist(),
                    'description': f"市场份额异常: {outliers.tolist()}"
                })

    return {
        'anomalies': anomalies,
        'total_detected': sum(len(v) for v in anomalies.values()),
        'severity_distribution': calculate_severity_distribution(anomalies),
        'recommendations': generate_anomaly_recommendations(anomalies)
    }

def calculate_severity_distribution(anomalies):
    """统计严重程度分布"""
    severity_count = {'high': 0, 'medium': 0, 'low': 0}

    for category in anomalies.values():
        for item in category:
            severity = item.get('severity', 'low')
            severity_count[severity] += 1

    return severity_count

def generate_anomaly_recommendations(anomalies):
    """根据异常生成建议"""
    recommendations = []

    # 分析机构异常
    org_anomalies = anomalies.get('organizations', [])
    high_severity = [a for a in org_anomalies if a.get('severity') == 'high']

    if high_severity:
        recommendations.append({
            'priority': 'urgent',
            'type': 'investigate',
            'description': f"发现 {len(high_severity)} 个高严重程度异常，建议立即调查",
            'actions': [
                '检查数据准确性',
                '分析异常原因',
                '制定改进措施'
            ]
        })

    # 分析产品异常
    product_anomalies = anomalies.get('products', [])
    if product_anomalies:
        recommendations.append({
            'priority': 'medium',
            'type': 'optimize',
            'description': f"{len(product_anomalies)} 个产品存在异常",
            'actions': [
                '审查产品策略',
                '调整资源配置',
                '优化营销方案'
            ]
        })

    return recommendations
```

### 2. 趋势分析

```python
def analyze_trends(data, period='quarterly'):
    """
    分析业务趋势

    Args:
        data: 历史数据
        period: 分析周期 (monthly, quarterly, annually)

    Returns:
        趋势分析报告
    """
    import statsmodels.api as sm
    from sklearn.linear_model import LinearRegression

    trends = {
        'overall': {},
        'by_organization': {},
        'by_product': {},
        'forecasts': {}
    }

    # 整体趋势
    time_series = data.groupby('time_period')['actual'].sum()

    # 线性回归趋势
    X = np.arange(len(time_series)).reshape(-1, 1)
    y = time_series.values

    model = LinearRegression()
    model.fit(X, y)

    trend_slope = model.coef_[0]
    trend_direction = 'increasing' if trend_slope > 0 else 'decreasing'

    trends['overall'] = {
        'direction': trend_direction,
        'slope': float(trend_slope),
        'strength': calculate_trend_strength(model, X, y),
        'r_squared': float(model.score(X, y))
    }

    # 按机构分析趋势
    for org in data['org_id'].unique():
        org_data = data[data['org_id'] == org]
        org_time_series = org_data.groupby('time_period')['actual'].sum()

        if len(org_time_series) > 3:  # 至少4个数据点
            X = np.arange(len(org_time_series)).reshape(-1, 1)
            y = org_time_series.values

            model = LinearRegression()
            model.fit(X, y)

            trends['by_organization'][org] = {
                'direction': 'increasing' if model.coef_[0] > 0 else 'decreasing',
                'slope': float(model.coef_[0]),
                'growth_rate': calculate_growth_rate(org_time_series)
            }

    # 生成预测
    if period == 'quarterly':
        forecast_periods = 4  # 预测未来4个季度
    elif period == 'monthly':
        forecast_periods = 6  # 预测未来6个月
    else:
        forecast_periods = 2  # 预测未来2年

    for org, org_trend in trends['by_organization'].items():
        # 使用简单线性预测
        last_value = data[data['org_id'] == org]['actual'].iloc[-1]
        predicted_values = [
            last_value * (1 + org_trend['slope']) ** (i + 1)
            for i in range(forecast_periods)
        ]

        trends['forecasts'][org] = {
            'periods': forecast_periods,
            'predicted': predicted_values,
            'confidence': calculate_forecast_confidence(org_trend)
        }

    return trends

def calculate_trend_strength(model, X, y):
    """计算趋势强度"""
    residuals = y - model.predict(X)
    ss_res = np.sum(residuals ** 2)
    ss_tot = np.sum((y - np.mean(y)) ** 2)
    r_squared = 1 - (ss_res / ss_tot)

    if r_squared > 0.8:
        return 'strong'
    elif r_squared > 0.5:
        return 'moderate'
    else:
        return 'weak'

def calculate_growth_rate(time_series):
    """计算增长率"""
    if len(time_series) < 2:
        return 0

    growth_rates = []
    for i in range(1, len(time_series)):
        if time_series.iloc[i - 1] != 0:
            rate = (time_series.iloc[i] - time_series.iloc[i - 1]) / time_series.iloc[i - 1]
            growth_rates.append(rate)

    return float(np.mean(growth_rates)) if growth_rates else 0

def calculate_forecast_confidence(trend):
    """计算预测置信度"""
    r_squared = trend.get('r_squared', 0)

    if r_squared > 0.9:
        return {'level': 'high', 'percentage': 0.9}
    elif r_squared > 0.7:
        return {'level': 'medium', 'percentage': 0.7}
    else:
        return {'level': 'low', 'percentage': 0.5}
```

### 3. 对比分析

```python
def compare_performance(data, dimensions=['organization', 'product']):
    """
    多维度对比分析

    Args:
        data: 业务数据
        dimensions: 对比维度

    Returns:
        对比分析报告
    """
    comparisons = {
        'top_performers': {},
        'under_performers': {},
        'gaps': {},
        'opportunities': []
    }

    # 按机构对比
    if 'organization' in dimensions:
        org_performance = data.groupby('org_id').agg({
            'achievement_rate': 'mean',
            'growth_rate': 'mean',
            'actual': 'sum'
        }).round(4)

        # Top performers
        top_achievers = org_performance.nlargest(3, 'achievement_rate')
        comparisons['top_performers']['organizations'] = top_achievers.to_dict('index')

        # Under performers
        under_achievers = org_performance.nsmallest(3, 'achievement_rate')
        comparisons['under_performers']['organizations'] = under_achievers.to_dict('index')

        # 性能差距
        max_achievement = org_performance['achievement_rate'].max()
        min_achievement = org_performance['achievement_rate'].min()
        comparisons['gaps']['achievement'] = {
            'max': float(max_achievement),
            'min': float(min_achievement),
            'gap': float(max_achievement - min_achievement),
            'gap_percentage': float((max_achievement - min_achievement) / max_achievement * 100)
        }

        # 识别改进机会
        median_achievement = org_performance['achievement_rate'].median()
        low_performers = org_performance[
            org_performance['achievement_rate'] < median_achievement
        ]

        for org, row in low_performers.iterrows():
            comparisons['opportunities'].append({
                'organization': org,
                'type': 'achievement_improvement',
                'current': float(row['achievement_rate']),
                'potential': float(median_achievement),
                'upside': float(median_achievement - row['achievement_rate']),
                'priority': 'high' if (median_achievement - row['achievement_rate']) > 0.2 else 'medium'
            })

    # 按产品对比
    if 'product' in dimensions:
        product_performance = data.groupby('product').agg({
            'achievement_rate': 'mean',
            'actual': 'sum',
            'target': 'sum'
        }).round(4)

        comparisons['top_performers']['products'] = (
            product_performance.nlargest(3, 'achievement_rate').to_dict('index')
        )

        comparisons['under_performers']['products'] = (
            product_performance.nsmallest(3, 'achievement_rate').to_dict('index')
        )

    return comparisons
```

## MCP 集成

```typescript
// src/mcp/minion-analyzer-server.ts
export class MinionAnalyzerServer {
  private server: MCPServer;

  constructor() {
    this.server = new MCPServer({
      name: 'minion-analyzer',
      version: '1.0.0'
    });

    this.registerTools();
  }

  private registerTools() {
    this.server.registerTool({
      name: 'detect_anomalies',
      description: 'Detect anomalies in business data using Minion',
      inputSchema: {
        type: 'object',
        properties: {
          dataSource: {
            type: 'string',
            description: 'Data source (actuals_monthly, targets, etc.)'
          },
          method: {
            type: 'string',
            enum: ['zscore', 'iqr', 'isolation_forest'],
            description: 'Detection method'
          },
          threshold: {
            type: 'number',
            description: 'Anomaly threshold (default: 3)'
          }
        }
      }
    });

    this.server.registerTool({
      name: 'analyze_trends',
      description: 'Analyze business trends and generate forecasts',
      inputSchema: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['monthly', 'quarterly', 'annually'],
            description: 'Analysis period'
          },
          forecastPeriods: {
            type: 'number',
            description: 'Number of periods to forecast'
          }
        }
      }
    });

    this.server.registerTool({
      name: 'compare_performance',
      description: 'Compare performance across dimensions',
      inputSchema: {
        type: 'object',
        properties: {
          dimensions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Dimensions to compare (organization, product, etc.)'
          }
        }
      }
    });
  }

  async detectAnomalies(args: any) {
    const data = await this.loadData(args.dataSource);

    const result = await this.callMinion({
      route: 'code',  // 使用代码执行策略
      code: this.generateAnomalyDetectionScript(args.method),
      input: {
        data: data,
        threshold: args.threshold || 3
      },
      check: true,  // 启用验证循环
      improve: true  // 启用改进循环
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  async analyzeTrends(args: any) {
    const data = await this.loadHistoricalData();

    // 使用规划策略进行复杂分析
    const result = await this.callMinion({
      route: 'plan',  # 使用规划策略
      task: 'Analyze business trends and generate forecasts',
      code: this.generateTrendAnalysisScript(args.period),
      input: {
        data: data,
        forecast_periods: args.forecastPeriods || 4
      },
      check: true
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  private async callMinion(params: any) {
    const response = await fetch(`${process.env.MINION_URL}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    return response.json();
  }

  private generateAnomalyDetectionScript(method: string): string {
    return `
import pandas as pd
import numpy as np
from scipy import stats

# Minion 异常检测脚本
# 方法: ${method}

def detect_anomalies(data, threshold):
    # ... 实现见上文 ...
    pass

result = detect_anomalies(data, threshold)
print(json.dumps(result, indent=2))
`;
  }

  private generateTrendAnalysisScript(period: string): string {
    return `
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

# Minion 趋势分析脚本
# 周期: ${period}

def analyze_trends(data, forecast_periods):
    # ... 实现见上文 ...
    pass

result = analyze_trends(data, forecast_periods)
print(json.dumps(result, indent=2))
`;
  }
}
```

## 前端集成

```typescript
// src/components/analytics/BusinessAnalysisPanel.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';

export function BusinessAnalysisPanel() {
  const [analysisResult, setAnalysisResult] = useState(null);

  const analyzeMutation = useMutation({
    mutationFn: async (type: 'anomalies' | 'trends' | 'comparison') => {
      const response = await fetch(`/api/minion/analyze/${type}`, {
        method: 'POST'
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <h2>智能业务分析</h2>

        <div className="flex gap-4">
          <button
            onClick={() => analyzeMutation.mutate('anomalies')}
            disabled={analyzeMutation.isLoading}
          >
            检测异常
          </button>

          <button
            onClick={() => analyzeMutation.mutate('trends')}
            disabled={analyzeMutation.isLoading}
          >
            趋势分析
          </button>

          <button
            onClick={() => analyzeMutation.mutate('comparison')}
            disabled={analyzeMutation.isLoading}
          >
            对比分析
          </button>
        </div>

        {analyzeMutation.isLoading && (
          <div className="mt-4">
            <p>Minion 正在分析中...</p>
            <div className="spinner" />
          </div>
        )}
      </Card>

      {analysisResult && (
        <AnalysisResults result={analysisResult} />
      )}
    </div>
  );
}

function AnalysisResults({ result }: { result: any }) {
  return (
    <div className="space-y-4">
      {/* 异常检测结果 */}
      {result.anomalies && (
        <Card>
          <h3>异常检测结果</h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label>检测到异常</label>
              <p className="text-2xl">{result.total_detected}</p>
            </div>

            <div>
              <label>高严重程度</label>
              <p className="text-2xl text-red-600">
                {result.severity_distribution.high}
              </p>
            </div>

            <div>
              <label>中等严重程度</label>
              <p className="text-2xl text-yellow-600">
                {result.severity_distribution.medium}
              </p>
            </div>
          </div>

          {/* 异常列表 */}
          {result.anomalies.organizations.length > 0 && (
            <div className="mt-4">
              <h4>机构异常</h4>
              <ul>
                {result.anomalies.organizations.map((anomaly: any, i: number) => (
                  <li key={i}>
                    {anomaly.org_id}: {anomaly.description}
                    <span className={`badge badge-${anomaly.severity}`}>
                      {anomaly.severity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 建议 */}
          {result.recommendations && (
            <div className="mt-4">
              <h4>改进建议</h4>
              {result.recommendations.map((rec: any, i: number) => (
                <div key={i} className={`alert alert-${rec.priority}`}>
                  <h5>{rec.description}</h5>
                  <ul>
                    {rec.actions.map((action: string, j: number) => (
                      <li key={j}>{action}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* 趋势分析结果 */}
      {result.trends && (
        <Card>
          <h3>趋势分析</h3>

          <div>
            <label>整体趋势</label>
            <p className={`trend-${result.trends.overall.direction}`}>
              {result.trends.overall.direction === 'increasing' ? '↗' : '↘'}
              {' '}趋势强度: {result.trends.overall.strength}
            </p>
          </div>

          {/* 预测图表 */}
          {result.forecasts && (
            <TrendForecastChart
              forecasts={result.forecasts}
            />
          )}
        </Card>
      )}

      {/* 对比分析结果 */}
      {result.comparison && (
        <Card>
          <h3>性能对比</h3>

          <ComparisonTable
            topPerformers={result.comparison.top_performers}
            underPerformers={result.comparison.under_performers}
          />

          {/* 改进机会 */}
          {result.opportunities && (
            <div className="mt-4">
              <h4>改进机会</h4>
              {result.opportunities.map((opp: any, i: number) => (
                <div key={i} className="opportunity-card">
                  <div>{opp.organization}</div>
                  <div>
                    当前: {(opp.current * 100).toFixed(1)}%
                    潜在: {(opp.potential * 100).toFixed(1)}%
                    上升空间: {(opp.upside * 100).toFixed(1)}%
                  </div>
                  <span className={`priority-${opp.priority}`}>
                    {opp.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// 趋势预测图表组件
function TrendForecastChart({ forecasts }: { forecasts: any }) {
  // 使用 ECharts 渲染预测图表
  const option = {
    title: { text: '业务趋势预测' },
    xAxis: { type: 'category' },
    yAxis: { type: 'value' },
    series: Object.entries(forecasts).map(([org, data]: [string, any]) => ({
      name: org,
      type: 'line',
      data: data.predicted,
      markLine: {
        data: [{ type: 'average', name: '平均值' }]
      }
    }))
  };

  return <ReactECharts option={option} />;
}

// 对比表格组件
function ComparisonTable({
  topPerformers,
  underPerformers
}: {
  topPerformers: any;
  underPerformers: any;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4>Top Performers</h4>
        <table>
          <thead>
            <tr>
              <th>机构/产品</th>
              <th>达成率</th>
              <th>增长率</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(topPerformers.organizations || {}).map(([name, data]: [string, any]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{(data.achievement_rate * 100).toFixed(1)}%</td>
                <td>{(data.growth_rate * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h4>Under Performers</h4>
        <table>
          <thead>
            <tr>
              <th>机构/产品</th>
              <th>达成率</th>
              <th>增长率</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(underPerformers.organizations || {}).map(([name, data]: [string, any]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{(data.achievement_rate * 100).toFixed(1)}%</td>
                <td>{(data.growth_rate * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## API 路由

```typescript
// src/app/api/minion/analyze/[type]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MinionAnalyzerServer } from '@/mcp/minion-analyzer-server';

const analyzer = new MinionAnalyzerServer();

export async function POST(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  const { type } = params;
  const body = await request.json();

  try {
    let result;

    switch (type) {
      case 'anomalies':
        result = await analyzer.detectAnomalies(body);
        break;

      case 'trends':
        result = await analyzer.analyzeTrends(body);
        break;

      case 'comparison':
        result = await analyzer.comparePerformance(body);
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown analysis type' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

## 与现有功能配合

### 1. 与 ECharts 集成

```typescript
// 将 Minion 分析结果可视化
function visualizeAnalysis(result: AnalysisResult) {
  const charts = [];

  // 异常分布饼图
  if (result.anomalies) {
    charts.push({
      type: 'pie',
      title: '异常严重程度分布',
      data: Object.entries(result.severity_distribution).map(([key, value]) => ({
        name: key,
        value: value
      }))
    });
  }

  // 趋势线图
  if (result.trends) {
    charts.push({
      type: 'line',
      title: '业务趋势',
      data: result.trends.forecasts,
      xAxis: 'period',
      yAxis: 'value'
    });
  }

  // 对比柱状图
  if (result.comparison) {
    charts.push({
      type: 'bar',
      title: '性能对比',
      data: result.comparison.top_performers
    });
  }

  return charts;
}
```

### 2. 与 Domain 层集成

```typescript
// 使用 domain 层计算函数为 Minion 提供输入
import { calculateAchievementRate } from '@/domain/achievement';
import { calculateGrowthRate } from '@/domain/growth';

async function prepareDataForMinion() {
  const actuals = loadActualsMonthly2026();
  const targets = loadTargetsAnnual2026();

  const enrichedData = actuals.map(record => {
    const achievementRate = calculateAchievementRate(
      record.actual,
      findTarget(targets, record)
    );

    return {
      ...record,
      achievement_rate: achievementRate,
      // Minion 可以基于这些 enriched 数据进行分析
    };
  });

  return enrichedData;
}
```

## 配置

```typescript
// minion-analyzer.config.ts
export const analyzerConfig = {
  // Minion 策略配置
  strategies: {
    anomalyDetection: 'code',  // 使用代码执行策略
    trendAnalysis: 'plan',     // 使用规划策略
    simpleComparison: 'cot'    // 使用 CoT 推理
  },

  // 分析参数
  parameters: {
    anomalyThreshold: 3,
    forecastPeriods: 4,
    confidenceLevel: 0.95
  },

  // 缓存配置
  cache: {
    enabled: true,
    ttl: 3600,  // 1小时
    keyGenerator: (params: any) => `${params.type}_${JSON.stringify(params)}`
  },

  // 性能配置
  performance: {
    maxConcurrentAnalyses: 3,
    timeout: 30000,
    retryAttempts: 2
  }
};
```

## 使用示例

```typescript
// 用户调用示例
const analysisResult = await fetch('/api/minion/analyze/trends', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    period: 'quarterly',
    forecastPeriods: 4
  })
}).then(r => r.json());

console.log('趋势分析结果:', analysisResult);

// 结果示例:
{
  "overall": {
    "direction": "increasing",
    "slope": 0.05,
    "strength": "strong",
    "r_squared": 0.92
  },
  "forecasts": {
    "本部": {
      "predicted": [125000, 131250, 137812, 144703],
      "confidence": { "level": "high", "percentage": 0.92 }
    },
    // ...
  }
}
```

## 高级功能

### 1. 自动报告生成

```python
# Minion 生成分析报告
def generate_analysis_report(analysis_results):
    """
    生成自然语言分析报告
    """
    report = []

    # 整体趋势总结
    if analysis_results['trends']['overall']['direction'] == 'increasing':
        report.append("整体业务呈现上升趋势，")
        if analysis_results['trends']['overall']['strength'] == 'strong':
            report.append("且趋势强劲。")
        else:
            report.append("但趋势较弱。")

    # 异常总结
    if analysis_results['anomalies']['total_detected'] > 0:
        report.append(f"\n检测到 {analysis_results['anomalies']['total_detected']} 个异常，")
        high_severity = analysis_results['anomalies']['severity_distribution']['high']
        if high_severity > 0:
            report.append(f"其中 {high_severity} 个为高严重程度，需要立即关注。")

    # 建议
    if analysis_results['recommendations']:
        report.append("\n主要建议：")
        for rec in analysis_results['recommendations'][:3]:
            report.append(f"- {rec['description']}")

    return '\n'.join(report)
```

### 2. 实时监控

```typescript
// 设置实时异常监控
function setupRealTimeMonitoring() {
  setInterval(async () => {
    const anomalies = await analyzer.detectAnomalies({
      dataSource: 'actuals_monthly',
      method: 'zscore'
    });

    if (anomalies.total_detected > 0) {
      showNotification({
        type: 'warning',
        title: '检测到新异常',
        message: `发现 ${anomalies.total_detected} 个异常需要关注`
      });
    }
  }, 300000);  // 每5分钟检查一次
}
```

## 相关文档

- `docs/business/指标定义规范.md` - 业务指标定义
- `src/domain/achievement.ts` - 达成率计算
- `src/domain/growth.ts` - 增长率计算

## 相关文件

- `src/mcp/minion-analyzer-server.ts` - MCP 服务器
- `src/components/analytics/BusinessAnalysisPanel.tsx` - 分析面板
- `src/app/api/minion/analyze/[type]/route.ts` - API 路由
- `minion-analyzer.config.ts` - 配置文件
