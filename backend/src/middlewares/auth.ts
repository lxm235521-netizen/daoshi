import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: '请先登录' });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const result = await db.query('SELECT id, email, role, status FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      res.status(401).json({ error: '账号不存在' });
      return;
    }
    const user = result.rows[0];
    if (user.status === 'disabled') {
      res.status(403).json({ error: '您的账户已被封禁，请联系管理员' });
      return;
    }
    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch (err) {
    res.status(401).json({ error: '登录态失效或非法' });
  }
};

export const requireRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: '权限不足，无法执行此操作' });
      return;
    }
    next();
  };
};
