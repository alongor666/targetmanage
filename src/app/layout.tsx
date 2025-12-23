import "./globals.css";

export const metadata = {
  title: "2026 目标管理可视化",
  description: "同城/异地 + 分产品 + 月/季/年目标与进度",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-white text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">2026 目标管理可视化</h1>
              <p className="text-sm text-slate-600">同城/异地 · 分产品 · 月/季/年 · 双时间进度</p>
            </div>
            <nav className="text-sm text-slate-600">
              <a className="mr-4 hover:underline" href="/">总览</a>
              <a className="mr-4 hover:underline" href="/orgs">机构</a>
              <a className="mr-4 hover:underline" href="/rules">权重规则</a>
              <a className="mr-4 hover:underline" href="/import">导入</a>
              <a className="hover:underline" href="/data">数据</a>
            </nav>
          </header>
          {children}
          <footer className="mt-10 border-t pt-4 text-xs text-slate-500">
            数据文件：public/data（开发期） · 口径：docs（唯一依据）
          </footer>
        </div>
      </body>
    </html>
  );
}
