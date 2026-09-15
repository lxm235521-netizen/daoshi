import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, ShieldCheck, Shield, ShieldAlert, LogOut, Menu, Eye, EyeOff, ExternalLink, X, ArrowLeft, BookOpen, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { resolveLeadCoursePrice } from '../content/coursePrice';
import { CourseManager } from '../components/CourseManager';
import { TutorEditor } from '../components/TutorEditor';

type Role = 'superadmin' | 'manager' | 'tutor';
type AccountStatus = 'active' | 'disabled';

interface SystemUser { id: string; email: string; name: string; role: Role; status: AccountStatus; note: string; lastLogin: string; is_published: boolean | null; is_featured: boolean | null; }

/* ---------- 与首页一致的视觉规范 ---------- */

const PANEL = 'border-2 border-[#101114] bg-white';
const INPUT = 'w-full border-2 border-[#101114] bg-white px-3 py-2 text-sm text-[#101114] outline-none transition-colors placeholder:text-[#8b8d85] focus:border-[#ff5a45]';
const FIELD_LABEL = 'mb-1 block text-xs font-bold text-[#54564f]';
const BTN_DARK = 'inline-flex items-center justify-center gap-2 border-2 border-[#101114] bg-[#101114] px-4 py-2 text-xs font-black text-white transition-colors hover:bg-[#ff5a45]';
const BTN_LIME = 'inline-flex items-center justify-center gap-2 border-2 border-[#101114] bg-[#d9ff4f] px-4 py-2 text-xs font-black text-[#101114] transition-colors hover:bg-[#101114] hover:text-[#d9ff4f]';
const BTN_GHOST = 'inline-flex items-center justify-center gap-2 border-2 border-[#101114] bg-white px-4 py-2 text-xs font-black text-[#101114] transition-colors hover:bg-[#101114] hover:text-white';
const BTN_DANGER = 'inline-flex items-center justify-center gap-2 border-2 border-[#ff5a45] bg-[#ff5a45] px-4 py-2 text-xs font-black text-white transition-colors hover:bg-white hover:text-[#ff5a45]';
const BTN_SM = 'inline-flex items-center justify-center gap-1.5 border-2 border-[#101114] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#101114] transition-colors hover:bg-[#101114] hover:text-white';
const TABLE_HEAD = 'border-b-2 border-[#101114] bg-[#f7f4ec] text-[11px] font-black uppercase tracking-wider text-[#54564f]';
const TABLE_ROW = 'border-b border-[#101114]/15 transition-colors hover:bg-[#d9ff4f]/25';

