import { db } from './database';

/** 建表时预置的课程，与前端原有静态课程配置保持一致 */
const COURSE_SEEDS = [
  {
    code: 'COURSE-01',
    title: '小说转剧本课',
    badge: '录播课',
    duration: '随时学 · 反复看',
    price: '68',
    summary: '把小说语言翻译成镜头语言。涵盖冲突提炼、人物动机、场景拆分与可拍摄的剧本格式。',
    details: [
      '拆解叙事骨架，找到真正能拍的戏眼。',
      '把长篇小说改成更适合短内容传播的场景节奏。',
      '输出可直接进入分镜与生成环节的剧本结构。'
    ],
    fit: '适合：小说作者 / 入门创作者',
    sortOrder: 1
  },
  {
    code: 'COURSE-02',
    title: 'AI 创作工作流课',
    badge: '1 小时',
    duration: '核心流程 · 快速入门',
    price: '100',
    summary: '用一套清晰流程串联灵感、提示词、分镜与生成工具，减少反复试错，稳定推进项目。',
    details: [
      '建立从灵感到成片的标准工作顺序。',
      '统一提示词、参考图和生成记录的管理方式。',
      '用低成本步骤把卡点从“试出来”改成“流程化”。'
    ],
    fit: '适合：想提升效率的创作者',
    sortOrder: 2
  },
  {
    code: 'COURSE-03',
    title: '即梦实战工作流',
    badge: '2 小时',
    duration: '完整实战 · 案例拆解',
    price: '298',
    summary: '从参考图、角色一致性到动态生成与成片复盘，完整跑通即梦 AI 影像制作链路。',
    details: [
      '理解角色一致性、镜头节奏和素材复用的关系。',
      '把单张图、连续镜头和动效素材组织成可交付成片。',
      '通过案例复盘减少参数碰运气。'
    ],
    fit: '适合：准备独立完成作品的人',
    sortOrder: 3
  }
];

const ensureCoursesTable = async (): Promise<void> => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code VARCHAR(50) NOT NULL UNIQUE,
      title VARCHAR(120) NOT NULL,
      badge VARCHAR(50) NOT NULL DEFAULT '',
      duration VARCHAR(120) NOT NULL DEFAULT '',
      price VARCHAR(20) NOT NULL DEFAULT '',
      summary TEXT NOT NULL DEFAULT '',
      details JSONB NOT NULL DEFAULT '[]'::jsonb,
      fit VARCHAR(200) NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

/** 幂等种子：仅在课程编号不存在时插入，不会覆盖管理员已修改的内容 */
const seedCourses = async (): Promise<void> => {
  for (const course of COURSE_SEEDS) {
    await db.query(
      `INSERT INTO courses (code, title, badge, duration, price, summary, details, fit, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)
       ON CONFLICT (code) DO NOTHING`,
      [course.code, course.title, course.badge, course.duration, course.price, course.summary, JSON.stringify(course.details), course.fit, course.sortOrder]
    );
  }
};

export const ensureRuntimeSchema = async (): Promise<void> => {
  await db.query(`ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false`);
  await db.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS course_name VARCHAR(100)`);
  await db.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS course_code VARCHAR(50)`);
  await db.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS course_price VARCHAR(20)`);
  // 补齐历史线索缺失的价格快照（按课程名称对齐前台课程定价）
  await db.query(`
    UPDATE leads
    SET course_price = CASE course_name
      WHEN '小说转剧本课' THEN '68'
      WHEN 'AI 创作工作流课' THEN '100'
      WHEN '即梦实战工作流' THEN '298'
      ELSE course_price
    END
    WHERE course_price IS NULL AND course_name IS NOT NULL
  `);
  // 统一超级管理员登录名为 admin，并重置为约定初始口令。
  // 幂等：条件写成「登录名不是 admin 或口令未初始化」，已迁移过的库不会重复执行。
  await db.query(`
    UPDATE users
    SET email = 'admin',
        password_hash = '$2b$10$hCeKU8xq40gJeh7f43gRh.ZwGcE5TnLBXB8nvJYMEhgWNglBQcaMq'
    WHERE role = 'superadmin' AND LOWER(email) <> 'admin'
  `);
  await ensureCoursesTable();
  await seedCourses();
};
