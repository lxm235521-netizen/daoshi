import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Pencil, Trash2, Eye, EyeOff, X, Save, AlertTriangle } from 'lucide-react';
import axios from 'axios';

export interface ManagedCourse {
  id: string;
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

interface CourseForm {
  code: string;
  title: string;
  badge: string;
  duration: string;
  price: string;
  summary: string;
  detailsText: string;
  fit: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: CourseForm = {
  code: '', title: '', badge: '', duration: '', price: '',
  summary: '', detailsText: '', fit: '', sortOrder: '0', isActive: true
};

const PANEL = 'border-2 border-[#101114] bg-white';
const INPUT = 'w-full border-2 border-[#101114] bg-white px-3 py-2 text-sm text-[#101114] outline-none transition-colors placeholder:text-[#8b8d85] focus:border-[#ff5a45]';
const FIELD_LABEL = 'mb-1 block text-xs font-bold text-[#54564f]';
const BTN_DARK = 'inline-flex items-center justify-center gap-2 border-2 border-[#101114] bg-[#101114] px-4 py-2 text-xs font-black text-white transition-colors hover:bg-[#ff5a45]';
const BTN_GHOST = 'inline-flex items-center justify-center gap-2 border-2 border-[#101114] bg-white px-4 py-2 text-xs font-black text-[#101114] transition-colors hover:bg-[#101114] hover:text-white';
const BTN_SM = 'inline-flex items-center justify-center gap-1.5 border-2 border-[#101114] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#101114] transition-colors hover:bg-[#101114] hover:text-white';
const TABLE_HEAD = 'border-b-2 border-[#101114] bg-[#f7f4ec] text-[11px] font-black uppercase tracking-wider text-[#54564f]';
const TABLE_ROW = 'border-b border-[#101114]/15 transition-colors hover:bg-[#d9ff4f]/25';

const showToastMsg = (msg: string, type: 'success' | 'error' = 'success') => {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { msg, type } }));
};

const toForm = (course: ManagedCourse): CourseForm => ({
  code: course.code,
  title: course.title,
  badge: course.badge,
  duration: course.duration,
  price: course.price,
  summary: course.summary,
  detailsText: (course.details || []).join('\n'),
  fit: course.fit,
  sortOrder: String(course.sortOrder ?? 0),
  isActive: course.isActive
});

