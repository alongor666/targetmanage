
🎨 1. 设计风格定位
设计语言： 现代化企业级数据可视化仪表板
核心理念： 清晰、专业、高效的数据交互体验
视觉风格： 极简主义 + 功能优先 + 数据驱动

🎯 2. 色彩系统规范
主色系
主蓝色（Primary Blue）：#007BFF

用途：激活状态、主要按钮、图表主色、导航栏
附加：浅蓝背景 #E6F0FF
成功绿色（Success）：#28A745

用途：达成率、正向增长、完成状态
警告黄色（Warning）：#FFC107

用途：风险提示、中等进度
危险红色（Danger）：#DC3545

用途：负向增长、未达标
背景色系
主背景：#F8FAFC
卡片背景：#FFFFFF
分隔线：#E9ECEF
悬停/交互：#F8FAFC
文字色系
主标题/高亮：#343A40
副标题/标签：#6C757D
辅助文字：#ADB5BD
📐 3. 布局结构规范
整体布局
固定顶部导航栏：高度 64px，宽度 100%
内容区域：左侧固定 sidebar（240px）+ 右侧流体内容区
网格系统：4-column 响应式网格，间距 20px
主要模块分布
顶部导航区（64px）
筛选控制区（32px + 动态高度）
KPI卡片区（4列网格）
图表展示区（2列网格）
数据表格区（全宽）
间距系统
卡片内边距：24px
模块间垂直间距：28px
网格列间距：20px
元素间间距：8px - 16px
🎨 4. 组件规范
4.1 顶部导航栏
高度：64px
背景：#FFFFFF
左边距：24px
右边距：24px
导航链接：
普通状态：#6C757D
激活状态：#007BFF + font-weight: 600
高度：32px
4.2 筛选控制区
背景：#F8FAFC

内边距：16px

下拉框：

背景：#F8FAFC
边框：1px solid #E9ECEF
圆角：4px
高度：36px
文字：14px, #6C757D
下拉箭头：12px
筛选标签：

背景：#E9ECEF
圆角：4px
内边距：8px 12px
4.3 KPI 卡片（4列）
背景：#FFFFFF
圆角：8px
内边距：24px
阴影：box-shadow: 0 2px 4px rgba(0,0,0,0.05)
图标：
尺寸：24px × 24px
背景：对应状态色的圆角背景
数字展示：
大数：36px, font-weight: 700, #343A40
小数：14px, font-weight: 400, #6C757D
进度条：
高度：4px
圆角：2px
背景：#E9ECEF
进度：对应状态色
4.4 图表组件
背景：#FFFFFF
圆角：8px
内边距：24px
坐标轴：
标签：12px, #ADB5BD
线条：1px solid #E9ECEF
柱状图：
2026规划：#007BFF
2025实际：#6C757D
折线图：
主线：#368DCC（亮蓝色）
辅线：#F7B500（橙色虚线）
4.5 数据表格
表头：
背景：#F8FAFC
文字：14px, font-weight: 600, #343A40
表格行：
背景：#FFFFFF / #F8FAFC（交替）
底边框：1px solid #E9ECEF
悬停：背景色变化为 #F8FAFC
状态标签：
背景：半透明色块
圆角：12px
内边距：4px 8px
📝 5. 交互状态规范
按钮状态
默认：背景色 + 边框
悬停：背景色加深 10%
激活：背景色 #0069D9
禁用：背景色 #E9ECEF，文字灰色
下拉框状态
默认：背景 #F8FAFC，边框 #E9ECEF
聚焦：边框 #007BFF，阴影增强
展开：下拉菜单背景 #FFFFFF，边框 #E9ECEF
卡片状态
默认：阴影 0 2px 4px rgba(0,0,0,0.05)
悬停：阴影增强 0 4px 12px rgba(0,0,0,0.08)
🎨 6. 动效规范
页面加载
卡片：从底部上滑动画（0.3s）
图表：数据填充动画（0.5s ease-out）
交互反馈
按钮点击：轻微缩放（scale: 0.98）+ 阴影变化
下拉展开：高度渐变动画（0.2s）
表格排序：箭头旋转动画（0.2s）
📱 7. 响应式设计规范
桌面端（≥1024px）
4列 KPI 卡片
2列 图表区域
完整表格
平板端（768px - 1023px）
KPI 卡片：2列堆叠
图表区域：1列垂直排列
表格：横向滚动
移动端（<768px）
KPI 卡片：单列垂直排列
图表区域：单列垂直排列
表格：简化为关键指标 + 横向滚动
📐 8. 具体尺寸规范
字体尺寸
H1（页面标题）：24px, font-weight: 600
H2（模块标题）：18px, font-weight: 600
H3（子标题）：16px, font-weight: 500
正文：14px, font-weight: 400
小字/百分比：12px
大数（KPI）：3, font-weight: 700
圆角
卡片：8px
按钮：4px
输入框：4px
状态标签：12px
阴影
卡片阴影：0 2px 4px rgba(0,0,0,0.05)
悬停阴影：0 4px 12px rgba(0,0,0,0.08)
🎨 9. 状态色块规范
成功状态
标签背景：rgba(38,186,104,0.1)
标签文字：#26BA68
警告状态
标签背景：rgba(255,193,7,0.1)
标签文字：#FFC107
危险状态
标签背景：标签背景**：rgba(220,53,69,0.1)
标签文字：#DC3545
信息状态
标签背景：rgba(54,144,204,0.1)
标签文字：#368DCC
📊 10. 具体组件示例
10.1 KPI 卡片示例
.kpi-card {
  background: #FFFFFF;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.kpi-title {
  font-size: 14px;
  font-weight: 500;
  color: #6C757D;
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 36px;
  font-weight: 700;
  color: #343A40;
  margin-bottom: 8px;
}

.progress-bar {
  height: 4px;
  border-radius: 2px;
  background: #E9ECEF;
}

.progress-fill {
  height: 100%;
  border-radius: 2px 0 0 2px;
  background: #007BFF;
}
10.2 下拉框示例
.dropdown {
  background: #F8FAFC;
  border: 1px solid #E9ECEF;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #6C757D;
  height: 36px;
}

.dropdown:hover {
  border-color: #007BFF;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.08);
}