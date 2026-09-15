# 独立部署 PostgreSQL（可选）

本目录只部署 PostgreSQL，适合把它放在与应用服务器不同的机器上。应用服务器使用项目根目录的 Compose 文件。

> 后端**不使用 Redis**（无 redis 依赖、源码零引用），因此本目录与项目默认编排都不部署 Redis。

## 环境变量

Compose 会**自动读取与本文件同级目录下的 `.env`**，不需要额外传 `-e` 或 `--env-file`：

```bash
cd infrastructure
cp .env.example .env
# 编辑 .env 填入真实凭据
docker compose up -d
```

| 变量 | 说明 |
| --- | --- |
| `INTERNAL_BIND` | 监听来源。`127.0.0.1` 仅本机；`0.0.0.0` 允许外部连接 |
| `POSTGRES_HOST_PORT` | 映射到宿主机的端口，默认 `5432` |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | 数据库凭据与库名 |

全部变量都带必填校验：`.env` 缺失或漏填时会直接报错（例如 `required variable POSTGRES_USER is missing a value`），不会静默使用空值。

> **数据卷提醒**：Compose 的项目名决定卷名前缀（如 `<项目名>_postgres_data`）。已经部署过并产生数据的机器，**不要修改 `COMPOSE_PROJECT_NAME` / `-p`，也不要改动 `container_name`**，否则 Compose 会识别为新项目而另建空卷。

> **端口冲突提醒**：如果在同一台机器上同时跑应用的 `docker-compose.yml`，它默认占用宿主机 `5000`、`3002`；本目录默认占用 `5432`，两者不冲突。

## 应用服务器配置

把应用服务器 `.env` 中的连接地址指向本机内网 IP 或域名：

```env
DATABASE_URL=postgresql://用户名:数据库密码@数据库服务器地址:5432/数据库名
```

注意：口令含 `@` 等 URL 保留字符时必须百分号编码，例如 `p@ssw0rd` 要写成 `p%40ssw0rd`。不要填写 `localhost` 或 `postgres`，因为数据库不在应用服务器的 Compose 网络内。

## 安全与数据说明

- 默认 `INTERNAL_BIND=127.0.0.1`；需要跨机器访问时改为 `0.0.0.0`，并**务必**用防火墙或云安全组把 `5432` 限制为只允许应用服务器 IP。
- 数据库端口直接暴露公网风险很高（会遭遇弱口令爆破），除非必要不要开放。
- 本目录的 Compose 文件不含任何地址与口令，凭据只存在于服务器本地 `.env` 中，不会被提交。
- 初始化脚本只在数据卷为空时执行；已有数据卷不会重建表，后续增量结构由后端启动时的运行时迁移自动补齐。
- 数据库结构以 `backend/init.sql` 为唯一来源（本目录通过 `../backend/init.sql` 挂载），不再维护第二份 schema。

## 管理员账号

`backend/init.sql` 会写入一个超级管理员，账号为 `admin`。后端启动时会将该账号口令重置为项目统一约定值（见 `backend/src/config/migrations.ts`），**首次登录后请立即在后台修改密码**。
