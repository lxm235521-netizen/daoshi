import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './config/database';

import { login } from './controllers/authController';
import { getAllUsers, createUser, resetPassword, toggleUserStatus, updateAdminNote, togglePublish } from './controllers/usersController';
import { createLead, getAdminLeads, getTutorLeads, assignLead } from './controllers/leadsController';
import { getPublishedTutors, getTutorProfile, submitProfileDraft, approveAudit, rejectAudit, getAudits, applyTutor, checkEmail } from './controllers/tutorsController';
import { uploadFile } from './controllers/uploadController';
import { upload } from './middlewares/upload';

import { authenticate, requireRoles } from './middlewares/auth';
import path from 'path';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// === 游客端开放 API ===
app.post('/api/auth/login', login);
app.get('/api/tutors', getPublishedTutors);
app.post('/api/tutors/apply', applyTutor);
app.post('/api/tutors/check-email', checkEmail);
app.post('/api/leads', createLead);         // 游客报名表单

// === 导师工作台 API ===
app.get('/api/tutor/leads', authenticate, requireRoles(['tutor']), getTutorLeads);
app.get('/api/tutor/profile', authenticate, requireRoles(['tutor']), getTutorProfile);
app.post('/api/tutor/profile/draft', authenticate, requireRoles(['tutor']), submitProfileDraft);
app.post('/api/tutor/upload', authenticate, requireRoles(['tutor']), upload.single('file'), uploadFile);
app.post('/api/upload', upload.single('file'), uploadFile);

// === 超级管理员 & 平台管理员 API ===
app.get('/api/admin/users', authenticate, requireRoles(['superadmin', 'manager']), getAllUsers);
app.post('/api/admin/users', authenticate, requireRoles(['superadmin', 'manager']), createUser);
app.post('/api/admin/users/:id/reset-password', authenticate, requireRoles(['superadmin', 'manager']), resetPassword);
app.put('/api/admin/users/:id/status', authenticate, requireRoles(['superadmin', 'manager']), toggleUserStatus);
app.put('/api/admin/users/:id/note', authenticate, requireRoles(['superadmin', 'manager']), updateAdminNote);
app.put('/api/admin/users/:id/publish', authenticate, requireRoles(['superadmin', 'manager']), togglePublish);

app.get('/api/admin/leads', authenticate, requireRoles(['superadmin', 'manager']), getAdminLeads);
app.put('/api/admin/leads/:id/assign', authenticate, requireRoles(['superadmin', 'manager']), assignLead);
app.post('/api/admin/audits/:id/approve', authenticate, requireRoles(['superadmin', 'manager']), approveAudit);
app.post('/api/admin/audits/:id/reject', authenticate, requireRoles(['superadmin', 'manager']), rejectAudit);
app.get('/api/admin/audits', authenticate, requireRoles(['superadmin', 'manager']), getAudits);

app.listen(PORT, () => {
  console.log(`🚀 API Server is running on http://localhost:${PORT}`);
});
