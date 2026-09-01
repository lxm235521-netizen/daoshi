# 漫剧导师库

## Docker 一键部署

1. 复制环境变量模板并按服务器实际情况修改：

   ```powershell
   Copy-Item .env.example .env
   ```

2. 在外部 PostgreSQL 服务器上提前创建数据库，并执行一次初始化脚本：

   ```powershell
   psql "postgresql://用户名:密码@数据库服务器地址:5432/数据库名" -f backend/init.sql
   ```

   同时确认部署服务器可以访问外部 PostgreSQL 的 `5432` 端口和 Redis 的 `6379` 端口；如果外部服务使用其他端口，请在 `.env` 的连接地址中填写实际端口。

3. 启动前端和后端服务：

   ```powershell
   docker compose up -d --build
   ```

4. 查看启动状态：

   ```powershell
   docker compose ps
   docker compose logs -f backend
   ```

5. 浏览器访问 `http://服务器地址:3002`；后端固定监听 `5000` 端口。

停止服务：

```powershell
docker compose down
```

本 Compose 文件只启动前端和后端，数据库与 Redis 由其他服务器独立部署。导师上传的图片使用 Docker 数据卷 `uploads` 持久化。

生产环境请务必在 `.env` 中填写外部 PostgreSQL 和 Redis 的实际地址、端口、账号密码，并修改 `JWT_SECRET`。不要把外部服务地址写成 `localhost` 或 Compose 服务名；应填写数据库和 Redis 所在服务器的可访问 IP 或域名。
