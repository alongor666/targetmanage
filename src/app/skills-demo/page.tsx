'use client';

import { useState } from 'react';
import { useSkills, useSkillExecution, useSkill } from '@/lib/skill-loader/hooks';

/**
 * Skills 系统演示页面
 */
export default function SkillsDemoPage() {
  const { skills, loading: skillsLoading } = useSkills();
  const { execute, result, loading: execLoading, error: execError, reset } = useSkillExecution();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const selectedSkillData = selectedSkill ? skills.find((s) => s.name === selectedSkill) : null;

  // 数据导入示例
  const handleDataImport = async () => {
    const csvText = `year,month,org_cn,product_cn,premium
2026,1,成都分公司,车险,8500
2026,2,成都分公司,车险,9200
2026,3,成都分公司,车险,10500`;

    await execute('data-import', {
      type: 'csv',
      csvText
    });
  };

  // KPI 计算示例
  const handleKPICalculation = async () => {
    await execute('kpi-calculation', {
      current: {
        month: 10500,
        quarter: 28200,
        ytd: 58000
      },
      baseline: {
        month: 8000,
        quarter: 21000,
        ytd: 45000
      }
    });
  };

  // 图表可视化示例
  const handleChartVisualization = async () => {
    await execute('chart-visualization', {
      chartType: 'bar',
      data: {
        months: ['1月', '2月', '3月', '4月', '5月', '6月'],
        target: [6000, 7200, 8500, 9800, 10200, 10600],
        actual: [5500, 6800, 8000, 9200, 9800, 10300],
        growthRate: [0.10, 0.15, 0.20, 0.18, 0.16, 0.12]
      },
      options: {
        showGrowthLine: true,
        enableWarning: true,
        responsive: true
      }
    });
  };

  if (skillsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading Skills...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Skills System Demo</h1>

      {/* 技能列表 */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Available Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                selectedSkill === skill.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedSkill(skill.name)}
            >
              <h3 className="text-xl font-bold mb-2">{skill.name}</h3>
              <p className="text-gray-600 text-sm">{skill.description}</p>
              <div className="mt-3 text-xs text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {skill.category || 'uncategorized'}
                </span>
                <span className="ml-2">v{skill.version}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 技能详情 */}
      {selectedSkillData && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Skill Details</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">{selectedSkillData.name}</h3>
            <p className="text-gray-600 mb-4">{selectedSkillData.description}</p>
            <div className="mb-4 text-sm text-gray-500">
              <span>Version: {selectedSkillData.version}</span>
              {selectedSkillData.license && <span className="ml-4">License: {selectedSkillData.license}</span>}
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm whitespace-pre-wrap text-gray-700 font-mono">
                {selectedSkillData.content}
              </pre>
            </div>
          </div>
        </section>
      )}

      {/* 快速示例 */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Quick Examples</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleDataImport}
            disabled={execLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {execLoading ? 'Executing...' : 'Run Data Import Example'}
          </button>
          <button
            onClick={handleKPICalculation}
            disabled={execLoading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {execLoading ? 'Executing...' : 'Run KPI Calculation Example'}
          </button>
          <button
            onClick={handleChartVisualization}
            disabled={execLoading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
          >
            {execLoading ? 'Executing...' : 'Run Chart Visualization Example'}
          </button>
          {result && (
            <button
              onClick={reset}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </section>

      {/* 执行结果 */}
      {result && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Execution Result</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Success
              </span>
              <span className="ml-3 text-gray-700">Skill: {result.skillName}</span>
            </div>
            <div className="bg-white rounded-lg p-4">
              <pre className="text-sm whitespace-pre-wrap text-gray-800 overflow-auto">
                {JSON.stringify(result.result, null, 2)}
              </pre>
            </div>
          </div>
        </section>
      )}

      {/* 错误信息 */}
      {execError && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Error</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Error
              </span>
            </div>
            <p className="text-red-800">{execError.message}</p>
          </div>
        </section>
      )}

      {/* 技能统计 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-blue-600">{skills.length}</div>
            <div className="text-gray-600 mt-2">Total Skills</div>
          </div>
          <div className="bg-green-50 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-green-600">
              {new Set(skills.map((s) => s.category)).size}
            </div>
            <div className="text-gray-600 mt-2">Categories</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-purple-600">
              {skills.filter((s) => s.location === 'project').length}
            </div>
            <div className="text-gray-600 mt-2">Project Skills</div>
          </div>
        </div>
      </section>
    </div>
  );
}
