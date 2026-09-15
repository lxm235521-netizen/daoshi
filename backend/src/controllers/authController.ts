import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, loginRole } = req.body;
    const identifier = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!identifier || typeof password !== 'string' || !password) {
      res.status(400).json({ error: '请输入账号和密码' });
      return;
    }
    
    const result = await db.query('SELECT * FROM users WHERE LOWER(email) = $1', [identifier]);
    if (result.rows.length === 0) {
      res.status(401).json({ error: '账号或密码错误' });
      return;
    }
    
    const user = result.rows[0];
    
    if (user.status === 'disabled') {
      res.status(403).json({ error: '您的账户已被封禁，请联系管理员' });
      return;
    }
    
    // 角色安全校验：如果在前台选了管理员入口，但底层角色是导师，则拦截
    if (loginRole === 'admin' && user.role === 'tutor') {
      res.status(403).json({ error: '您不是系统管理员，无法从该通道登录' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: '账号或密码错误' });
      return;
    }

    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '7d' }
    );

    res.json({
      message: '登录成功',
      token,
      user: { id: user.id, name: user.name, role: user.role, email: user.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};
