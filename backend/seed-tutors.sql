-- ============================================================
-- 导师演示数据（幂等，可重复执行）
-- 登录密码统一为：Tutor@123456
-- 用法：docker exec -i manju-postgres-1 psql -U root -d manju_community -f /dev/stdin < seed-tutors.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) 导师账号
INSERT INTO users (email, password_hash, name, role, status, admin_note)
SELECT v.email, crypt('Tutor@123456', gen_salt('bf', 10)), v.name, 'tutor'::user_role, 'active'::account_status, '演示导师数据'
FROM (VALUES
  ('linxiaoman@manju.test', '林小满'),
  ('shenjiu@manju.test', '沈九'),
  ('suwan@manju.test', '苏晚'),
  ('chenmo@manju.test', '陈默'),
  ('zhouyan@manju.test', '周砚'),
  ('huyue@manju.test', '胡玥')
) AS v(email, name)
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.email = v.email);

-- 2) 导师主页资料
INSERT INTO tutor_profiles (user_id, display_name, title, avatar_url, bio_text, tags_json, is_published, is_featured)
SELECT u.id, v.display_name, v.title, v.avatar_url, v.bio_text, v.tags_json::jsonb, v.is_published, v.is_featured
FROM (VALUES
  ('linxiaoman@manju.test', '林小满', '小说改编 / 剧本结构', '/assets/mentor-linxiaoman.png',
   $bio$写了八年网文，转做漫剧剧本改编。擅长把长篇叙事压缩成 60 秒能讲完的钩子，带你把「好看的小说」改成「拍得出来的剧本」。$bio$,
   '["小说改编","剧本结构","节奏设计"]'::jsonb, true, true),
  ('shenjiu@manju.test', '沈九', 'AI 工作流 / 提示词工程', '/assets/mentor-shenjiu.png',
   $bio$重度工具控，把 AI 生成流程拆成了可复用的标准步骤。不讲玄学参数，只讲怎么让每一次生成都不白费。$bio$,
   '["AI 工作流","提示词","效率工具"]'::jsonb, true, true),
  ('suwan@manju.test', '苏晚', '分镜设计 / 镜头语言', '/assets/mentor-suwan.png',
   $bio$做过三年动态漫分镜。擅长用最少的镜头讲清楚一件事，帮你解决「画面很漂亮但看不懂在讲什么」的问题。$bio$,
   '["分镜","镜头语言","动态漫"]'::jsonb, true, true),
  ('chenmo@manju.test', '陈默', '即梦实战 / 角色一致性', '/assets/mentor-chenmo.png',
   $bio$专注即梦 AI 的影像链路，从参考图到成片全程实战。最常被问的问题是角色长得不一样，这里有一套稳定解法。$bio$,
   '["即梦","角色一致性","成片复盘"]'::jsonb, true, true),
  ('zhouyan@manju.test', '周砚', '视觉风格 / 美术方向', '/assets/mentor-zhouyan.png',
   $bio$前广告美术，现在专门给漫剧定视觉基调。帮你从一开始就想清楚这支片子长什么样，而不是边做边撞。$bio$,
   '["视觉风格","美术指导","色彩"]'::jsonb, true, false),
  ('huyue@manju.test', '胡玥', '短视频运营 / 选题拆解', '/assets/mentor-huyue.png',
   $bio$负责过多个百万播放账号。擅长从数据反推选题，让你的漫剧不只做得出来，还能有人看。$bio$,
   '["选题","短视频","数据复盘"]'::jsonb, true, false)
) AS v(email, display_name, title, avatar_url, bio_text, tags_json, is_published, is_featured)
JOIN users u ON u.email = v.email
WHERE NOT EXISTS (SELECT 1 FROM tutor_profiles p WHERE p.user_id = u.id);

-- 3) 导师作品（引用 uploads 卷里的示例图片，缺失时前台会自动隐藏）
INSERT INTO tutor_works (profile_id, type, url, raw_video_url, sort_order)
SELECT p.id, v.type::work_type, v.url, v.raw_video_url, v.sort_order
FROM (VALUES
    ('image', '/uploads/1788330278239-639200877.jpg', NULL, 0),
    ('image', '/uploads/1788330285433-287815110.png', NULL, 1)
) AS v(type, url, raw_video_url, sort_order)
CROSS JOIN users u
JOIN tutor_profiles p ON p.user_id = u.id
WHERE u.email = 'linxiaoman@manju.test'
  AND NOT EXISTS (SELECT 1 FROM tutor_works w WHERE w.profile_id = p.id AND w.url = v.url);

INSERT INTO tutor_works (profile_id, type, url, raw_video_url, sort_order)
SELECT p.id, v.type::work_type, v.url, v.raw_video_url, v.sort_order
FROM (VALUES
    ('image', '/uploads/1788330285433-287815110.png', NULL, 0)
) AS v(type, url, raw_video_url, sort_order)
CROSS JOIN users u
JOIN tutor_profiles p ON p.user_id = u.id
WHERE u.email = 'shenjiu@manju.test'
  AND NOT EXISTS (SELECT 1 FROM tutor_works w WHERE w.profile_id = p.id AND w.url = v.url);

INSERT INTO tutor_works (profile_id, type, url, raw_video_url, sort_order)
SELECT p.id, v.type::work_type, v.url, v.raw_video_url, v.sort_order
FROM (VALUES
    ('image', '/uploads/1788330278239-639200877.jpg', NULL, 0),
    ('video_link', '//player.bilibili.com/player.html?bvid=BV1GJ411x7h7&page=1&high_quality=1', 'https://www.bilibili.com/video/BV1GJ411x7h7', 1)
) AS v(type, url, raw_video_url, sort_order)
CROSS JOIN users u
JOIN tutor_profiles p ON p.user_id = u.id
WHERE u.email = 'suwan@manju.test'
  AND NOT EXISTS (SELECT 1 FROM tutor_works w WHERE w.profile_id = p.id AND w.url = v.url);

INSERT INTO tutor_works (profile_id, type, url, raw_video_url, sort_order)
SELECT p.id, v.type::work_type, v.url, v.raw_video_url, v.sort_order
FROM (VALUES
    ('image', '/uploads/1788330285433-287815110.png', NULL, 0),
    ('image', '/uploads/1788330278239-639200877.jpg', NULL, 1)
) AS v(type, url, raw_video_url, sort_order)
CROSS JOIN users u
JOIN tutor_profiles p ON p.user_id = u.id
WHERE u.email = 'chenmo@manju.test'
  AND NOT EXISTS (SELECT 1 FROM tutor_works w WHERE w.profile_id = p.id AND w.url = v.url);

INSERT INTO tutor_works (profile_id, type, url, raw_video_url, sort_order)
SELECT p.id, v.type::work_type, v.url, v.raw_video_url, v.sort_order
FROM (VALUES
    ('image', '/uploads/1788330278239-639200877.jpg', NULL, 0)
) AS v(type, url, raw_video_url, sort_order)
CROSS JOIN users u
JOIN tutor_profiles p ON p.user_id = u.id
WHERE u.email = 'zhouyan@manju.test'
  AND NOT EXISTS (SELECT 1 FROM tutor_works w WHERE w.profile_id = p.id AND w.url = v.url);
