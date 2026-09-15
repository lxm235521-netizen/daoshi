# 服务器端 PostgreSQL 部署与数据备份

本目录用于在服务器上部署 PostgreSQL（应用侧连接它），并保留一份可恢复的数据快照。

> 后端**不使用 Redis**（无 redis 依赖、源码零引用），因此这里只部署 PostgreSQL。
> `docker-compose.yml` 不含任何地址与口令，全部由同目录 `.env` 注入。

## 文件说明

| 文件 | 用途 |
| --- | --- |
| `docker-compose.yml` | 服务器端 PostgreSQL 编排（端口 `5433`，与项目约定一致） |
| `.env.example` | 复制为 `.env` 后填入真实凭据 |
| `backup-daoshi-community.sql` | 数据库完整快照（结构 + 数据），可用于重建后恢复 |
| `README.md` | 本文件 |

## 部署

```bash
cd /opt/daoshi-db            # 或任意目录
cp .env.example .env
vi .env                      # 填入真实凭据（见下方「当前部署参数」）
docker compose up -d
docker compose ps            # 期望 postgres 为 healthy
```

## 当前部署参数（服务器上 `.env` 应填写的值）

```env
COMPOSE_PROJECT_NAME=daoshi
POSTGRES_HOST_PORT=5433
POSTGRES_USER=root
POSTGRES_PASSWORD=<服务器数据库口令>
POSTGRES_DB=daoshi_community
```

> `COMPOSE_PROJECT_NAME` 决定数据卷名（`daoshi_postgres_data`）。已经产生数据的机器**不要修改它，也不要改动 `container_name`**，否则 Compose 会识别为新项目而另建空卷，看起来就像数据丢失。

## 恢复数据

目标库需先存在（`POSTGRES_DB` 会自动创建），且**必须先清空已有对象**，否则会因主键/唯一约束冲突报错：

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

然后导入快照：

```bash
docker exec -i daoshi-postgres psql -U root -d daoshi_community -f - < backup-daoshi-community.sql
```

或从外部机器导入：

```bash
PGPASSWORD=<口令> psql -h <服务器IP> -p 5433 -U root -d daoshi_community -f backup-daoshi-community.sql
```

快照不含角色与数据库创建语句，因此目标库与账号必须先存在。

### 导入后建议核对

```sql
SELECT 'users' t, count(*) FROM users
UNION ALL SELECT 'tutor_profiles', count(*) FROM tutor_profiles
UNION ALL SELECT 'tutor_works', count(*) FROM tutor_works
UNION ALL SELECT 'leads', count(*) FROM leads
UNION ALL SELECT 'courses', count(*) FROM courses
UNION ALL SELECT 'audit_requests', count(*) FROM audit_requests;

-- 自增序列必须不小于当前最大 ID，否则新增作品会主键冲突
SELECT last_value FROM tutor_works_id_seq;
SELECT max(id) FROM tutor_works;
```

## 管理员账号

快照中的超级管理员账号为 `admin`。后端每次启动都会把该账号口令重置为项目统一约定值（见 `backend/src/config/migrations.ts`），**首次登录后请立即在后台修改密码**。
