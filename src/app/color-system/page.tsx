"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { colors } from "@/styles/tokens";
import { lsGetJson, lsSetJson, LS_KEYS } from "@/services/storage";

// 中文名称映射
const CATEGORY_NAMES: Record<string, string> = {
  brand: "品牌色 (Brand)",
  status: "状态色 (Status)",
  text: "文字色 (Text)",
  border: "边框色 (Border)",
  background: "背景色 (Background)",
  chart: "图表色 (Chart)",
  kpiCard: "KPI卡片 (KpiCard)",
  typography: "排版 (Typography)",
  spacing: "间距 (Spacing)",
  radius: "圆角 (Radius)",
};

// SVG Icon Component
const CopyIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2-2v1"></path>
  </svg>
);

// 非颜色 Token 映射 (只读/复制)
const OTHER_TOKENS_MAPPING: Record<string, Record<string, { var: string, desc: string }>> = {
  typography: {
    "font-size-xs": { var: "--font-size-xs", desc: "超小号字 (XS)" },
    "font-size-sm": { var: "--font-size-sm", desc: "小号字 (SM)" },
    "font-size-base": { var: "--font-size-base", desc: "标准字 (Base)" },
    "font-size-md": { var: "--font-size-md", desc: "中号字 (MD)" },
    "font-size-lg": { var: "--font-size-lg", desc: "大号字 (LG)" },
    "font-size-xl": { var: "--font-size-xl", desc: "特大号字 (XL)" },
    "font-size-xxl": { var: "--font-size-xxl", desc: "超大号字 (XXL)" },
    "font-size-xxxl": { var: "--font-size-xxxl", desc: "巨型字 (XXXL)" },
  },
  spacing: {
    "spacing-xs": { var: "--spacing-xs", desc: "微间距 (XS)" },
    "spacing-sm": { var: "--spacing-sm", desc: "小间距 (SM)" },
    "spacing-md": { var: "--spacing-md", desc: "中间距 (MD)" },
    "spacing-lg": { var: "--spacing-lg", desc: "大间距 (LG)" },
    "spacing-xl": { var: "--spacing-xl", desc: "特大间距 (XL)" },
    "spacing-xxl": { var: "--spacing-xxl", desc: "超大间距 (XXL)" },
    "spacing-xxxl": { var: "--spacing-xxxl", desc: "巨型间距 (XXXL)" },
  },
  radius: {
    "radius-xs": { var: "--radius-xs", desc: "微圆角 (XS)" },
    "radius-sm": { var: "--radius-sm", desc: "小圆角 (SM)" },
    "radius-md": { var: "--radius-md", desc: "中圆角 (MD)" },
    "radius-lg": { var: "--radius-lg", desc: "大圆角 (LG)" },
    "radius-xl": { var: "--radius-xl", desc: "特大圆角 (XL)" },
    "radius-full": { var: "--radius-full", desc: "全圆角 (Full)" },
  }
};

