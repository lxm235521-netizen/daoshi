import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './config/database';

import { login } from './controllers/authController';
import { getAllUsers, createUser, resetPassword, toggleUserStatus, updateAdminNote, togglePublish } from './controllers/usersController';
import { createLead, getAdminLeads, getTutorLeads, assignLead } from './controllers/leadsController';
import { getPublishedCourses, getAllCourses, createCourse, updateCourse, toggleCourseActive, deleteCourse } from './controllers/coursesController';
import { getPublishedTutors, getFeaturedTutors, getTutorProfile, submitProfileDraft, approveAudit, rejectAudit, getAudits, applyTutor, checkEmail, getTutorDetailForAdmin, updateTutorProfileByAdmin } from './controllers/tutorsController';
import { uploadFile } from './controllers/uploadController';
import { upload } from './middlewares/upload';
import { ensureRuntimeSchema } from './config/migrations';
import { toggleFeatured } from './controllers/usersController';

import { authenticate, requireRoles } from './middlewares/auth';
import path from 'path';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/health/ready', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({ status: 'ready', database: 'ok' });
  } catch (error) {
    console.error('数据库就绪检查失败', error);
    res.status(503).json({ status: 'not_ready', database: 'unavailable' });
  }
});

const startServer = async () => {
  try {
    await ensureRuntimeSchema();
  } catch (error) {
    console.error('运行时 schema 初始化失败', error);
  }

  // === 游客端开放 API ===
  app.post('/api/auth/login', login);
  app.get('/api/tutors', getPublishedTutors);
  app.get('/api/tutors/featured', getFeaturedTutors);
  app.post('/api/tutors/apply', upload.single('file'), applyTutor);
  app.post('/api/tutors/check-email', checkEmail);
  app.post('/api/leads', createLead);         // 游客报名表单
  app.get('/api/courses', getPublishedCourses); // 游客端课程展示

  // === 导师工作台 API ===
  app.get('/api/tutor/leads', authenticate, requireRoles(['tutor']), getTutorLeads);
  app.get('/api/tutor/profile', authenticate, requireRoles(['tutor']), getTutorProfile);
  app.post('/api/tutor/profile/draft', authenticate, requireRoles(['tutor']), submitProfileDraft);
  app.post('/api/tutor/upload', authenticate, requireRoles(['tutor']), upload.single('file'), uploadFile);
  app.post('/api/upload', authenticate, requireRoles(['superadmin', 'manager', 'tutor']), upload.single('file'), uploadFile);

  // === 超级管理员 & 平台管理员 API ===
  app.get('/api/admin/users', authenticate, requireRoles(['superadmin', 'manager']), getAllUsers);
  app.post('/api/admin/users', authenticate, requireRoles(['superadmin', 'manager']), createUser);
  app.post('/api/admin/users/:id/reset-password', authenticate, requireRoles(['superadmin', 'manager']), resetPassword);
  app.put('/api/admin/users/:id/status', authenticate, requireRoles(['superadmin', 'manager']), toggleUserStatus);
  app.put('/api/admin/users/:id/note', authenticate, requireRoles(['superadmin', 'manager']), updateAdminNote);
  app.put('/api/admin/users/:id/publish', authenticate, requireRoles(['superadmin', 'manager']), togglePublish);
  app.put('/api/admin/users/:id/featured', authenticate, requireRoles(['superadmin', 'manager']), toggleFeatured);

  app.get('/api/admin/leads', authenticate, requireRoles(['superadmin', 'manager']), getAdminLeads);
  app.put('/api/admin/leads/:id/assign', authenticate, requireRoles(['superadmin', 'manager']), assignLead);
  app.post('/api/admin/audits/:id/approve', authenticate, requireRoles(['superadmin', 'manager']), approveAudit);
  app.post('/api/admin/audits/:id/reject', authenticate, requireRoles(['superadmin', 'manager']), rejectAudit);
  app.get('/api/admin/audits', authenticate, requireRoles(['superadmin', 'manager']), getAudits);

  // 管理员直接维护导师资料（与导师提交审核的字段一致，改完立即生效）
  app.get('/api/admin/tutors/:id', authenticate, requireRoles(['superadmin', 'manager']), getTutorDetailForAdmin);
  app.put('/api/admin/tutors/:id/profile', authenticate, requireRoles(['superadmin', 'manager']), updateTutorProfileByAdmin);

  app.get('/api/admin/courses', authenticate, requireRoles(['superadmin', 'manager']), getAllCourses);
  app.post('/api/admin/courses', authenticate, requireRoles(['superadmin', 'manager']), createCourse);
  app.put('/api/admin/courses/:id', authenticate, requireRoles(['superadmin', 'manager']), updateCourse);
  app.put('/api/admin/courses/:id/active', authenticate, requireRoles(['superadmin', 'manager']), toggleCourseActive);
  app.delete('/api/admin/courses/:id', authenticate, requireRoles(['superadmin', 'manager']), deleteCourse);

  app.listen(PORT, () => {
    console.log(`🚀 API Server is running on http://localhost:${PORT}`);
  });
};

void startServer();
