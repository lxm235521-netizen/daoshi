import { Request, Response } from 'express';
import { db } from '../config/database';
import { AuthRequest } from '../middlewares/auth';

import bcrypt from 'bcryptjs';

const normalizeTags = (tags: unknown): string[] => {
  const values = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',') : [];
  return [...new Set(values
    .filter((tag): tag is string => typeof tag === 'string')
    .map(tag => tag.trim())
    .filter(Boolean)
    .filter(tag => tag !== '新人入驻'))];
};

export const checkEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: '请输入有效的邮箱地址' });
      return;
    }
    const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = $1', [email]);
    if (existing.rows.length > 0) {
      res.status(400).json({ error: '该邮箱已被注册或正在审核中' });
      return;
    }
    res.json({ message: '邮箱可用' });
  } catch (error) {
    res.status(500).json({ error: '校验失败' });
  }
};

export const applyTutor = async (req: Request, res: Response): Promise<void> => {
  const client = await db.connect();
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const { password, name, title, avatar, bio } = req.body;
    if (!email || !password || password.length < 6 || !name || !title) {
      res.status(400).json({ error: '请完整填写邮箱、密码、昵称和头衔' });
      return;
    }
    
    const existing = await client.query('SELECT id FROM users WHERE LOWER(email) = $1', [email]);
    if (existing.rows.length > 0) {
      res.status(400).json({ error: '该邮箱已被注册或正在审核中' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash(password || 'Tutor@123', salt);

    await client.query('BEGIN');
    const userRes = await client.query(
      `INSERT INTO users (email, password_hash, name, role, status) VALUES ($1, $2, $3, 'tutor', 'disabled') RETURNING id`,
      [email, pwd, name]
    );
    const newUserId = userRes.rows[0].id;

    const draftJson = {
      name,
      title,
      bio: bio || '这是我的入驻申请',
      avatar: avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      tags: ['新人入驻'],
      works: []
    };
    await client.query(
      `INSERT INTO audit_requests (user_id, type, draft_json) VALUES ($1, 'first_publish', $2)`,
      [newUserId, JSON.stringify(draftJson)]
    );
    await client.query('COMMIT');
    res.json({ message: '申请成功' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('申请入驻失败', error);
    res.status(500).json({ error: '申请入驻失败' });
  } finally {
    client.release();
  }
};


// 游客获取公开展示的导师列表
export const getPublishedTutors = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(`
      SELECT p.user_id as id, p.display_name as name, p.title, p.avatar_url as avatar, p.bio_text as bio, p.tags_json as tags, p.is_featured,
             COALESCE(
               json_agg(json_build_object('type', CASE WHEN w.type::text = 'video_link' THEN 'video' ELSE 'image' END, 'url', w.url, 'raw', w.raw_video_url)) 
               FILTER (WHERE w.id IS NOT NULL), '[]'
             ) as works
      FROM tutor_profiles p
      LEFT JOIN tutor_works w ON p.id = w.profile_id
      WHERE p.is_published = true
      GROUP BY p.id, p.user_id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('获取导师大厅数据失败', error);
    res.status(500).json({ error: '获取导师大厅数据失败' });
  }
};

export const getFeaturedTutors = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(`
      SELECT p.user_id as id, p.display_name as name, p.title, p.avatar_url as avatar, p.bio_text as bio, p.tags_json as tags, p.is_featured,
             COALESCE(
               json_agg(json_build_object('type', CASE WHEN w.type::text = 'video_link' THEN 'video' ELSE 'image' END, 'url', w.url, 'raw', w.raw_video_url))
               FILTER (WHERE w.id IS NOT NULL), '[]'
             ) as works
      FROM tutor_profiles p
      LEFT JOIN tutor_works w ON p.id = w.profile_id
      WHERE p.is_published = true AND p.is_featured = true
      GROUP BY p.id, p.user_id
      ORDER BY p.updated_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('获取精选导师失败', error);
    res.status(500).json({ error: '获取精选导师失败' });
  }
};

export const getTutorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tutorId = req.user?.id;
    const result = await db.query(`
      SELECT u.id, u.name AS account_name, u.email,
             p.display_name AS name, p.title, p.avatar_url AS avatar,
             p.bio_text AS bio, p.tags_json AS tags, p.is_published,
             COALESCE(
               json_agg(json_build_object(
                 'type', CASE WHEN w.type::text = 'video_link' THEN 'video' ELSE 'image' END,
                 'url', w.url,
                 'raw', w.raw_video_url
               ) ORDER BY w.sort_order, w.id) FILTER (WHERE w.id IS NOT NULL), '[]'
             ) AS works
      FROM users u
      LEFT JOIN tutor_profiles p ON p.user_id = u.id
      LEFT JOIN tutor_works w ON w.profile_id = p.id
      WHERE u.id = $1 AND u.role = 'tutor'
      GROUP BY u.id, p.id
    `, [tutorId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: '导师账号不存在' });
      return;
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name || row.account_name || '',
      title: row.title || '',
      avatar: row.avatar || '',
      bio: row.bio || '',
      tags: row.tags || [],
      works: row.works || [],
      isPublished: row.is_published || false,
      email: row.email
    });
  } catch (error) {
    console.error('获取导师资料失败', error);
    res.status(500).json({ error: '获取导师资料失败' });
  }
};

