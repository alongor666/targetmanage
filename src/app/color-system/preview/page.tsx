"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { KpiCard } from "@/components/kpi/KpiCard";

export default function ColorSystemPreviewPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">组件预览</h1>
          <p className="text-slate-500 mt-2">查看当前配色方案在各组件上的实际效果</p>
        </div>
        <div>
          <Link 
            href="/color-system"
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            返回配置
          </Link>
        </div>
      </div>

      <div className="space-y-12">
        {/* 组件预览：KPI卡片 */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">KPI 指标卡片</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KpiCard 
              title="总保费达成率 (正常)"
              value="98.5%"
              hint="差额: -120万"
              variant="default"
            />
            <KpiCard 
              title="车险增速 (预警)"
              value="2.1%"
              hint="目标: 5.0%"
              variant="warning"
            />
            <KpiCard 
              title="非车占比 (危险)"
              value="15.2%"
              hint="目标: 20%"
              variant="danger"
            />
             <KpiCard 
              title="综合成本率 (优秀)"
              value="95.2%"
              hint="目标: 98%"
              variant="good"
            />
          </div>
        </section>

        {/* 组件预览：徽章 */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">状态徽章 (Badge)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500">实心样式 (Solid)</h3>
              <div className="flex flex-wrap gap-4">
                <Badge variant="default">默认 Default</Badge>
                <Badge variant="good">优秀 Good</Badge>
                <Badge variant="warning">预警 Warning</Badge>
                <Badge variant="danger">危险 Danger</Badge>
                <Badge variant="info">信息 Info</Badge>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500">描边样式 (Outline)</h3>
              <div className="flex flex-wrap gap-4">
                <Badge variant="default" outline>默认 Default</Badge>
                <Badge variant="good" outline>优秀 Good</Badge>
                <Badge variant="warning" outline>预警 Warning</Badge>
                <Badge variant="danger" outline>危险 Danger</Badge>
                <Badge variant="info" outline>信息 Info</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500">不同尺寸</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Badge size="sm" variant="good">Small</Badge>
                <Badge size="md" variant="good">Medium</Badge>
                <Badge size="lg" variant="good">Large</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* 基础排版预览 */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">排版与颜色 (Typography)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>一级标题 H1</h1>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>二级标题 H2</h2>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>三级标题 H3</h3>
              <p style={{ color: 'var(--text-primary)' }}>
                这是主要文本 (Primary Text)。用于正文内容，阅读体验最舒适的颜色。
                <span style={{ color: 'var(--primary-red)' }}> 品牌主色 (Primary Red) </span>
                和
                <span style={{ color: 'var(--tesla-blue)' }}> 品牌辅色 (Tesla Blue) </span>
                用于强调。
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                这是次要文本 (Secondary Text)。用于辅助说明、标签或不那么重要的信息。
              </p>
              <p style={{ color: 'var(--text-muted)' }}>
                这是静默文本 (Muted Text)。用于提示占位符或禁用状态。
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-primary)' }}>
                背景 Primary + 边框 Light
              </div>
              <div className="p-4 rounded border" style={{ borderColor: 'var(--border-medium)', backgroundColor: 'var(--bg-secondary)' }}>
                背景 Secondary + 边框 Medium
              </div>
              <div className="p-4 rounded border" style={{ borderColor: 'var(--border-dark)', backgroundColor: 'var(--bg-tertiary)' }}>
                背景 Tertiary + 边框 Dark
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
