-- PostgreSQL 建表脚本

-- 1. 账号基础表 (users)
CREATE TYPE user_role AS ENUM ('superadmin', 'manager', 'tutor');
CREATE TYPE account_status AS ENUM ('active', 'disabled');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(50) NOT NULL,
  role user_role NOT NULL DEFAULT 'tutor',
  status account_status NOT NULL DEFAULT 'active',
  admin_note VARCHAR(255),
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 导师主页公开资料表 (tutor_profiles)
CREATE TABLE tutor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500),
  bio_text TEXT,
  tags_json JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 导师作品媒体库 (tutor_works)
CREATE TYPE work_type AS ENUM ('image', 'video_link');

CREATE TABLE tutor_works (
  id SERIAL PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
  type work_type NOT NULL,
  url VARCHAR(500) NOT NULL,
  raw_video_url VARCHAR(500),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 资料修改审核草稿表 (audit_requests)
CREATE TYPE request_type AS ENUM ('first_publish', 'profile_update');
CREATE TYPE audit_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE audit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type request_type NOT NULL,
  draft_json JSONB NOT NULL,
  status audit_status NOT NULL DEFAULT 'pending',
  reject_reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- 5. 学员线索 CRM 表 (leads)
CREATE TYPE lead_global_status AS ENUM ('pending', 'assigned', 'rejected');
CREATE TYPE tutor_process_status AS ENUM ('todo', 'doing', 'done');

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wechat_qq VARCHAR(100) NOT NULL,
  level VARCHAR(20) NOT NULL,
  learning_request TEXT NOT NULL,
  time_note VARCHAR(100),
  intent_tutor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  status lead_global_status NOT NULL DEFAULT 'pending',
  assigned_tutor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tutor_status tutor_process_status DEFAULT 'todo',
  tutor_note VARCHAR(255),
  
  assigned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 自动更新 updated_at 触发器函数
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加更新触发器
CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_tutor_profiles BEFORE UPDATE ON tutor_profiles FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_leads BEFORE UPDATE ON leads FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- 插入一条初始的超级管理员数据 (密码为 Admin@123 的 Bcrypt 加密串)
INSERT INTO users (id, email, password_hash, name, role, status, admin_note) 
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@system.com', '$2a$10$tZ8nLq3d.lB0eGZcM8Gq/OfT7yv7Z6vQ6h9pI1jY4uK1qD/Q6F9.S', '超级管理员', 'superadmin', 'active', '系统初始化生成');