// 导师本人提交修改资料（进草稿箱）
export const submitProfileDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tutorId = req.user?.id;
    const { profileData } = req.body; // 前台传来的全量新资料
    if (!tutorId || !profileData || typeof profileData !== 'object') {
      res.status(400).json({ error: '资料内容不能为空' });
      return;
    }
    
    // 检查是否有挂起的审批
    const pending = await db.query(`SELECT id FROM audit_requests WHERE user_id = $1 AND status = 'pending'`, [tutorId]);
    if (pending.rows.length > 0) {
      res.status(400).json({ error: '您有一条修改正在审核中，请耐心等待' });
      return;
    }

    const checkFirst = await db.query(`SELECT id FROM tutor_profiles WHERE user_id = $1`, [tutorId]);
    const requestType = checkFirst.rows.length === 0 ? 'first_publish' : 'profile_update';
    const normalizedProfileData = {
      ...profileData,
      tags: normalizeTags(profileData.tags)
    };

    await db.query(
      `INSERT INTO audit_requests (user_id, type, draft_json) VALUES ($1, $2, $3)`,
      [tutorId, requestType, JSON.stringify(normalizedProfileData)]
    );

    res.json({ message: '修改已提交，等待管理员审核后生效' });
  } catch (error) {
    res.status(500).json({ error: '提交资料失败' });
  }
};

// 管理员审批通过
export const approveAudit = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await db.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');
    const auditRes = await client.query(`SELECT * FROM audit_requests WHERE id = $1 AND status = 'pending' FOR UPDATE`, [id]);
    if (auditRes.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: '未找到该审核单' });
      return;
    }

    const audit = auditRes.rows[0];
    const draft = audit.draft_json; // 这里应该是 profile, tags, works 等数据的整合
    const tags = normalizeTags(draft.tags);

    const isFirstApplication = audit.type === 'first_publish';
    if (isFirstApplication) {
      await client.query(`UPDATE users SET status = 'active' WHERE id = $1`, [audit.user_id]);
    }

    // 初次入驻审核只建立资料，不直接发布到展示页；后续资料审核才发布
    const profileRes = await client.query(
      `INSERT INTO tutor_profiles (user_id, display_name, title, avatar_url, bio_text, tags_json, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         title = EXCLUDED.title,
         avatar_url = EXCLUDED.avatar_url,
         bio_text = EXCLUDED.bio_text,
         tags_json = EXCLUDED.tags_json,
         is_published = CASE WHEN $7 THEN true ELSE tutor_profiles.is_published END
       RETURNING id`,
      [audit.user_id, draft.name || '', draft.title || '', draft.avatar || '', draft.bio || '', JSON.stringify(tags), !isFirstApplication]
    );

    const profileId = profileRes.rows[0].id;

    // 清空旧作品，全量插入新作品
    await client.query(`DELETE FROM tutor_works WHERE profile_id = $1`, [profileId]);
    if (draft.works && Array.isArray(draft.works)) {
      for (const w of draft.works) {
        const workType = w.type === 'video' || w.type === 'video_link' ? 'video_link' : 'image';
        if (!w.url) continue;
        await client.query(
          `INSERT INTO tutor_works (profile_id, type, url, raw_video_url) VALUES ($1, $2, $3, $4)`,
          [profileId, workType, w.url, w.raw || null]
        );
      }
    }

    // 完结审核单
    await client.query(`UPDATE audit_requests SET status = 'approved', processed_at = NOW() WHERE id = $1`, [id]);
    await client.query('COMMIT');

    res.json({ message: isFirstApplication ? '入驻审核通过，账号已激活' : '资料审核通过，导师已上架展示页' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('审核处理失败', error);
    res.status(500).json({ error: '审核处理失败' });
  } finally {
    client.release();
  }
};

export const rejectAudit = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await db.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE audit_requests
       SET status = 'rejected', processed_at = NOW()
       WHERE id = $1 AND status = 'pending'
       RETURNING id, user_id, type`,
      [id]
    );
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: '未找到待审核的资料' });
      return;
    }
    if (result.rows[0].type === 'first_publish') {
      await client.query(`UPDATE users SET status = 'active' WHERE id = $1`, [result.rows[0].user_id]);
    }
    await client.query('COMMIT');
    res.json({ message: '资料审核已驳回，导师可以重新提交' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('审核驳回失败', error);
    res.status(500).json({ error: '审核驳回失败' });
  } finally {
    client.release();
  }
};

export const getAudits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db.query(`
      SELECT a.id, a.user_id, a.type, a.status, a.draft_json, a.created_at,
             u.name as tutor_name, u.email as tutor_email,
             CASE WHEN p.id IS NULL THEN NULL ELSE json_build_object(
               'name', p.display_name,
               'title', p.title,
               'avatar', p.avatar_url,
               'bio', p.bio_text,
               'tags', COALESCE(p.tags_json, '[]'::jsonb),
               'works', COALESCE((
                 SELECT json_agg(json_build_object(
                   'type', CASE WHEN w.type::text = 'video_link' THEN 'video' ELSE 'image' END,
                   'url', w.url,
                   'raw', w.raw_video_url
                 ) ORDER BY w.sort_order, w.id)
                 FROM tutor_works w WHERE w.profile_id = p.id
               ), '[]'::json)
             ) END AS current_profile
      FROM audit_requests a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN tutor_profiles p ON p.user_id = a.user_id
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: '获取审核列表失败' });
  }
};

export const toggleFeatured = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;
    const targetId = typeof id === 'string' ? id : '';
    const result = await db.query('UPDATE tutor_profiles SET is_featured = $1 WHERE user_id = $2 RETURNING id', [!!isFeatured, targetId]);
    if (result.rows.length === 0) {
      res.status(400).json({ error: '该导师尚未建立资料，无法设置精选展示' });
      return;
    }
    res.json({ message: isFeatured ? '已设为精选导师' : '已取消精选导师' });
  } catch (error) {
    res.status(500).json({ error: '精选状态更新失败' });
  }
};
