import { Request, Response } from 'express';
import { db } from '../config/database';

interface CourseInput {
  code: string;
  title: string;
  badge: string;
  duration: string;
  price: string;
  summary: string;
  details: string[];
  fit: string;
  sortOrder: number;
  isActive: boolean;
}

const toText = (value: unknown): string => (typeof value === 'string' ? value.trim() : value === null || value === undefined ? '' : String(value).trim());

const toDetails = (value: unknown): string[] => {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split('\n') : [];
  return list.map(item => toText(item)).filter(Boolean);
};

/** 把前端提交的表单规范成落库字段，返回 null 表示校验不通过 */
const parseCourseInput = (body: any): CourseInput | null => {
  const code = toText(body?.code);
  const title = toText(body?.title);
  if (!code || !title) return null;
  const sortOrderRaw = Number(body?.sortOrder);
  return {
    code,
    title,
    badge: toText(body?.badge),
    duration: toText(body?.duration),
    price: toText(body?.price),
    summary: toText(body?.summary),
    details: toDetails(body?.details),
    fit: toText(body?.fit),
    sortOrder: Number.isFinite(sortOrderRaw) ? Math.trunc(sortOrderRaw) : 0,
    isActive: body?.isActive === undefined ? true : Boolean(body.isActive)
  };
};

const mapCourse = (row: any) => ({
  id: row.id,
  code: row.code,
  title: row.title,
  badge: row.badge || '',
  duration: row.duration || '',
  price: row.price || '',
  summary: row.summary || '',
  details: Array.isArray(row.details) ? row.details : [],
  fit: row.fit || '',
  sortOrder: row.sort_order,
  isActive: row.is_active,
  updatedAt: row.updated_at
});

/** 游客端：只返回上架课程，按排序值升序 */
export const getPublishedCourses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      `SELECT * FROM courses WHERE is_active = true ORDER BY sort_order ASC, created_at ASC`
    );
    res.json(result.rows.map(mapCourse));
  } catch (error) {
    res.status(500).json({ error: '获取课程列表失败' });
  }
};

/** 管理员：返回全部课程（含下架），用于后台课程管理 */
export const getAllCourses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.query(`SELECT * FROM courses ORDER BY sort_order ASC, created_at ASC`);
    res.json(result.rows.map(mapCourse));
  } catch (error) {
    res.status(500).json({ error: '获取课程列表失败' });
  }
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  const input = parseCourseInput(req.body);
  if (!input) {
    res.status(400).json({ error: '请填写课程编号和课程名称' });
    return;
  }
  try {
    const existing = await db.query('SELECT id FROM courses WHERE code = $1', [input.code]);
    if (existing.rows.length > 0) {
      res.status(400).json({ error: '该课程编号已存在' });
      return;
    }
    const result = await db.query(
      `INSERT INTO courses (code, title, badge, duration, price, summary, details, fit, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)
       RETURNING *`,
      [input.code, input.title, input.badge, input.duration, input.price, input.summary, JSON.stringify(input.details), input.fit, input.sortOrder, input.isActive]
    );
    res.status(201).json({ message: '课程已创建', course: mapCourse(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ error: '创建课程失败' });
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const input = parseCourseInput(req.body);
  if (!input) {
    res.status(400).json({ error: '请填写课程编号和课程名称' });
    return;
  }
  try {
    const duplicated = await db.query('SELECT id FROM courses WHERE code = $1 AND id <> $2', [input.code, id]);
    if (duplicated.rows.length > 0) {
      res.status(400).json({ error: '该课程编号已被其他课程占用' });
      return;
    }
    const result = await db.query(
      `UPDATE courses
       SET code = $1, title = $2, badge = $3, duration = $4, price = $5, summary = $6,
           details = $7::jsonb, fit = $8, sort_order = $9, is_active = $10, updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [input.code, input.title, input.badge, input.duration, input.price, input.summary, JSON.stringify(input.details), input.fit, input.sortOrder, input.isActive, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: '课程不存在' });
      return;
    }
    res.json({ message: '课程已更新', course: mapCourse(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ error: '更新课程失败' });
  }
};

export const toggleCourseActive = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const isActive = Boolean(req.body?.isActive);
  try {
    const result = await db.query(
      `UPDATE courses SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [isActive, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: '课程不存在' });
      return;
    }
    res.json({ message: isActive ? '课程已上架' : '课程已下架', course: mapCourse(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ error: '更新课程状态失败' });
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM courses WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: '课程不存在' });
      return;
    }
    res.json({ message: '课程已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除课程失败' });
  }
};
