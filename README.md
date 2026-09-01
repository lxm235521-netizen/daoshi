# 漫剧导师库

## Docker 一键部署

1. 复制环境变量模板并按服务器实际情况修改：

   ```powershell
   Copy-Item .env.example .env
   ```

2. 启动全部服务：

   ```powershell
   docker compose up -d --build
   ```

3. 查看启动状态：

   ```powershell
   docker compose ps
   docker compose logs -f backend
   ```

4. 浏览器访问 `.env` 中 `WEB_PORT` 对应的端口，默认是 `http://localhost:3002`。

停止服务：

```powershell
docker compose down
```

数据库、Redis 和导师上传的图片均使用 Docker 数据卷持久化。首次启动 PostgreSQL 时会自动执行 `backend/init.sql`；已有数据库卷不会重复执行初始化脚本。

生产环境请务必修改 `POSTGRES_PASSWORD` 和 `JWT_SECRET`，并同步修改 `DATABASE_URL` 中的数据库密码。容器内部数据库地址必须使用 `postgres:5432`，Redis 地址使用 `redis:6379`，不要改成 `localhost`。