export const CourseManager: React.FC<{ token: string | null }> = ({ token }) => {
  const [courses, setCourses] = useState<ManagedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<ManagedCourse | null>(null);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/api/admin/courses', authHeader);
      setCourses(res.data);
    } catch (err) {
      showToastMsg('课程列表加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCourses();
  }, [token]);

  const openCreate = () => {
    setEditingId(null);
    const nextOrder = courses.reduce((max, course) => Math.max(max, course.sortOrder ?? 0), 0) + 1;
    setForm({ ...EMPTY_FORM, sortOrder: String(nextOrder) });
    setFormOpen(true);
  };

  const openEdit = (course: ManagedCourse) => {
    setEditingId(course.id);
    setForm(toForm(course));
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.code.trim() || !form.title.trim()) {
      showToastMsg('课程编号和课程名称为必填项', 'error');
      return;
    }
    const payload = {
      code: form.code.trim(),
      title: form.title.trim(),
      badge: form.badge.trim(),
      duration: form.duration.trim(),
      price: form.price.trim(),
      summary: form.summary.trim(),
      details: form.detailsText.split('\n').map(line => line.trim()).filter(Boolean),
      fit: form.fit.trim(),
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive
    };
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`/api/admin/courses/${editingId}`, payload, authHeader);
        showToastMsg('课程已更新', 'success');
      } else {
        await axios.post('/api/admin/courses', payload, authHeader);
        showToastMsg('课程已创建', 'success');
      }
      setFormOpen(false);
      fetchCourses();
    } catch (err: any) {
      showToastMsg(err.response?.data?.error || '保存课程失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (course: ManagedCourse) => {
    try {
      await axios.put(`/api/admin/courses/${course.id}/active`, { isActive: !course.isActive }, authHeader);
      showToastMsg(course.isActive ? '课程已下架，前端不再展示' : '课程已上架', 'success');
      fetchCourses();
    } catch (err: any) {
      showToastMsg(err.response?.data?.error || '状态更新失败', 'error');
    }
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;
    try {
      await axios.delete(`/api/admin/courses/${courseToDelete.id}`, authHeader);
      showToastMsg('课程已删除', 'success');
      setCourseToDelete(null);
      fetchCourses();
    } catch (err: any) {
      showToastMsg(err.response?.data?.error || '删除课程失败', 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="lg:hidden">
          <span className="text-xs font-bold text-[#777871]">内容管理 / 课程</span>
          <h2 className="mt-1 text-2xl font-black tracking-tight">课程管理</h2>
        </div>
        <p className="hidden text-sm leading-6 text-[#777871] lg:block">
          这里的字段直接对应首页「课程矩阵」与课程详情弹窗的展示内容，下架后前端不再出现该课程。
        </p>
        <button onClick={openCreate} className={BTN_DARK}><Plus size={15} /> 新增课程</button>
      </div>

      <div className={`${PANEL} overflow-x-auto`}>
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin border-4 border-[#101114]/20 border-t-[#ff5a45]"></div>
          </div>
        ) : (
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className={TABLE_HEAD}>
              <tr>
                <th className="px-5 py-4">排序</th>
                <th className="px-5 py-4">课程</th>
                <th className="px-5 py-4">价格</th>
                <th className="px-5 py-4">时长 / 形式</th>
                <th className="px-5 py-4">适合人群</th>
                <th className="px-5 py-4">状态</th>
                <th className="px-5 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center font-bold text-[#777871]">还没有课程，先新增一门</td></tr>
              ) : (
                courses.map(course => (
                  <tr key={course.id} className={`${TABLE_ROW} ${course.isActive ? '' : 'bg-[#101114]/5'}`}>
                    <td className="px-5 py-4">
                      <span className="border border-[#101114] bg-[#f7f4ec] px-2 py-0.5 font-mono text-xs font-bold text-[#54564f]">{course.sortOrder ?? 0}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-[#101114] bg-[#101114] text-[#d9ff4f]"><BookOpen size={16} /></span>
                        <div className="min-w-0">
                          <div className="font-black text-[#101114]">{course.title}</div>
                          <div className="mt-0.5 flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-[#777871]">{course.code}</span>
                            {course.badge && <span className="border border-[#101114] px-1.5 py-0.5 text-[10px] font-bold text-[#54564f]">{course.badge}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-black text-[#ff5a45]">{course.price ? `¥${course.price}` : '—'}</td>
                    <td className="px-5 py-4 text-[#54564f]">{course.duration || '—'}</td>
                    <td className="px-5 py-4 text-[#54564f]">{course.fit || '—'}</td>
                    <td className="px-5 py-4">
                      {course.isActive
                        ? <span className="inline-flex items-center gap-1.5 whitespace-nowrap border-2 border-[#101114] bg-[#d9ff4f] px-2 py-0.5 text-[11px] font-black text-[#101114]">上架中</span>
                        : <span className="inline-flex items-center gap-1.5 whitespace-nowrap border-2 border-[#101114] bg-white px-2 py-0.5 text-[11px] font-black text-[#777871]">已下架</span>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(course)} className={BTN_SM}><Pencil size={13} /> 编辑</button>
                        <button onClick={() => handleToggleActive(course)} className={course.isActive ? BTN_SM : `${BTN_SM} !bg-[#d9ff4f]`}>
                          {course.isActive ? <><EyeOff size={13} /> 下架</> : <><Eye size={13} /> 上架</>}
                        </button>
                        <button onClick={() => setCourseToDelete(course)} className={`${BTN_SM} !text-[#ff5a45] hover:!bg-[#ff5a45] hover:!text-white`}><Trash2 size={13} /> 删除</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 新增 / 编辑课程 */}
      <AnimatePresence>
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101114]/60 p-4" onClick={() => setFormOpen(false)}>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              onClick={event => event.stopPropagation()}
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden border-2 border-[#101114] bg-white shadow-[10px_10px_0_#101114]"
            >
              <div className="flex items-center justify-between border-b-2 border-[#101114] bg-[#f7f4ec] px-5 py-4">
                <div>
                  <h3 className="text-lg font-black text-[#101114]">{editingId ? '编辑课程' : '新增课程'}</h3>
                  <p className="mt-1 text-xs font-bold text-[#777871]">以下内容会直接展示在前端课程矩阵与详情弹窗</p>
                </div>
                <button type="button" onClick={() => setFormOpen(false)} aria-label="关闭课程表单" className="border-2 border-[#101114] bg-white p-1.5 transition-colors hover:bg-[#101114] hover:text-white"><X size={16} /></button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={FIELD_LABEL}>课程编号 *</label>
                    <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="例如 COURSE-04" className={INPUT} />
                  </div>
                  <div>
                    <label className={FIELD_LABEL}>课程名称 *</label>
                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="展示在卡片标题" className={INPUT} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className={FIELD_LABEL}>价格（元）</label>
                    <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="例如 98" className={INPUT} />
                  </div>
                  <div>
                    <label className={FIELD_LABEL}>角标</label>
                    <input value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="例如 录播课" className={INPUT} />
                  </div>
                  <div>
                    <label className={FIELD_LABEL}>排序值（越小越靠前）</label>
                    <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })} className={INPUT} />
                  </div>
                </div>

                <div>
                  <label className={FIELD_LABEL}>时长 / 形式</label>
                  <input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="例如 1 小时 · 核心流程" className={INPUT} />
                </div>

                <div>
                  <label className={FIELD_LABEL}>课程简介</label>
                  <textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} rows={3} placeholder="卡片与详情弹窗中的一段说明" className={`${INPUT} resize-none`} />
                </div>

                <div>
                  <label className={FIELD_LABEL}>课程要点（每行一条）</label>
                  <textarea value={form.detailsText} onChange={e => setForm({ ...form, detailsText: e.target.value })} rows={4} placeholder={'拆解叙事骨架，找到真正能拍的戏眼。\n把小说语言翻译成镜头语言。'} className={`${INPUT} resize-none`} />
                  <p className="mt-1 text-xs font-bold text-[#777871]">共 {form.detailsText.split('\n').map(line => line.trim()).filter(Boolean).length} 条要点</p>
                </div>

                <div>
                  <label className={FIELD_LABEL}>适合人群</label>
                  <input value={form.fit} onChange={e => setForm({ ...form, fit: e.target.value })} placeholder="例如 适合：小说作者 / 入门创作者" className={INPUT} />
                </div>

                <label className="flex cursor-pointer items-center gap-3 border-2 border-[#101114] bg-[#f7f4ec] px-3 py-2.5">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-[#101114]" />
                  <span className="text-xs font-bold text-[#101114]">上架到前端展示页（取消勾选则前台隐藏）</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t-2 border-[#101114] bg-[#f7f4ec] px-5 py-4">
                <button type="button" onClick={() => setFormOpen(false)} className={BTN_GHOST}>取消</button>
                <button type="button" onClick={handleSubmit} disabled={saving} className={`${BTN_DARK} disabled:cursor-not-allowed disabled:bg-[#aeb0a9]`}>
                  <Save size={15} /> {saving ? '保存中...' : editingId ? '保存修改' : '创建课程'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 删除确认 */}
      <AnimatePresence>
        {courseToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101114]/60 p-4" onClick={() => setCourseToDelete(null)}>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              onClick={event => event.stopPropagation()}
              className="w-full max-w-md overflow-hidden border-2 border-[#101114] bg-white shadow-[10px_10px_0_#101114]"
            >
              <div className="border-b-2 border-[#101114] bg-[#f7f4ec] p-5">
                <h3 className="flex items-center gap-2 text-lg font-black text-[#101114]"><AlertTriangle size={18} className="text-[#ff5a45]" /> 删除课程</h3>
              </div>
              <div className="p-5">
                <p className="text-sm leading-7 text-[#54564f]">
                  确定删除「<b className="text-[#101114]">{courseToDelete.title}</b>」吗？删除后前端不再展示，已产生的报名线索记录不受影响。
                </p>
                <p className="mt-2 text-xs font-bold text-[#777871]">如果只是暂时不想展示，建议改用「下架」。</p>
              </div>
              <div className="flex justify-end gap-3 border-t-2 border-[#101114] bg-[#f7f4ec] p-4">
                <button onClick={() => setCourseToDelete(null)} className={BTN_GHOST}>取消</button>
                <button onClick={handleDelete} className="inline-flex items-center justify-center gap-2 border-2 border-[#ff5a45] bg-[#ff5a45] px-4 py-2 text-xs font-black text-white transition-colors hover:bg-white hover:text-[#ff5a45]">
                  <Trash2 size={15} /> 确认删除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
