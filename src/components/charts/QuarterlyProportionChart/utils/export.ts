/**
 * 导出工具函数
 *
 * @description CSV、图片导出功能
 */

import type { QuarterlyProportionData, QuarterDetailData } from '../QuarterlyProportionChart.types';
import { formatPercent, formatNumber, formatDateTime, sanitizeFilename } from './formatter';

/**
 * 导出数据为 CSV
 * @param data - 季度占比数据
 * @param filename - 文件名
 */
export function exportToCSV(
  data: QuarterlyProportionData & { quarterDetails?: QuarterDetailData[] },
  filename: string = '季度占比数据'
): void {
  const rows = [
    // 标题行
    ['季度占比规划数据导出'],
    [`导出时间: ${formatDateTime(new Date())}`],
    [], // 空行
    // 表头
    [
      '季度',
      '2026目标',
      '2026规划占比',
      '2025实际',
      '2025实际占比',
      '当前实际',
      '增长率',
      '预警级别',
    ],
  ];

  // 数据行
  const { quarterDetails = [] } = data;
  const QUARTER_LABELS = ['一季度', '二季度', '三季度', '四季度'];

  quarterDetails.forEach((detail, index) => {
    rows.push([
      QUARTER_LABELS[index],
      formatNumber(detail.target),
      formatPercent(detail.targetShare),
      formatNumber(detail.actual2025),
      formatPercent(detail.actualShare2025),
      formatNumber(detail.current),
      formatPercent(detail.growth, 2),
      detail.warningLevel,
    ]);
  });

  // 汇总行
  rows.push([]);
  rows.push(['汇总']);
  rows.push(['2026年度总目标', formatNumber(data.totalTarget)]);
  rows.push(['2025年度总实际', formatNumber(data.totalActual2025)]);

  // 转换为 CSV 格式
  const csvContent = rows
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  // 添加 BOM 以支持中文
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // 下载文件
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${sanitizeFilename(filename)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 导出图表为图片
 * @param chartRef - ECharts 实例引用
 * @param filename - 文件名
 * @param options - 导出选项
 */
export async function exportToImage(
  chartRef: any,
  filename: string = '季度占比规划图',
  options: {
    type?: 'png' | 'jpeg';
    quality?: number;
    pixelRatio?: number;
    backgroundColor?: string;
  } = {}
): Promise<void> {
  const {
    type = 'png',
    quality = 1,
    pixelRatio = 2,
    backgroundColor = '#fff',
  } = options;

  if (!chartRef || !chartRef.getEchartsInstance) {
    console.error('Invalid chart reference');
    return;
  }

  try {
    const chart = chartRef.getEchartsInstance();

    // 获取图片 DataURL
    const url = chart.getDataURL({
      type,
      pixelRatio,
      backgroundColor,
    });

    // 下载图片
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${sanitizeFilename(filename)}.${type}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to export chart as image:', error);
    throw error;
  }
}

/**
 * 导出季度详情为 Excel（使用 CSV 格式）
 * @param details - 季度详情数组
 * @param filename - 文件名
 */
export function exportQuarterDetails(
  details: QuarterDetailData[],
  filename: string = '季度详细数据'
): void {
  const rows = [
    ['季度详细数据'],
    [`导出时间: ${formatDateTime(new Date())}`],
    [],
    [
      '季度',
      '2026目标',
      '占比(%)',
      '2025实际',
      '占比(%)',
      '当前实际',
      '增长率(%)',
      '预警级别',
    ],
  ];

  details.forEach((detail) => {
    rows.push([
      detail.quarterLabel,
      detail.target.toString(),
      (detail.targetShare * 100).toFixed(2),
      detail.actual2025?.toString() ?? 'N/A',
      detail.actualShare2025 ? (detail.actualShare2025 * 100).toFixed(2) : 'N/A',
      detail.current?.toString() ?? 'N/A',
      detail.growth !== null ? (detail.growth * 100).toFixed(2) : 'N/A',
      detail.warningLevel,
    ]);
  });

  const csvContent = rows
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${sanitizeFilename(filename)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 导出数据为 JSON
 * @param data - 要导出的数据
 * @param filename - 文件名
 */
export function exportToJSON(data: any, filename: string = '导出数据'): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${sanitizeFilename(filename)}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 打印图表
 * @param chartRef - ECharts 实例引用
 * @param title - 打印标题
 */
export function printChart(chartRef: any, title: string = '季度占比规划图'): void {
  if (!chartRef || !chartRef.getEchartsInstance) {
    console.error('Invalid chart reference');
    return;
  }

  try {
    const chart = chartRef.getEchartsInstance();
    const url = chart.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff',
    });

    // 创建新窗口打印
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
                text-align: center;
              }
              h1 {
                margin-bottom: 20px;
                font-size: 24px;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              @media print {
                body { padding: 0; }
                h1 { page-break-after: avoid; }
              }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <img src="${url}" alt="${title}" />
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  } catch (error) {
    console.error('Failed to print chart:', error);
    throw error;
  }
}

/**
 * 复制数据到剪贴板
 * @param data - 要复制的数据
 * @param format - 格式类型
 */
export async function copyToClipboard(
  data: any,
  format: 'json' | 'text' = 'json'
): Promise<void> {
  try {
    let content: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        break;
      case 'text':
        content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        break;
    }

    await navigator.clipboard.writeText(content);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw error;
  }
}

/**
 * 生成报表（包含图表和数据）
 * @param chartRef - ECharts 实例引用
 * @param data - 季度占比数据
 * @param filename - 文件名
 */
export async function generateReport(
  chartRef: any,
  data: QuarterlyProportionData & { quarterDetails?: QuarterDetailData[] },
  filename: string = '季度占比报表'
): Promise<void> {
  try {
    // 获取图表图片
    const chart = chartRef.getEchartsInstance();
    const chartImage = chart.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff',
    });

    // 创建 HTML 报表
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${filename}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
              margin: 40px;
              line-height: 1.6;
              color: #333;
            }
            h1 {
              color: #0070c0;
              border-bottom: 2px solid #0070c0;
              padding-bottom: 10px;
            }
            h2 {
              color: #555;
              margin-top: 30px;
            }
            .chart-container {
              text-align: center;
              margin: 30px 0;
              padding: 20px;
              background: #f9f9f9;
              border-radius: 8px;
            }
            .chart-container img {
              max-width: 100%;
              border-radius: 4px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #0070c0;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .summary {
              background-color: #f0f7ff;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #777;
              font-size: 14px;
            }
            @media print {
              body { margin: 20px; }
              .chart-container { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>${filename}</h1>
          <p>导出时间: ${formatDateTime(new Date())}</p>

          <div class="chart-container">
            <h2>季度占比规划图</h2>
            <img src="${chartImage}" alt="季度占比规划图" />
          </div>

          <h2>数据详情</h2>
          <table>
            <thead>
              <tr>
                <th>季度</th>
                <th>2026目标</th>
                <th>占比</th>
                <th>2025实际</th>
                <th>占比</th>
                <th>当前实际</th>
                <th>增长率</th>
                <th>预警级别</th>
              </tr>
            </thead>
            <tbody>
              ${data.quarterDetails?.map((detail) => `
                <tr>
                  <td>${detail.quarterLabel}</td>
                  <td>${formatNumber(detail.target)}</td>
                  <td>${formatPercent(detail.targetShare)}</td>
                  <td>${formatNumber(detail.actual2025)}</td>
                  <td>${formatPercent(detail.actualShare2025)}</td>
                  <td>${formatNumber(detail.current)}</td>
                  <td>${formatPercent(detail.growth, 2)}</td>
                  <td>${detail.warningLevel}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>

          <div class="summary">
            <h2>汇总数据</h2>
            <p><strong>2026年度总目标:</strong> ${formatNumber(data.totalTarget)}</p>
            <p><strong>2025年度总实际:</strong> ${formatNumber(data.totalActual2025)}</p>
          </div>

          <div class="footer">
            <p>本报表由目标管理系统自动生成</p>
          </div>
        </body>
      </html>
    `;

    // 创建 Blob 并下载
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${sanitizeFilename(filename)}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to generate report:', error);
    throw error;
  }
}