const Toast = ({ message, type }: { message: string, type: 'success' | 'error' }) => (
  <div className={`fixed left-1/2 top-6 z-[100] flex -translate-x-1/2 items-center gap-3 border-2 border-[#101114] px-6 py-3 shadow-[6px_6px_0_#101114] animate-in fade-in slide-in-from-top-4 ${type === 'success' ? 'bg-[#d9ff4f] text-[#101114]' : 'bg-[#ff5a45] text-white'}`}>
    {type === 'success' ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
    <span className="text-sm font-black">{message}</span>
  </div>
);

const StatusTag = ({ tone, children }: { tone: 'lime' | 'coral' | 'ink' | 'plain', children: React.ReactNode }) => {
  const tones = {
    lime: 'bg-[#d9ff4f] text-[#101114]',
    coral: 'bg-[#ff5a45] text-white',
    ink: 'bg-[#101114] text-white',
    plain: 'bg-white text-[#54564f]'
  };
  return <span className={`inline-flex items-center gap-1.5 border-2 border-[#101114] px-2 py-0.5 text-[11px] font-black whitespace-nowrap ${tones[tone]}`}>{children}</span>;
};

const showToastMsg = (msg: string, type: 'success' | 'error' = 'success') => {
  const evt = new CustomEvent('show-toast', { detail: { msg, type } });
  window.dispatchEvent(evt);
};

const DispatchCenter = ({ token }: { token: string | null }) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterWechat, setFilterWechat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterIntent, setFilterIntent] = useState('');
  const [filterAssigned, setFilterAssigned] = useState('');
  const [filterCourse, setFilterCourse] = useState('');

  const fetchData = async () => {
    try {
      const [leadsRes, tutorsRes] = await Promise.all([
        axios.get('/api/admin/leads', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setLeads(leadsRes.data);
      setTutors(tutorsRes.data.filter((u: any) => u.role === 'tutor' && u.status === 'active'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleAssign = async (leadId: string, tutorId: string) => {
    try {
      await axios.put(`/api/admin/leads/${leadId}/assign`, { tutorId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      showToastMsg('分配成功', 'success');
    } catch (err) {
      showToastMsg('分配失败', 'error');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const contact = (lead.wechat_qq || '').toLowerCase();
    const intentName = (lead.intent_tutor_name || '').toLowerCase();
    const assignedName = (lead.assigned_tutor_name || '').toLowerCase();
    const course = `${lead.course_name || ''} ${lead.course_code || ''}`.toLowerCase();
    if (filterWechat && !contact.includes(filterWechat.toLowerCase())) return false;
    if (filterStatus && lead.status !== filterStatus) return false;
    if (filterIntent && !intentName.includes(filterIntent.toLowerCase())) return false;
    if (filterAssigned && !assignedName.includes(filterAssigned.toLowerCase())) return false;
    if (filterCourse && !course.includes(filterCourse.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="lg:hidden">
        <span className="text-xs font-bold text-[#777871]">学员分配 / 线索池</span>
        <h2 className="mt-1 text-2xl font-black tracking-tight">学员报名分配</h2>
      </div>

      {/* Search Filters */}
      <div className={`${PANEL} flex flex-wrap items-end gap-4 p-4`}>
        <div className="min-w-[150px] flex-1">
          <label className={FIELD_LABEL}>联系方式</label>
          <input type="text" value={filterWechat} onChange={e => setFilterWechat(e.target.value)} placeholder="搜索微信/QQ..." className={INPUT} />
        </div>
        <div className="min-w-[150px] flex-1">
          <label className={FIELD_LABEL}>报名课程</label>
          <input type="text" value={filterCourse} onChange={e => setFilterCourse(e.target.value)} placeholder="搜索课程名称..." className={INPUT} />
        </div>
        <div className="min-w-[120px] flex-1">
          <label className={FIELD_LABEL}>状态</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={INPUT}>
            <option value="">全部</option>
            <option value="pending">待分配</option>
            <option value="assigned">已分配</option>
          </select>
        </div>
        <div className="min-w-[150px] flex-1">
          <label className={FIELD_LABEL}>学员意向导师</label>
          <input type="text" value={filterIntent} onChange={e => setFilterIntent(e.target.value)} placeholder="搜索意向导师名称..." className={INPUT} />
        </div>
        <div className="min-w-[150px] flex-1">
          <label className={FIELD_LABEL}>分配导师</label>
          <input type="text" value={filterAssigned} onChange={e => setFilterAssigned(e.target.value)} placeholder="搜索分配导师名称..." className={INPUT} />
        </div>
        <div className="min-w-[80px]">
          <button onClick={() => { setFilterWechat(''); setFilterStatus(''); setFilterIntent(''); setFilterAssigned(''); setFilterCourse(''); }} className={`${BTN_GHOST} w-full`}>重置</button>
        </div>
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
                <th className="px-5 py-4">联系方式</th>
                <th className="px-5 py-4">报名课程</th>
                <th className="px-5 py-4">基础水平</th>
                <th className="px-5 py-4">学习诉求</th>
                <th className="px-5 py-4">意向导师</th>
                <th className="px-5 py-4">分配导师</th>
                <th className="px-5 py-4">报名时间</th>
                <th className="px-5 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr key={lead.id} className={TABLE_ROW}>
                  <td className="px-5 py-4 font-bold text-[#101114]">{lead.wechat_qq || '未提供'}</td>
                  <td className="px-5 py-4">
                    {lead.course_name
                      ? <div className="flex items-baseline gap-2">
                          <span className="font-black text-[#101114]">{lead.course_name}</span>
                          {resolveLeadCoursePrice(lead.course_name, lead.course_price)
                            ? <span className="whitespace-nowrap font-black text-[#ff5a45]">¥{resolveLeadCoursePrice(lead.course_name, lead.course_price)}</span>
                            : <span className="text-xs font-bold text-[#777871]">价格待确认</span>}
                        </div>
                      : <span className="font-normal italic text-[#777871]">未选择课程</span>}
                  </td>
                  <td className="px-5 py-4 text-[#54564f]">{lead.level}</td>
                  <td className="max-w-[240px] whitespace-normal px-5 py-4 text-[#54564f]">{lead.learning_request || '—'}</td>
                  <td className="px-5 py-4 font-bold text-[#ff5a45]">
                    {lead.intent_tutor_name || <span className="font-normal italic text-[#777871]">未选择</span>}
                  </td>
                  <td className="px-5 py-4">
                    {lead.assigned_tutor_name
                      ? <StatusTag tone="ink">{lead.assigned_tutor_name}</StatusTag>
                      : <span className="font-normal italic text-[#777871]">待分配</span>}
                  </td>
                  <td className="px-5 py-4 text-xs text-[#777871]">{new Date(lead.created_at).toLocaleString()}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        id={`select-${lead.id}`}
                        defaultValue={lead.assigned_tutor_id || lead.intent_tutor_id || ''}
                        className="w-32 cursor-pointer border-2 border-[#101114] bg-white px-2 py-1.5 text-xs font-bold text-[#101114] outline-none focus:border-[#ff5a45]"
                      >
                        <option value="" disabled>选择导师</option>
                        {tutors.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const val = (document.getElementById(`select-${lead.id}`) as HTMLSelectElement).value;
                          if (val) handleAssign(lead.id, val);
                        }}
                        className={BTN_SM}
                      >
                        {lead.status === 'assigned' ? '重新分配' : '确认分配'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && <tr><td colSpan={8} className="px-6 py-12 text-center font-bold text-[#777871]">没有找到匹配的线索</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const AuditCenter = ({ token }: { token: string | null }) => {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState<any | null>(null);

  // Filters
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const fetchAudits = async () => {
    try {
      const res = await axios.get('/api/admin/audits', { headers: { Authorization: `Bearer ${token}` } });
      setAudits(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAudits();
  }, [token]);

  const handleApprove = async (id: string) => {
    try {
      await axios.post(`/api/admin/audits/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      showToastMsg('审核通过成功', 'success');
      fetchAudits();
    } catch (err: any) {
      showToastMsg(err.response?.data?.error || '审核通过失败，请稍后重试', 'error');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.post(`/api/admin/audits/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      showToastMsg('审核不通过，导师可以重新提交', 'success');
      setSelectedAudit(null);
      fetchAudits();
    } catch (err: any) {
      showToastMsg(err.response?.data?.error || '驳回失败', 'error');
    }
  };

  const filteredAudits = audits.filter(audit => {
    const name = (audit.tutor_name || '').toLowerCase();
    if (filterName && !name.includes(filterName.toLowerCase())) return false;
    if (filterStatus && audit.status !== filterStatus) return false;
    if (filterType && audit.type !== filterType) return false;
    return true;
  });

  const draft = selectedAudit?.draft_json || {};
  const current = selectedAudit?.current_profile || {};
  const formatTags = (tags: unknown) => Array.isArray(tags) ? tags.filter(Boolean).join('、') : String(tags || '');
  const formatWorks = (works: unknown) => Array.isArray(works)
    ? works.map((work: any) => work?.raw || work?.url || work).filter(Boolean)
    : [];
  const hasChanged = (field: string) => {
    if (!selectedAudit?.current_profile) return true;
    if (field === 'tags') return formatTags(current.tags) !== formatTags(draft.tags);
    if (field === 'works') return JSON.stringify(formatWorks(current.works)) !== JSON.stringify(formatWorks(draft.works));
    return (current[field] || '') !== (draft[field] || '');
  };
  const renderValue = (field: string, value: any) => {
    if (field === 'avatar') {
      return value
        ? <img src={value} alt="导师头像" className="h-16 w-16 border-2 border-[#101114] object-cover" />
        : <span className="text-[#777871]">未设置</span>;
    }
    if (field === 'tags') return formatTags(value) || <span className="text-[#777871]">未设置</span>;
    if (field === 'works') {
      const works = formatWorks(value);
      return works.length
        ? <div className="space-y-1">{works.map((work, index) => <div key={`${work}-${index}`} className="truncate border border-[#101114]/20 bg-[#f7f4ec] px-2 py-1 text-xs text-[#54564f]">{work}</div>)}</div>
        : <span className="text-[#777871]">暂无作品</span>;
    }
    return value || <span className="text-[#777871]">未填写</span>;
  };
  const diffFields = [
    { key: 'name', label: '外显昵称' },
    { key: 'title', label: '一句话头衔' },
    { key: 'avatar', label: '头像' },
    { key: 'tags', label: '核心教学标签' },
    { key: 'bio', label: '个人简介' },
    { key: 'works', label: '作品展示' }
  ];

  return (
    <div className="space-y-5">
      <div className="lg:hidden">
        <span className="text-xs font-bold text-[#777871]">导师审核 / 资料改动</span>
        <h2 className="mt-1 text-2xl font-black tracking-tight">导师资料审核</h2>
      </div>

      {/* Search Filters */}
      <div className={`${PANEL} flex flex-wrap items-end gap-4 p-4`}>
        <div className="min-w-[150px] flex-1">
          <label className={FIELD_LABEL}>导师名称</label>
          <input type="text" value={filterName} onChange={e => setFilterName(e.target.value)} placeholder="搜索导师..." className={INPUT} />
        </div>
        <div className="min-w-[120px] flex-1">
          <label className={FIELD_LABEL}>状态</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={INPUT}>
            <option value="">全部</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">未通过</option>
          </select>
        </div>
        <div className="min-w-[150px] flex-1">
          <label className={FIELD_LABEL}>审核类型</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className={INPUT}>
            <option value="">全部类型</option>
            <option value="first_publish">首次入驻资料</option>
            <option value="profile_update">资料修改</option>
          </select>
        </div>
        <div className="min-w-[80px]">
          <button onClick={() => { setFilterName(''); setFilterStatus(''); setFilterType(''); }} className={`${BTN_GHOST} w-full`}>重置</button>
        </div>
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
                <th className="px-5 py-4">导师名称</th>
                <th className="px-5 py-4">审核类型</th>
                <th className="px-5 py-4">状态</th>
                <th className="px-5 py-4">提交时间</th>
                <th className="px-5 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredAudits.map(audit => (
                <tr key={audit.id} className={TABLE_ROW}>
                  <td className="px-5 py-4 font-bold text-[#101114]">{audit.tutor_name} <span className="ml-2 text-xs font-normal text-[#777871]">({audit.tutor_email})</span></td>
                  <td className="px-5 py-4 text-[#54564f]">{audit.type === 'first_publish' ? '首次入驻资料' : '资料修改'}</td>
                  <td className="px-5 py-4">
                    {audit.status === 'pending'
                      ? <StatusTag tone="lime">待审核</StatusTag>
                      : audit.status === 'rejected'
                        ? <StatusTag tone="coral">未通过</StatusTag>
                        : <StatusTag tone="ink">已通过</StatusTag>}
                  </td>
                  <td className="px-5 py-4 text-xs text-[#777871]">{new Date(audit.created_at).toLocaleString()}</td>
                  <td className="px-5 py-4 text-right">
                    {audit.status === 'pending' && <button onClick={() => setSelectedAudit(audit)} className={BTN_SM}><Eye size={13} /> 查看改动</button>}
                  </td>
                </tr>
              ))}
              {filteredAudits.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center font-bold text-[#777871]">没有找到匹配的审核项</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {selectedAudit && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101114]/60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAudit(null)}>
            <motion.div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden border-2 border-[#101114] bg-white shadow-[10px_10px_0_#101114]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} onClick={event => event.stopPropagation()}>
              <div className="flex items-center justify-between border-b-2 border-[#101114] bg-[#f7f4ec] px-6 py-4">
                <div>
                  <h3 className="text-lg font-black text-[#101114]">资料改动对比</h3>
                  <p className="mt-1 text-xs font-bold text-[#777871]">{selectedAudit.tutor_name} · {selectedAudit.type === 'first_publish' ? '首次入驻资料' : '资料修改'}</p>
                </div>
                <button type="button" onClick={() => setSelectedAudit(null)} aria-label="关闭资料改动对比" className="border-2 border-[#101114] bg-white p-1.5 text-[#101114] transition-colors hover:bg-[#101114] hover:text-white"><X size={18} /></button>
              </div>
              <div className="overflow-y-auto p-6">
                <div className="mb-5 flex flex-wrap items-center gap-3 text-xs font-bold text-[#54564f]">
                  <span className="border-2 border-[#101114] px-3 py-1">左侧：当前已生效资料</span>
                  <span className="border-2 border-[#101114] bg-[#101114] px-3 py-1 text-white">右侧：本次提交资料</span>
                  <span className="border-2 border-[#101114] bg-[#d9ff4f] px-3 py-1 text-[#101114]">高亮项：存在改动</span>
                </div>
                {!selectedAudit.current_profile && <div className="mb-4 border-2 border-[#101114] bg-[#d9ff4f] px-4 py-3 text-sm font-bold text-[#101114]">这是首次资料提交，当前暂无已生效资料，右侧内容均视为新增。</div>}
                <div className="space-y-3">
                  {diffFields.map(field => {
                    const changed = hasChanged(field.key);
                    return (
                      <div key={field.key} className={`grid grid-cols-1 gap-3 border-2 p-4 md:grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)] ${changed ? 'border-[#ff5a45] bg-[#ff5a45]/5' : 'border-[#101114]/15 bg-white'}`}>
                        <div className="flex items-start gap-2 pt-1 text-sm font-black text-[#101114]">{field.label}{changed && <span className="whitespace-nowrap border border-[#101114] bg-[#ff5a45] px-1.5 py-0.5 text-[10px] font-black text-white">已改动</span>}</div>
                        <div className="min-w-0 border border-[#101114]/20 bg-[#f7f4ec] p-3"><div className="mb-2 text-[11px] font-black text-[#777871]">当前资料</div><div className="break-words text-sm text-[#54564f]">{renderValue(field.key, current[field.key])}</div></div>
                        <div className={`min-w-0 border border-[#101114]/20 p-3 ${changed ? 'bg-[#d9ff4f]/40' : 'bg-[#f7f4ec]'}`}><div className="mb-2 text-[11px] font-black text-[#777871]">本次提交</div><div className="break-words text-sm text-[#101114]">{renderValue(field.key, draft[field.key])}</div></div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t-2 border-[#101114] bg-[#f7f4ec] px-6 py-4">
                <button type="button" onClick={() => setSelectedAudit(null)} className={BTN_GHOST}>关闭</button>
                {selectedAudit.status === 'pending' && (
                  <>
                    <button type="button" onClick={() => handleReject(selectedAudit.id)} className={BTN_DANGER}>审核不通过</button>
                    <button type="button" onClick={() => { const auditId = selectedAudit.id; setSelectedAudit(null); handleApprove(auditId); }} className={BTN_LIME}>审核通过</button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      setToast({ message: e.detail.msg, type: e.detail.type });
      setTimeout(() => setToast(null), 3000);
    };
    window.addEventListener('show-toast', handler);
    return () => window.removeEventListener('show-toast', handler);
  }, []);

  const [currentMenu, setCurrentMenu] = useState<'dispatch' | 'tutors' | 'audit' | 'courses'>('tutors');
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => (typeof window === 'undefined' ? true : window.innerWidth >= 1024));

  // Modals and API state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({ name: '', email: '', password: '', role: 'tutor' as 'manager' | 'tutor', note: '' });
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [editingTutorId, setEditingTutorId] = useState<string | null>(null);

  const navigate = useNavigate();

  const token = localStorage.getItem('manju_token');
  const currentUserStr = localStorage.getItem('manju_user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        showToastMsg('登录过期或权限不足，请重新登录', 'error');
        localStorage.removeItem('manju_token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (currentMenu === 'tutors') {
      fetchUsers();
    }
  }, [currentMenu, token, navigate]);

  const handleTogglePublish = async (user: SystemUser) => {
    try {
      await axios.put(`/api/admin/users/${user.id}/publish`, { isPublished: !user.is_published }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToastMsg(user.is_published ? '已下架隐藏' : '已上架展厅', 'success');
      fetchUsers();
    } catch (err: any) {
      showToastMsg(err.response?.data?.error || '操作失败', 'error');
    }
  };

  const handleToggleFeatured = async (user: SystemUser) => {
    try {
      await axios.put(`/api/admin/users/${user.id}/featured`, { isFeatured: !user.is_featured }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToastMsg(user.is_featured ? '已取消首页精选' : '已设为首页精选', 'success');
      fetchUsers();
    } catch (err: any) {
      showToastMsg(err.response?.data?.error || '精选操作失败', 'error');
    }
  };

  const handleToggleStatus = async (user: SystemUser) => {
    try {
      const newStatus = user.status === 'active' ? 'disabled' : 'active';
      await axios.put(`/api/admin/users/${user.id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      showToastMsg('状态更新失败', 'error');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword || newPassword.length < 6) {
      showToastMsg('密码长度至少6位', 'error');
      return;
    }
    try {
      await axios.post(`/api/admin/users/${selectedUser.id}/reset-password`, { newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToastMsg('密码重置成功', 'success');
      setResetModalOpen(false);
      setNewPassword('');
    } catch (err) {
      showToastMsg('密码重置失败', 'error');
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedUser) return;
    try {
      await axios.put(`/api/admin/users/${selectedUser.id}/note`, { note: noteText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      setNoteModalOpen(false);
    } catch (err) {
      showToastMsg('备注更新失败', 'error');
    }
  };

  const handleCreateUser = async () => {
    const { name, email, password, role, note } = createUserForm;
    if (!name.trim() || !email.trim() || !password) {
      showToastMsg('请完整填写用户名称、邮箱和密码', 'error');
      return;
    }
    if (password.length < 6) {
      showToastMsg('密码长度至少6位', 'error');
      return;
    }
    try {
      await axios.post('/api/admin/users', { name, email, password, role, note }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToastMsg('用户添加成功', 'success');
      setCreateUserModalOpen(false);
      setCreateUserForm({ name: '', email: '', password: '', role: 'tutor', note: '' });
      setShowCreatePassword(false);
      fetchUsers();
    } catch (err: any) {
      showToastMsg(err.response?.data?.error || '用户添加失败', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('manju_token');
    localStorage.removeItem('manju_user');
    navigate('/login');
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || (u.note && u.note.toLowerCase().includes(q));
  });

  const menuTitle = currentMenu === 'tutors' ? '全局用户管理' : currentMenu === 'dispatch' ? '学员报名分配' : currentMenu === 'courses' ? '课程管理' : '导师资料审核';
  const menuSection = currentMenu === 'tutors' ? '系统管理 / 用户' : currentMenu === 'dispatch' ? '学员分配 / 线索池' : currentMenu === 'courses' ? '内容管理 / 课程' : '导师审核 / 资料改动';

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'superadmin': return <StatusTag tone="coral"><ShieldAlert size={13} /> 超级管理员</StatusTag>;
      case 'manager': return <StatusTag tone="ink"><Shield size={13} /> 平台管理员</StatusTag>;
      case 'tutor': return <StatusTag tone="plain"><Users size={13} /> 入驻导师</StatusTag>;
    }
  };

  const navItems: { key: 'audit' | 'dispatch' | 'courses' | 'tutors'; label: string; icon: React.ReactNode }[] = [
    { key: 'audit', label: '导师资料审核', icon: <ShieldCheck size={17} /> },
    { key: 'dispatch', label: '学员报名分配', icon: <UserPlus size={17} /> },
    { key: 'courses', label: '课程管理', icon: <BookOpen size={17} /> },
    { key: 'tutors', label: '全局用户管理', icon: <Users size={17} /> }
  ];

  const SidebarContent = () => (
    <>
      <button type="button" onClick={() => navigate('/')} className="flex h-[70px] shrink-0 items-center gap-3 border-b-2 border-[#101114]/15 px-5 text-left font-black">
        <span className="grid h-8 w-8 -rotate-3 place-items-center bg-[#d9ff4f] text-xs text-[#101114]">漫</span>
        <span className="text-base tracking-tight text-white">管理工作台</span>
      </button>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-2 mt-2 px-2 text-[11px] font-black uppercase tracking-wider text-white/40">系统管理</p>
        <nav className="flex flex-col gap-1.5">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => { setCurrentMenu(item.key); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-3 text-sm font-bold transition-colors ${currentMenu === item.key ? 'bg-[#d9ff4f] text-[#101114]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
          <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-3 py-3 text-sm font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white">
            <ExternalLink size={17} /> 查看导师展示页
          </button>
        </nav>
      </div>
      <div className="shrink-0 border-t-2 border-white/15 p-4">
        <div className="mb-3 flex items-center gap-3 px-1">
          <div className="grid h-9 w-9 shrink-0 place-items-center border-2 border-[#d9ff4f] text-sm font-black text-[#d9ff4f]">
            {currentUser?.name?.charAt(0) || '管'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-white">{currentUser?.name}</p>
            <p className="truncate text-xs text-white/50">{currentUser?.role === 'superadmin' ? '超级管理员' : currentUser?.role === 'manager' ? '平台管理员' : '入驻导师'}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-bold text-white/70 transition-colors hover:bg-[#ff5a45] hover:text-white">
          <LogOut size={17} /> 退出登录
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f7f4ec] font-sans text-[#101114]">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <nav className="sticky top-0 z-40 border-b-2 border-[#101114] bg-[#f7f4ec]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1600px] items-center justify-between gap-4 px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="border-2 border-[#101114] bg-white p-2 lg:hidden" aria-label="打开菜单">
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 -rotate-3 place-items-center bg-[#101114] text-xs font-black text-[#d9ff4f]">AI</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black leading-tight">漫剧工作流 · 管理后台</p>
                <p className="truncate text-[11px] font-bold text-[#777871]">{menuSection}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {currentMenu === 'tutors' && (
              <>
                <div className="relative hidden w-64 sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777871]" size={15} />
                  <input
                    type="text"
                    placeholder="搜索用户名、邮箱、备注..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border-2 border-[#101114] bg-white py-2 pl-9 pr-3 text-sm text-[#101114] outline-none transition-colors placeholder:text-[#8b8d85] focus:border-[#ff5a45]"
                  />
                </div>
                <button onClick={() => setCreateUserModalOpen(true)} className={BTN_DARK}><UserPlus size={15} /> 添加用户</button>
              </>
            )}
            <button onClick={() => navigate('/')} className={`${BTN_GHOST} hidden md:inline-flex`}><ArrowLeft size={15} /> 返回首页</button>
          </div>
        </div>
      </nav>

      <div className="overflow-hidden border-b-2 border-[#101114] bg-[#d9ff4f]">
        <div className="ticker-line whitespace-nowrap py-2.5 text-xs font-black">导师资料审核 · 学员报名分配 · 全局用户管理 · 上架展厅 · 首页精选 · 导师资料审核 · 学员报名分配 · 全局用户管理 · 上架展厅 · 首页精选 · </div>
      </div>

      <div className="flex items-stretch">
        {/* 桌面端侧边栏 */}
        <aside className="hidden w-[260px] shrink-0 border-r-2 border-[#101114] bg-[#101114] lg:sticky lg:top-[70px] lg:flex lg:h-[calc(100vh-70px)] lg:flex-col lg:self-start">
          <SidebarContent />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="hidden shrink-0 items-center justify-between gap-4 border-b-2 border-[#101114] bg-white px-6 py-4 lg:flex">
            <h1 className="text-xl font-black tracking-tight">{menuTitle}</h1>
            <div className="flex items-center gap-2 text-[11px] font-black text-[#54564f]">
              <span className="border-2 border-[#101114] bg-[#d9ff4f] px-2.5 py-1 text-[#101114]">当前菜单</span>
              <span className="border-2 border-[#101114] px-2.5 py-1">{menuSection}</span>
            </div>
          </header>

          <div className="flex-1 p-4 md:p-6">
            {currentMenu === 'tutors' && (
              <div className="space-y-6">
                <div className="lg:hidden">
                  <span className="text-xs font-bold text-[#777871]">系统管理 / 用户</span>
                  <h2 className="mt-1 text-2xl font-black tracking-tight">全局用户管理</h2>
                </div>

                <div className="relative sm:hidden">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777871]" size={15} />
                  <input
                    type="text"
                    placeholder="搜索用户名、邮箱、备注..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border-2 border-[#101114] bg-white py-2 pl-9 pr-3 text-sm text-[#101114] outline-none transition-colors placeholder:text-[#8b8d85] focus:border-[#ff5a45]"
                  />
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
                          <th className="min-w-[180px] px-4 py-4 md:px-5">账号 / 邮箱</th>
                          <th className="min-w-[120px] px-4 py-4 md:px-5">系统角色</th>
                          <th className="min-w-[100px] px-4 py-4 md:px-5">状态</th>
                          <th className="min-w-[200px] px-4 py-4 md:px-5">管理备注</th>
                          <th className="min-w-[100px] px-4 py-4 md:px-5">最后活跃</th>
                          <th className="min-w-[180px] px-4 py-4 text-right md:px-5">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr><td colSpan={6} className="px-6 py-12 text-center font-bold text-[#777871]">没有找到匹配的用户</td></tr>
                        ) : (
                          filteredUsers.map((user) => (
                            <tr key={user.id} className={`${TABLE_ROW} ${user.status === 'disabled' ? 'bg-[#101114]/5' : ''}`}>
                              <td className="px-4 py-4 md:px-5">
                                <div className="mb-0.5 text-sm font-black text-[#101114]">{user.name}</div>
                                <div className="text-xs text-[#777871]">{user.email}</div>
                              </td>
                              <td className="px-4 py-4 md:px-5">{getRoleBadge(user.role)}</td>
                              <td className="px-4 py-4 md:px-5">
                                {user.status === 'active'
                                  ? <StatusTag tone="lime"><span className="h-1.5 w-1.5 bg-[#101114]"></span> 正常</StatusTag>
                                  : <StatusTag tone="coral"><span className="h-1.5 w-1.5 bg-white"></span> 已封禁</StatusTag>}
                              </td>
                              <td className="px-4 py-4 md:px-5">
                                <button
                                  type="button"
                                  onClick={() => { setSelectedUser(user); setNoteText(user.note || ''); setNoteModalOpen(true); }}
                                  className="max-w-[150px] truncate text-left text-xs italic text-[#54564f] underline decoration-dotted underline-offset-4 hover:text-[#ff5a45]"
                                  title={user.note || '点击添加备注'}
                                >
                                  {user.note || '点击添加备注'}
                                </button>
                              </td>
                              <td className="px-4 py-4 text-xs text-[#777871] md:px-5">
                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '从未登录'}
                              </td>
                              <td className="px-4 py-4 text-right md:px-5">
                                {(currentUser?.role === 'superadmin' || user.role === 'tutor') ? (
                                  <div className="flex items-center justify-end gap-2">
                                    {user.role === 'tutor' && (
                                      <button onClick={() => setEditingTutorId(user.id)} className={`${BTN_SM} !border-[#101114] !bg-[#d9ff4f] !text-[#101114]`}><Pencil size={13} /> 编辑资料</button>
                                    )}
                                    <button onClick={() => { setSelectedUser(user); setResetModalOpen(true); }} className={BTN_SM}>重置密码</button>
                                    <button onClick={() => handleToggleStatus(user)} className={user.status === 'active' ? BTN_SM : `${BTN_SM} !border-[#101114] !bg-[#d9ff4f] !text-[#101114]`}>
                                      {user.status === 'active' ? '禁用账号' : '解封账号'}
                                    </button>
                                    {user.role === 'tutor' && user.is_published !== null && (
                                      <button onClick={() => handleTogglePublish(user)} className={user.is_published ? BTN_SM : `${BTN_SM} !bg-[#ff5a45] !text-white`}>
                                        {user.is_published ? '下架隐藏' : '上架展厅'}
                                      </button>
                                    )}
                                    {user.role === 'tutor' && user.is_published && (
                                      <button onClick={() => handleToggleFeatured(user)} className={user.is_featured ? `${BTN_SM} !bg-[#101114] !text-[#d9ff4f]` : BTN_SM}>
                                        {user.is_featured ? '取消精选' : '首页精选'}
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="whitespace-nowrap border-2 border-[#101114]/20 bg-[#f7f4ec] px-2 py-1 text-[10px] font-bold text-[#777871]">受保护记录</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {currentMenu === 'dispatch' && <DispatchCenter token={token} />}
            {currentMenu === 'audit' && <AuditCenter token={token} />}
            {currentMenu === 'courses' && <CourseManager token={token} />}
          </div>
        </main>
      </div>

      {/* 管理员直接编辑导师资料 */}
      <TutorEditor
        userId={editingTutorId}
        token={token}
        onClose={() => setEditingTutorId(null)}
        onSaved={fetchUsers}
        onNotify={showToastMsg}
      />

      {/* 移动端侧边栏 */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-40 bg-[#101114]/60 lg:hidden" />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && !isDesktop && (
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r-2 border-[#101114] bg-[#101114] lg:hidden">
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {createUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101114]/60 p-4" onClick={() => setCreateUserModalOpen(false)}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} onClick={event => event.stopPropagation()} className="w-full max-w-md overflow-hidden border-2 border-[#101114] bg-white shadow-[10px_10px_0_#101114]">
              <div className="flex items-center justify-between border-b-2 border-[#101114] bg-[#f7f4ec] px-5 py-4">
                <div>
                  <h3 className="text-lg font-black text-[#101114]">添加用户</h3>
                  <p className="mt-1 text-xs font-bold text-[#777871]">创建后账号可直接登录系统</p>
                </div>
                <button type="button" onClick={() => setCreateUserModalOpen(false)} aria-label="关闭添加用户" className="border-2 border-[#101114] bg-white p-1.5 transition-colors hover:bg-[#101114] hover:text-white"><X size={16} /></button>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <label className={FIELD_LABEL}>用户名称</label>
                  <input value={createUserForm.name} onChange={event => setCreateUserForm({ ...createUserForm, name: event.target.value })} placeholder="请输入用户名称" className={INPUT} />
                </div>
                <div>
                  <label className={FIELD_LABEL}>邮箱账号</label>
                  <input type="email" value={createUserForm.email} onChange={event => setCreateUserForm({ ...createUserForm, email: event.target.value })} placeholder="请输入邮箱" className={INPUT} />
                </div>
                <div>
                  <label className={FIELD_LABEL}>初始密码</label>
                  <div className="relative">
                    <input type={showCreatePassword ? 'text' : 'password'} value={createUserForm.password} onChange={event => setCreateUserForm({ ...createUserForm, password: event.target.value })} placeholder="至少6位字符" className={`${INPUT} pr-10`} />
                    <button type="button" onClick={() => setShowCreatePassword(!showCreatePassword)} aria-label={showCreatePassword ? '隐藏密码' : '显示密码'} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777871] hover:text-[#101114]">
                      {showCreatePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={FIELD_LABEL}>用户角色</label>
                  <select value={createUserForm.role} onChange={event => setCreateUserForm({ ...createUserForm, role: event.target.value as 'manager' | 'tutor' })} disabled={currentUser?.role === 'manager'} className={`${INPUT} disabled:cursor-not-allowed disabled:bg-[#f7f4ec] disabled:text-[#777871]`}>
                    <option value="tutor">导师</option>
                    {currentUser?.role === 'superadmin' && <option value="manager">管理员</option>}
                  </select>
                  {currentUser?.role === 'manager' && <p className="mt-1 text-xs font-bold text-[#777871]">管理员仅可创建导师账号</p>}
                </div>
                <div>
                  <label className={FIELD_LABEL}>管理备注（可选）</label>
                  <textarea value={createUserForm.note} onChange={event => setCreateUserForm({ ...createUserForm, note: event.target.value })} placeholder="填写内部管理备注" rows={3} className={`${INPUT} resize-none`} />
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t-2 border-[#101114] bg-[#f7f4ec] px-5 py-4">
                <button type="button" onClick={() => setCreateUserModalOpen(false)} className={BTN_GHOST}>取消</button>
                <button type="button" onClick={handleCreateUser} className={BTN_DARK}>确认添加</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {resetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101114]/60 p-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="w-full max-w-sm overflow-hidden border-2 border-[#101114] bg-white shadow-[10px_10px_0_#101114]">
              <div className="border-b-2 border-[#101114] bg-[#f7f4ec] p-5">
                <h3 className="text-lg font-black text-[#101114]">重置密码</h3>
                <p className="mt-1 text-xs font-bold text-[#777871]">正在为 {selectedUser?.name} ({selectedUser?.email}) 重置密码</p>
              </div>
              <div className="relative p-5">
                <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="输入新密码 (最少6位)" className={`${INPUT} pr-10`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? '隐藏密码' : '显示密码'} className="absolute right-8 top-1/2 -translate-y-1/2 text-[#777871] hover:text-[#101114]">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end gap-3 border-t-2 border-[#101114] bg-[#f7f4ec] p-4">
                <button onClick={() => { setResetModalOpen(false); setNewPassword(''); setShowPassword(false); }} className={BTN_GHOST}>取消</button>
                <button onClick={handleResetPassword} className={BTN_DARK}>确认重置</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Note Edit Modal */}
      <AnimatePresence>
        {noteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101114]/60 p-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="w-full max-w-sm overflow-hidden border-2 border-[#101114] bg-white shadow-[10px_10px_0_#101114]">
              <div className="border-b-2 border-[#101114] bg-[#f7f4ec] p-5">
                <h3 className="text-lg font-black text-[#101114]">编辑备注</h3>
                <p className="mt-1 text-xs font-bold text-[#777871]">正在编辑 {selectedUser?.name} 的管理备注</p>
              </div>
              <div className="p-5">
                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="输入备注信息..." rows={3} className={`${INPUT} resize-none`} />
              </div>
              <div className="flex justify-end gap-3 border-t-2 border-[#101114] bg-[#f7f4ec] p-4">
                <button onClick={() => setNoteModalOpen(false)} className={BTN_GHOST}>取消</button>
                <button onClick={handleUpdateNote} className={BTN_DARK}>保存</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
