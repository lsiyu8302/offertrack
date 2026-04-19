# OfferTrack · 我的求职旅程

> 一个为求职者设计的本地看板应用。追踪申请进展、截止日期和面试安排，不遗漏任何机会。

## 功能概览

- **6 列看板**：心愿清单 → 已投递 → 笔试/OA → 面试中 → Offer → 已结束
- **拖拽排序**：卡片可在列之间拖动，支持手动排序
- **紧急提醒**：截止日期 ≤3 天标红，3-7 天标黄，Banner 汇总展示
- **卡片详情**：右侧 Drawer，含时间线、材料清单、备注（失焦自动保存）
- **日历视图**：月历展示所有事件，按紧急程度着色
- **搜索与筛选**：实时搜索公司/岗位，多维度筛选（行业/城市/紧急程度）
- **Offer 对比器**：多维度评分，自动推荐最优 Offer
- **数据导入导出**：本地 JSON 备份，支持覆盖/合并导入

## 设计思考

**为什么是 6 列？**

求职流程天然分为六个阶段：调研收藏、投递简历、笔试、面试、拿 Offer、结束。六列对应现实中的认知模型，减少用户的心智负担。合并或省略任何一列都会导致信息丢失。

**为什么用本地存储？**

求职数据高度敏感（公司、薪资、面试反馈）。不需要账号注册、没有服务器成本、不存在数据泄露风险。浏览器 localStorage 对个人使用完全够用，导出 JSON 可随时备份。

**为什么拒信不用红色？**

红色会放大焦虑感。"已结束"列使用中性灰色（`#94A3B8`），灰色虚线边框区分已关闭的卡片，既清晰区分状态，又不造成视觉压迫。求职本就有压力，界面不应雪上加霜。

**为什么选 0.5px 细边框？**

大量卡片并排时，粗边框会形成视觉噪音。0.5px 边框保持轻量感，让内容本身成为焦点，符合"信息密度优先"的设计目标。

## 技术栈

| 层次 | 技术 |
|------|------|
| 构建 | Vite 8 |
| UI | React 19 + TypeScript |
| 样式 | Tailwind CSS v4（CSS-in-JS inline styles + 少量 Tailwind 工具类） |
| 拖拽 | @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities |
| 日期 | date-fns v3 |
| ID | nanoid |
| 持久化 | localStorage（带 300ms debounce） |

## 本地运行

```bash
# 克隆仓库
git clone <repo-url>
cd offertrack

# 安装依赖
npm install

# 启动开发服务器（支持热更新）
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

开发服务器默认运行在 http://localhost:5173

## 部署到 Vercel

### 一键部署

点击按钮直接部署到 Vercel（需要 GitHub 账号）：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/OfferTrack&project-name=offertrack&repository-name=OfferTrack)

### 手动部署步骤

**方式 1：使用 Vercel CLI**

```bash
npm i -g vercel
cd offertrack
vercel
```

**方式 2：连接 GitHub 仓库**

1. 推送代码到 GitHub
   ```bash
   git add .
   git commit -m "feat: complete offertrack development"
   git push origin main
   ```

2. 在 [vercel.com](https://vercel.com) 新增项目
   - 点击 "Add New" → "Project"
   - 选择 "Import Git Repository"
   - 连接 GitHub 账号，搜索并选择 OfferTrack 仓库

3. 配置构建设置
   - **Framework Preset**: Vite
   - **Root Directory**: ./offertrack（如果 vercel.json 在此目录）
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. 环境变量（可选）
   - 此项目无需环境变量（所有数据存储在本地 localStorage）

5. 点击 "Deploy"

### 获取线上链接

部署完成后，Vercel 会分配一个域名，如 `https://offertrack.vercel.app`

访问该链接即可看到完整的看板应用。数据会存储在你的本地浏览器中，无需后端。

### 自定义域名

在 Vercel 项目设置中：
- Settings → Domains
- 添加自定义域名
- 按照说明配置 DNS 解析

---
## 目录结构

```
offertrack/src/
├── components/
│   ├── Board/           # 看板（Board、Column、JobCard、拖拽相关）
│   ├── CalendarView/    # 月历视图
│   ├── Card/            # JobCard 组件
│   ├── CardDetailDrawer/# 卡片详情抽屉
│   ├── FilterPanel/     # 筛选面板
│   ├── NewJobModal/     # 新增/编辑弹窗
│   ├── OfferComparator/ # Offer 对比器
│   ├── StatsBar/        # 数据概览条
│   ├── UrgentBanner/    # 紧急事项 Banner
│   └── shared/          # Header、Layout、SearchInput、SettingsMenu、Onboarding
├── hooks/
│   ├── useJobs.ts       # 申请数据 CRUD
│   ├── useSettings.ts   # 视图、排序、维度设置
│   └── useLocalStorage.ts
├── lib/
│   ├── constants.ts     # 列配置、行业标签、存储键
│   ├── sorting.ts       # 智能排序逻辑
│   ├── urgency.ts       # 紧急程度计算
│   └── sampleData.ts    # 示例数据
├── types/index.ts       # TypeScript 类型定义
├── App.tsx
└── index.css
```

## 已知问题

- Mobile 视图（<768px）目前以水平滚动看板为主，单列切换器未实现
- 日历视图同一天超过 6 个事件时仅显示前 3 条 + "+N 条"提示
- 拖拽在触屏设备上需要长按 300ms 才能激活（`@dnd-kit` 默认行为）

---

MIT License · 用爱发电，祝你求职顺利 ✦
