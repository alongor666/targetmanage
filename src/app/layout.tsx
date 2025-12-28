import "./globals.css";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/v2/Navbar";

// 动态导入 ColorSystemHydrator，禁用 SSR 避免水合错误
const ColorSystemHydrator = dynamic(
  () => import("@/components/system/ColorSystemHydrator").then(mod => ({ default: mod.ColorSystemHydrator })),
  { ssr: false }
);

export const metadata = {
  title: "保费目标管理系统",
  description: "保费目标管理与可视化分析",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-white text-slate-900">
        <ColorSystemHydrator />
        <Navbar
          title="保费目标管理系统"
          links={[
            { label: "首页", href: "/" },
            { label: "数据管理", href: "/data" },
            { label: "导入数据", href: "/import" },
            { label: "规则配置", href: "/rules" },
            { label: "已赚保费预测", href: "/earned-premium" },
            { label: "配色", href: "/color-system" },
          ]}
        />
        <div className="mx-auto max-w-7xl px-4 py-6">
          {children}
          <footer className="mt-10 border-t pt-4 text-xs text-slate-500">
            数据文件：public/data（开发期） · 口径：docs（唯一依据）
          </footer>
        </div>
      </body>
    </html>
  );
}
