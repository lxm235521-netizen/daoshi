# 漫剧导师平台

面向小说作者、短视频创作者和 AI 新手的漫剧课程展示与导师转化平台。包含前台展示站、学员报名线索池、导师工作台和管理后台。

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | React 19 + TypeScript + Vite + Tailwind CSS + framer-motion |
| 后端 | Node.js + Express 5 + TypeScript + pg |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose + Nginx |

## 目录结构

```
.
├── backend/                 # API 服务
│   ├── src/
│   │   ├── config/          # 数据库连接、启动期 schema 迁移
│   │   ├── controllers/     # 业务控制器（认证/用户/线索/导师/课程/上传）
│   │   ├── middlewares/     # JWT 鉴权、文件上传
│   │   └── index.ts         # 路由注册与启动入口
│   ├── init.sql             # 数据库结构（唯一 schema 来源）
│   ├── seed-tutors.sql      # 导师演示数据（幂等，可重复执行）
│   └── uploads/             # 上传文件（Docker 卷持久化）
├── frontend/                # 前端应用
│   ├── public/assets/       # 静态图片（导师头像、学员案例）
│   └── src/
│       ├── components/      # 通用组件与弹窗
│       ├── content/         # 课程静态兜底配置、价格解析
│       └── pages/           # 页面（首页/导师大厅/报名/登录/后台/导师工作台）
├── infrastructure/          # 独立部署 PostgreSQL（可选，见目录内 README）
├── deploy/db-server/        # 服务器端数据库编排与数据快照
├── docker-compose.yml       # 应用部署（后端 + 前端）
└── .env.example             # 环境变量模板
```

## 快速开始

1. 复制环境变量模板并修改密码：

   ```powershell
   Copy-Item .env.example .env
   ```

   必须修改 `.env` 中的 `POSTGRES_PASSWORD` 与 `JWT_SECRET`，并同步 `DATABASE_URL` 里的密码。

2. 启动全部服务：

   ```powershell
   docker compose up -d --build
   ```

3. 访问 `http://服务器地址:3002`。

停止服务：

```powershell
docker compose down
```

前端通过 Nginx 将 `/api` 与 `/uploads` 反向代理到后端。上传文件使用 Docker 卷 `uploads` 持久化，数据库使用 `postgres_data` 持久化。

图片上传的权限划分：

| 接口 | 权限 | 用途 |
| --- | --- | --- |
| `POST /api/upload` | 需登录（管理员 / 导师） | 后台编辑导师资料、导师工作台 |
| `POST /api/tutor/upload` | 需登录（仅导师） | 导师工作台 |
| `POST /api/tutors/apply` | 公开（入驻申请） | 申请页头像随表单一起以 multipart 提交 |

> 后端**不使用 Redis**（无相关依赖、源码零引用），因此默认不部署 Redis。

## 初始化与演示数据

`backend/init.sql` 只在数据卷为空时执行一次。已经有数据卷时，重启不会重建表；项目**每次启动都会自动补齐增量结构**（见 `backend/src/config/migrations.ts`），因此升级不需要手动迁移。

需要一批导师演示数据时执行：

```bash
docker exec -i manju-postgres-1 psql -U root -d manju_community -f /dev/stdin < backend/seed-tutors.sql
```

脚本按邮箱判重，可重复执行。开通的账号统一密码为 `Tutor@123456`，邮箱域名 `@manju.test`，后台备注为「演示导师数据」，便于识别与清理。

## 本地开发

```powershell
# 后端（默认 5000 端口）
cd backend
npm install
npm run dev

# 前端（Vite 开发服务器，代理 /api 到后端）
cd frontend
npm install
npm run dev
```

构建校验：

```powershell
cd backend;  npx tsc --noEmit     # 后端类型检查
cd frontend; npm run build        # 前端类型检查 + 产物构建
```

## 外部数据库部署

如果 PostgreSQL 部署在另一台服务器，使用 `infrastructure/` 或 `deploy/db-server/` 目录的 Compose 文件：

```bash
cd deploy/db-server
cp .env.example .env     # 固定 Compose 项目名（决定数据卷前缀）
docker compose up -d
```

应用服务器的 `.env` 改成外部地址：

```env
DATABASE_URL=postgresql://用户名:密码@数据库服务器地址:5433/数据库名
```

口令含 `@` 等保留字符时必须百分号编码（例如 `p@ssw0rd` → `p%40ssw0rd`）。外部模式下 schema 由后端启动时的运行时迁移自动补齐，**不要在 `.env` 中填写 `localhost` 或 `postgres`**。

数据备份与恢复步骤见 `deploy/db-server/README.md`。

## 安全提示

生产环境务必修改 `.env` 中所有默认密码与 `JWT_SECRET`，并且不要提交 `.env`（已在 `.gitignore` 中排除，仅保留 `.env.example`）。
