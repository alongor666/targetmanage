import { Suspense } from "react";
import OrgDetailClient from "./OrgDetailClient";
import type { Org } from "@/schemas/types";
import { loadOrgs } from "@/services/loaders";

/**
 * 生成静态参数，用于静态导出时预渲染所有机构页面
 */
export async function generateStaticParams() {
  try {
    const { orgs } = await loadOrgs();
    return orgs.map((org: Org) => ({
      org_id: org.org_id,
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    // 返回一些默认参数，避免构建失败
    return [
      { org_id: 'default' }
    ];
  }
}

interface OrgPageProps {
  params: { org_id: string };
}

export default function OrgPage({ params }: OrgPageProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <Suspense fallback={<div className="text-sm text-slate-600">正在加载机构详情…</div>}>
        <OrgDetailClient orgId={params.org_id} />
      </Suspense>
    </div>
  );
}