// Token 描述映射 (用于导出注释)
const TOKEN_COMMENTS: Record<string, string> = {
  "brand.primaryRed": "主色调 - 红色 (用于重要标题、强调)",
  "brand.teslaBlue": "特斯拉蓝 (用于链接、交互元素)",
  
  "status.good": "优秀/正常 - 绿色",
  "status.warning": "预警/注意 - 橙色",
  "status.danger": "危险/负增长 - 深红色",
  "status.normal": "正常/默认 - 灰色",
  "status.info": "信息提示 - 蓝色",

  "text.primary": "主要文字 (标题、正文)",
  "text.secondary": "次要文字 (标签、描述)",
  "text.muted": "辅助文字 (占位符、提示)",
  "text.inverse": "反白文字 (在深色背景上)",

  "border.light": "浅色边框 (默认分割线)",
  "border.medium": "中等边框 (强调分割线)",
  "border.dark": "深色边框 (高对比度分割线)",

  "background.primary": "主背景 (卡片、容器)",
  "background.secondary": "次背景 (页面背景)",
  "background.tertiary": "第三级背景 (禁用状态、浅色区域)",

  "chart.targetNormal": "目标值柱子(正常) - 浅天蓝色",
  "chart.targetNormalBorder": "目标值柱子边框色",
  "chart.targetNormalBorderWidth": "目标值柱子边框粗细 (px)",
  "chart.targetWarning": "目标值柱子(预警) - 浅灰色填充",
  "chart.targetWarningBorder": "目标值柱子(预警边框) - 橙色1px",
  "chart.targetWarningBorderWidth": "目标值柱子(预警边框)粗细 (px)",
  "chart.actual": "实际值柱子(固定) - 浅灰色",
  "chart.actualBorder": "实际值柱子边框色",
  "chart.actualBorderWidth": "实际值柱子边框粗细 (px)",
  "chart.line": "折线 - 蓝色",
  "chart.warningLine": "预警线 - 橙色虚线",
  "chart.labelDefault": "柱状图标签(正常) - 灰色",
  "chart.labelWarning": "柱状图标签(预警) - 深红色",

  "kpiCard.defaultBorder": "默认边框",
  "kpiCard.defaultValue": "默认数值颜色",
  "kpiCard.goodValue": "优秀数值颜色",
  "kpiCard.warningValue": "预警数值颜色",
  "kpiCard.dangerValue": "危险数值颜色",
};

// 映射 TS token 到 CSS 变量名
const TOKEN_MAPPING: Record<string, Record<string, string>> = {
  brand: {
    primaryRed: "--color-primary-red",
    teslaBlue: "--color-tesla-blue",
  },
  status: {
    good: "--color-status-good",
    warning: "--color-status-warning",
    danger: "--color-status-danger",
    normal: "--color-status-normal",
    info: "--color-status-info",
  },
  text: {
    primary: "--color-text-primary",
    secondary: "--color-text-secondary",
    muted: "--color-text-muted",
    inverse: "--color-text-inverse",
  },
  border: {
    light: "--color-border-light",
    medium: "--color-border-medium",
    dark: "--color-border-dark",
  },
  background: {
    primary: "--color-bg-primary",
    secondary: "--color-bg-secondary",
    tertiary: "--color-bg-tertiary",
  },
  chart: {
    targetNormal: "--color-chart-target-normal",
    targetNormalBorder: "--color-chart-target-normal-border",
    targetNormalBorderWidth: "--width-chart-target-normal-border",
    targetWarning: "--color-chart-target-warning",
    targetWarningBorder: "--color-chart-target-warning-border",
    targetWarningBorderWidth: "--width-chart-target-warning-border",
    actual: "--color-chart-actual",
    actualBorder: "--color-chart-actual-border",
    actualBorderWidth: "--width-chart-actual-border",
    line: "--color-chart-line",
    warningLine: "--color-chart-warning-line",
    labelDefault: "--color-chart-label-default",
    labelWarning: "--color-chart-label-warning",
  },
  kpiCard: {
    defaultBorder: "--color-kpi-card-default-border",
    defaultValue: "--color-kpi-card-default-value",
    goodValue: "--color-kpi-card-good-value",
    warningValue: "--color-kpi-card-warning-value",
    dangerValue: "--color-kpi-card-danger-value",
  },
};

// 扁平化映射，用于快速查找
const FLAT_MAPPING: Record<string, string> = {};
Object.entries(TOKEN_MAPPING).forEach(([category, tokens]) => {
  Object.entries(tokens).forEach(([key, cssVar]) => {
    FLAT_MAPPING[`${category}.${key}`] = cssVar;
  });
});

