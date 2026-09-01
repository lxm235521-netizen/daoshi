
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database';
import { AuthRequest } from '../middlewares/auth';

// 获取所有系统用户 (Admin 用)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(`
      SELECT u.id, u.email, u.name, u.role, u.status, u.admin_note as note, u.last_login_at as "lastLogin", tp.is_published
      FROM users u
      LEFT JOIN tutor_profiles tp ON u.id = tp.user_id 
      ORDER BY 
        CASE role WHEN 'superadmin' THEN 1 WHEN 'manager' THEN 2 ELSE 3 END, 
        u.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: '获取用户列表失败' });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const role = req.body?.role;
    const note = typeof req.body?.note === 'string' ? req.body.note.trim() : null;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: '请输入有效的邮箱地址' });
      return;
    }
    if (!name) {
      res.status(400).json({ error: '请输入用户名称' });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ error: '密码长度不能小于6位' });
      return;
    }
    if (!['manager', 'tutor'].includes(role)) {
      res.status(400).json({ error: '用户角色无效' });
      return;
    }
    if (req.user?.role === 'manager' && role !== 'tutor') {
      res.status(403).json({ error: '管理员只能添加导师用户' });
      return;
    }

    const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = $1', [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: '该邮箱已被注册' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (email, password_hash, name, role, status, admin_note)
       VALUES ($1, $2, $3, $4, 'active', $5)
       RETURNING id, email, name, role, status, admin_note as note`,
      [email, passwordHash, name, role, note]
    );
    res.status(201).json({ message: '用户添加成功', user: result.rows[0] });
  } catch (error: any) {
    if (error?.code === '23505') {
      res.status(409).json({ error: '该邮箱已被注册' });
      return;
    }
    console.error('添加用户失败', error);
    res.status(500).json({ error: '添加用户失败' });
  }
};

const canManageTargetUser = async (req: AuthRequest, res: Response, targetId: string): Promise<boolean> => {
  const target = await db.query('SELECT role FROM users WHERE id = $1', [targetId]);
  if (target.rows.length === 0) {
    res.status(404).json({ error: '用户不存在' });
    return false;
  }
  const targetRole = target.rows[0].role;
  if (targetRole === 'superadmin' || (req.user?.role === 'manager' && targetRole !== 'tutor')) {
    res.status(403).json({ error: '无权管理该用户' });
    return false;
  }
  return true;
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const targetId = typeof id === 'string' ? id : '';
    if (!await canManageTargetUser(req, res, targetId)) return;
    
    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: '密码长度不能小于6位' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, id]);
    res.json({ message: '密码重置成功' });
  } catch (error) {
    res.status(500).json({ error: '密码重置失败' });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const targetId = typeof id === 'string' ? id : '';
    if (!await canManageTargetUser(req, res, targetId)) return;
    
    if (!['active', 'disabled'].includes(status)) {
      res.status(400).json({ error: '状态无效' });
      return;
    }

    await db.query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);
    res.json({ message: `用户状态已更新为 ${status === 'active' ? '正常' : '封禁'}` });
  } catch (error) {
    res.status(500).json({ error: '更新用户状态失败' });
  }
};

export const updateAdminNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const targetId = typeof id === 'string' ? id : '';
    if (!await canManageTargetUser(req, res, targetId)) return;
    
    await db.query('UPDATE users SET admin_note = $1 WHERE id = $2', [note, id]);
    res.json({ message: '备注更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新备注失败' });
  }
};

export const togglePublish = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    const targetId = typeof id === 'string' ? id : '';
    if (!await canManageTargetUser(req, res, targetId)) return;
    const result = await db.query('UPDATE tutor_profiles SET is_published = $1 WHERE user_id = $2 RETURNING id', [isPublished, targetId]);
    if (result.rows.length === 0) {
      res.status(400).json({ error: '该导师尚未通过首次入驻审核，无法操作展厅状态' });
      return;
    }
    res.json({ message: isPublished ? '已上架展厅' : '已下架隐藏' });
  } catch (error) {
    res.status(500).json({ error: '操作失败' });
  }
};
