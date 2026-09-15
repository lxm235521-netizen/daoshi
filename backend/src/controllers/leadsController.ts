import { Request, Response } from 'express';
import { db } from '../config/database';
import { AuthRequest } from '../middlewares/auth';

// 游客提交报名
export const createLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { wechat, level, request, timeNote, intentTutorId, courseName, courseCode, coursePrice } = req.body;
    await db.query(
      `INSERT INTO leads (wechat_qq, level, learning_request, time_note, intent_tutor_id, course_name, course_code, course_price) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [wechat, level, request, timeNote, intentTutorId || null, courseName || null, courseCode || null, coursePrice || null]
    );
    res.json({ message: '报名成功，等待管理员联系' });
  } catch (error) {
    res.status(500).json({ error: '提交报名失败' });
  }
};

// 管理员获取所有线索
export const getAdminLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db.query(`
      SELECT l.*, 
             t_intent.name as intent_tutor_name,
             t_assigned.name as assigned_tutor_name
      FROM leads l
      LEFT JOIN users t_intent ON l.intent_tutor_id = t_intent.id
      LEFT JOIN users t_assigned ON l.assigned_tutor_id = t_assigned.id
      ORDER BY l.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: '获取线索列表失败' });
  }
};

// 导师获取自己的学员
export const getTutorLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      `SELECT * FROM leads WHERE assigned_tutor_id = $1 AND status = 'assigned' ORDER BY assigned_at DESC`,
      [req.user?.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: '获取学员失败' });
  }
};

// 管理员分配线索给导师
export const assignLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { tutorId } = req.body;
    await db.query(
      `UPDATE leads 
       SET assigned_tutor_id = $1, status = 'assigned', assigned_at = NOW(), tutor_status = 'todo' 
       WHERE id = $2`,
      [tutorId, id]
    );
    res.json({ message: '分配成功' });
  } catch (error) {
    res.status(500).json({ error: '分配失败' });
  }
};