export default function ColorSystemPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [otherTokens, setOtherTokens] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("brand");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // 初始化加载
  useEffect(() => {
    // 1. 加载颜色配置
    const savedConfig = lsGetJson(LS_KEYS.uiColorSystem) || {};
    const initialConfig: Record<string, string> = {};

    Object.entries(TOKEN_MAPPING).forEach(([category, tokens]) => {
      Object.entries(tokens).forEach(([key, cssVar]) => {
        const fullKey = `${category}.${key}`;
        // @ts-ignore
        const defaultVal = colors[category]?.[key] || "";
        const saveKey = cssVar.replace(/^--color-/, "");
        // @ts-ignore
        initialConfig[fullKey] = savedConfig[saveKey] || defaultVal;
      });
    });
    setConfig(initialConfig);

    // 2. 加载其他 Token (从 Computed Style)
    const computed = getComputedStyle(document.documentElement);
    const loadedOther: Record<string, string> = {};
    Object.entries(OTHER_TOKENS_MAPPING).forEach(([cat, tokens]) => {
      Object.entries(tokens).forEach(([key, info]) => {
        const val = computed.getPropertyValue(info.var).trim();
        loadedOther[`${cat}.${key}`] = val;
      });
    });
    setOtherTokens(loadedOther);
  }, []);

  const handleColorChange = (category: string, key: string, value: string) => {
    const fullKey = `${category}.${key}`;
    const cssVar = TOKEN_MAPPING[category][key];
    setConfig(prev => ({ ...prev, [fullKey]: value }));
    document.documentElement.style.setProperty(cssVar, value);
  };

  const saveConfig = () => {
    const saveObj: Record<string, string> = {};
    Object.entries(config).forEach(([fullKey, value]) => {
      const cssVar = FLAT_MAPPING[fullKey];
      if (cssVar) {
        const saveKey = cssVar.replace(/^--color-/, "");
        saveObj[saveKey] = value;
      }
    });
    lsSetJson(LS_KEYS.uiColorSystem, saveObj);
    alert("配置已保存 (Config Saved)");
  };

  const resetConfig = () => {
    if (!confirm("确定要重置所有颜色配置为默认值吗？(Reset to defaults?)")) return;
    lsSetJson(LS_KEYS.uiColorSystem, {});
    window.location.reload();
  };

  // 导出配置 CSS (带注释)
  const exportCss = () => {
    let cssContent = "";
    Object.entries(TOKEN_MAPPING).forEach(([category, tokens]) => {
      cssContent += `  /* === ${CATEGORY_NAMES[category]} === */\n`;
      Object.entries(tokens).forEach(([key, cssVar]) => {
        const fullKey = `${category}.${key}`;
        const val = config[fullKey];
        const comment = TOKEN_COMMENTS[fullKey] ? ` /* ${TOKEN_COMMENTS[fullKey]} */` : "";
        cssContent += `  ${cssVar}: ${val};${comment}\n`;
      });
      cssContent += "\n";
    });
    
    const content = `:root {\n${cssContent}}`;
    navigator.clipboard.writeText(content);
    alert("CSS 变量已复制 (Copied to clipboard)");
  };

  // 导出配置 JSON (AI 友好格式)
  const exportJson = () => {
    const exportObj: Record<string, any> = {};
    
    Object.entries(TOKEN_MAPPING).forEach(([category, tokens]) => {
      exportObj[category] = {};
      Object.entries(tokens).forEach(([key, cssVar]) => {
        const fullKey = `${category}.${key}`;
        exportObj[category][key] = {
          value: config[fullKey],
          cssVar: cssVar,
          description: TOKEN_COMMENTS[fullKey] || "No description"
        };
      });
    });

    navigator.clipboard.writeText(JSON.stringify(exportObj, null, 2));
    alert("AI 协作配置 JSON 已复制 (AI Context Copied)");
  };

  // 智能复制
  const handleSmartCopy = (description: string, value: string) => {
    const text = `${description}${value}`;
    navigator.clipboard.writeText(text);
    setCopyFeedback(text);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const categories = [...Object.keys(TOKEN_MAPPING), ...Object.keys(OTHER_TOKENS_MAPPING)];

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">配色系统配置</h1>
          <p className="text-slate-500 mt-2">自定义系统颜色，实时生效</p>
        </div>
        <div className="space-x-4 flex items-center">
          <Link 
            href="/color-system/preview"
            className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors font-medium"
          >
            组件预览 (Preview)
          </Link>
          <div className="h-6 w-px bg-slate-300 mx-2"></div>
          <button 
            onClick={resetConfig}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            重置
          </button>
          <button 
            onClick={exportCss}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            导出 CSS
          </button>
          <button 
            onClick={exportJson}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            导出 AI 配置
          </button>
          <button 
            onClick={saveConfig}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-sm"
          >
            保存配置
          </button>
        </div>
      </div>

      {/* 配置区 - 占据剩余高度 */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        {/* Tab 导航 */}
        <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === cat 
                  ? "border-blue-500 text-blue-600 bg-white" 
                  : "border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              {CATEGORY_NAMES[cat] || cat}
            </button>
          ))}
        </div>
        
        {/* 滚动列表区域 */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          {/* 复制反馈提示 */}
          {copyFeedback && (
            <div className="absolute top-4 right-4 z-10 bg-slate-800 text-white px-4 py-2 rounded shadow-lg text-sm flex items-center animate-in fade-in slide-in-from-top-2">
              <span className="mr-2">✨ 已复制:</span>
              <span className="font-mono">{copyFeedback}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* 颜色 Token 渲染 */}
            {TOKEN_MAPPING[activeTab] && Object.entries(TOKEN_MAPPING[activeTab]).map(([key, cssVar]) => {
              const fullKey = `${activeTab}.${key}`;
              const description = TOKEN_COMMENTS[fullKey] || key;
              const value = config[fullKey] || "#ffffff";
              const isColor = !key.toLowerCase().includes('width');
              
              return (
                <div key={key} className="flex items-start space-x-4 p-4 rounded-lg border border-slate-100 hover:border-blue-100 hover:shadow-sm transition-all group">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-inner flex-shrink-0 bg-slate-50 flex items-center justify-center">
                    {isColor ? (
                      <input 
                        type="color" 
                        value={value}
                        onChange={(e) => handleColorChange(activeTab, key, e.target.value)}
                        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 cursor-pointer border-0"
                      />
                    ) : (
                      <span className="text-xs text-slate-400 font-mono">px</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-bold text-slate-700 truncate" title={key}>{key}</div>
                      <button 
                        onClick={() => handleSmartCopy(description, value)}
                        className="text-slate-400 hover:text-blue-600 p-1 transition-opacity"
                        title="智能复制 (Smart Copy)"
                      >
                        <CopyIcon />
                      </button>
                    </div>
                    <div className="text-xs text-slate-500 font-mono truncate mb-1" title={cssVar}>{cssVar}</div>
                    <div className="text-xs text-slate-400 truncate" title={description}>
                      {description || "暂无描述"}
                    </div>
                    <div className="mt-2 flex items-center">
                      <input 
                        type="text" 
                        value={value}
                        onChange={(e) => handleColorChange(activeTab, key, e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded font-mono text-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 非颜色 Token 渲染 */}
            {OTHER_TOKENS_MAPPING[activeTab] && Object.entries(OTHER_TOKENS_MAPPING[activeTab]).map(([key, info]) => {
              const fullKey = `${activeTab}.${key}`;
              const value = otherTokens[fullKey] || "Loading...";
              
              return (
                <div key={key} className="flex items-start space-x-4 p-4 rounded-lg border border-slate-100 hover:border-blue-100 hover:shadow-sm transition-all group">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-bold text-slate-700 truncate" title={key}>{key}</div>
                      <button 
                        onClick={() => handleSmartCopy(info.desc, value)}
                        className="text-slate-400 hover:text-blue-600 p-1 transition-opacity"
                        title="智能复制 (Smart Copy)"
                      >
                        <CopyIcon />
                      </button>
                    </div>
                    <div className="text-xs text-slate-500 font-mono truncate mb-1" title={info.var}>{info.var}</div>
                    <div className="text-xs text-slate-400 truncate" title={info.desc}>
                      {info.desc}
                    </div>
                    <div className="mt-2 flex items-center">
                      <input 
                        type="text" 
                        readOnly
                        value={value}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded font-mono text-slate-500 bg-slate-50 focus:outline-none cursor-text"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
