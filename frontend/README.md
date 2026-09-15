# 前端应用

React 19 + TypeScript + Vite。生产构建由 Docker 多阶段构建完成，产物交给 Nginx 托管，并把 `/api`、`/uploads` 反向代理到后端。

## 命令

```bash
npm install
npm run dev      # 本地开发（Vite，代理 /api 到 http://localhost:5000）
npm run build    # 类型检查 + 生产构建，输出 dist/
npm run preview  # 预览构建产物
npm run lint     # oxlint
```

## 目录说明

```
src/
├── components/           # 通用组件与弹窗
│   ├── CourseManager.tsx        # 后台课程管理（增删改、上下架）
│   ├── CourseDetailModal.tsx    # 前台课程详情
│   ├── RegistrationDrawer.tsx   # 报名抽屉（提交线索）
│   ├── TutorCard.tsx            # 导师卡片
│   ├── TutorRail.tsx            # 首页精选导师轮播
│   └── TutorProfileModal.tsx    # 导师履历弹窗
├── content/
│   ├── courses.ts               # 课程接口读取 + 静态兜底数据
│   └── coursePrice.ts           # 线索课程价格解析
├── pages/
│   ├── Home.tsx            # 首页（课程矩阵 / 导师 / 战绩 / 案例）
│   ├── Tutors.tsx          # 导师大厅
│   ├── Apply.tsx           # 导师入驻申请
│   ├── Login.tsx           # 登录（导师 / 管理员）
│   ├── AdminDashboard.tsx  # 管理后台（用户 / 线索 / 审核 / 课程）
│   └── TutorWorkspace.tsx  # 导师工作台（线索管理 / 资料配置）
└── index.css               # 全局基础样式（Tailwind 入口）
```

## 视觉规范

全站统一为「纸白底 + 纯黑硬边框 + 荧光黄绿 / 珊瑚红点缀」，后台与前台保持一致，不提供主题切换。

| 用途 | 色值 |
| --- | --- |
| 页面底色 | `#f7f4ec` |
| 文字与边框 | `#101114` |
| 强调色（荧光黄绿） | `#d9ff4f` |
| 强调色（珊瑚红） | `#ff5a45` |
| 次级文字 | `#777871` / `#54564f` |

## 数据来源

- 课程展示内容来自 `GET /api/courses`（由后台「课程管理」维护）；接口不可用时回落到 `src/content/courses.ts` 的内置课程，保证展示页不空白。
- 导师数据来自 `GET /api/tutors` 与 `GET /api/tutors/featured`。
- 静态图片放在 `public/assets/`：导师头像与首页学员案例图。
