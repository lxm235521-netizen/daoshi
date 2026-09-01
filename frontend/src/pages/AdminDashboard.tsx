import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, ShieldCheck, Shield, ShieldAlert, LogOut, Menu, Eye, EyeOff, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

type Role = 'superadmin' | 'manager' | 'tutor';
type AccountStatus = 'active' | 'disabled';

interface SystemUser { id: string; email: string; name: string; role: Role; status: AccountStatus; note: string; lastLogin: string; is_published: boolean | null; }


const Toast = ({ message, type }: { message: string, type: 'success' | 'error' }) => (
  <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 border transition-all animate-in fade-in slide-in-from-top-4 ${type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
    {type === 'success' ? <ShieldCheck size={18} className="text-green-600" /> : <ShieldAlert size={18} className="text-red-600" />}
    <span className="font-medium text-sm">{message}</span>
  </div>
);




const DispatchCenter = ({ token }: { token: string | null }) => {
  // Removed unused toast in AdminDashboard temporarily
  
  const [leads, setLeads] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterWechat, setFilterWechat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterIntent, setFilterIntent] = useState('');
  const [filterAssigned, setFilterAssigned] = useState('');

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

    if (filterWechat && !contact.includes(filterWechat.toLowerCase())) return false;
    if (filterStatus && lead.status !== filterStatus) return false;
    if (filterIntent && !intentName.includes(filterIntent.toLowerCase())) return false;
    if (filterAssigned && !assignedName.includes(filterAssigned.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Delegated to GlobalToast */}
      
      {/* Search Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs text-gray-500 mb-1">联系方式</label>
          <input type="text" value={filterWechat} onChange={e => setFilterWechat(e.target.value)} placeholder="搜索微信/QQ..." className="w-full px-3 py-1.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs text-gray-500 mb-1">状态</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full px-3 py-1.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500">
            <option value="">全部</option>
            <option value="pending">待分配</option>
            <option value="assigned">已分配</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs text-gray-500 mb-1">学员意向导师</label>
          <input type="text" value={filterIntent} onChange={e => setFilterIntent(e.target.value)} placeholder="搜索意向导师名称..." className="w-full px-3 py-1.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs text-gray-500 mb-1">分配导师</label>
          <input type="text" value={filterAssigned} onChange={e => setFilterAssigned(e.target.value)} placeholder="搜索分配导师名称..." className="w-full px-3 py-1.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
        </div>
        <div className="min-w-[80px]">
          <button onClick={() => { setFilterWechat(''); setFilterStatus(''); setFilterIntent(''); setFilterAssigned(''); }} className="w-full px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium transition-colors">重置</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-48 text-blue-600"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>
        ) : (
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">联系方式</th>
                <th className="px-6 py-4 font-semibold">需求方向</th>
                <th className="px-6 py-4 font-semibold">基础水平</th>
                <th className="px-6 py-4 font-semibold">状态</th>
                <th className="px-6 py-4 font-semibold">学员意向导师</th>
                <th className="px-6 py-4 font-semibold">报名时间</th>
                <th className="px-6 py-4 font-semibold text-right">分配导师</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 text-gray-900">{lead.wechat_qq || '未提供'}</td>
                  <td className="px-6 py-4 text-gray-500">{lead.learning_request}</td>
                  <td className="px-6 py-4 text-gray-500">{lead.level}</td>
                  <td className="px-6 py-4">
                    {lead.status === 'pending' ? <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-medium border border-yellow-200">待分配</span> : <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-medium border border-green-200">已分配</span>}
                  </td>
                  <td className="px-6 py-4 text-purple-600 font-medium">
                    {lead.intent_tutor_name || <span className="text-gray-400 italic">未选择</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{new Date(lead.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select 
                        id={`select-${lead.id}`}
                        defaultValue={lead.assigned_tutor_id || lead.intent_tutor_id || ''} 
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded focus:ring-blue-500 focus:border-blue-500 px-2 py-1.5 cursor-pointer outline-none w-32"
                      >
                        <option value="" disabled>选择导师</option>
                        {tutors.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => {
                          const val = (document.getElementById(`select-${lead.id}`) as HTMLSelectElement).value;
                          if(val) handleAssign(lead.id, val);
                        }}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors shadow-sm"
                      >
                        {lead.status === 'assigned' ? '重新分配' : '确认分配'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">没有找到匹配的线索</td></tr>}
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
      return value ? <img src={value} alt="导师头像" className="h-16 w-16 rounded-full border border-gray-200 object-cover" /> : <span className="text-gray-400">未设置</span>;
    }
    if (field === 'tags') return formatTags(value) || <span className="text-gray-400">未设置</span>;
    if (field === 'works') {
      const works = formatWorks(value);
      return works.length
        ? <div className="space-y-1">{works.map((work, index) => <div key={`${work}-${index}`} className="truncate rounded bg-gray-50 px-2 py-1 text-xs text-gray-600">{work}</div>)}</div>
        : <span className="text-gray-400">暂无作品</span>;
    }
    return value || <span className="text-gray-400">未填写</span>;
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
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Search Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs text-gray-500 mb-1">导师名称</label>
          <input type="text" value={filterName} onChange={e => setFilterName(e.target.value)} placeholder="搜索导师..." className="w-full px-3 py-1.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs text-gray-500 mb-1">状态</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full px-3 py-1.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500">
            <option value="">全部</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">未通过</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs text-gray-500 mb-1">审核类型</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full px-3 py-1.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500">
            <option value="">全部类型</option>
            <option value="first_publish">首次入驻资料</option>
            <option value="profile_update">资料修改</option>
          </select>
        </div>
        <div className="min-w-[80px]">
          <button onClick={() => { setFilterName(''); setFilterStatus(''); setFilterType(''); }} className="w-full px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium transition-colors">重置</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-48 text-blue-600"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>
        ) : (
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">导师名称</th>
                <th className="px-6 py-4 font-semibold">审核类型</th>
                <th className="px-6 py-4 font-semibold">状态</th>
                <th className="px-6 py-4 font-semibold">提交时间</th>
                <th className="px-6 py-4 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAudits.map(audit => (
                <tr key={audit.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{audit.tutor_name} <span className="text-xs text-gray-500 ml-2">({audit.tutor_email})</span></td>
                  <td className="px-6 py-4 text-gray-500">{audit.type === 'first_publish' ? '首次入驻资料' : '资料修改'}</td>
                  <td className="px-6 py-4">
                    {audit.status === 'pending' ? <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-medium border border-yellow-200">待审核</span> : audit.status === 'rejected' ? <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-medium border border-red-200">未通过</span> : <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-medium border border-green-200">已通过</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{new Date(audit.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    {audit.status === 'pending' && <button onClick={() => setSelectedAudit(audit)} className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors shadow-sm"><Eye size={14} /> 查看改动</button>}
                  </td>
                </tr>
              ))}
              {filteredAudits.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">没有找到匹配的审核项</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {selectedAudit && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAudit(null)}>
            <motion.div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} onClick={event => event.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">资料改动对比</h3>
                  <p className="mt-1 text-xs text-gray-500">{selectedAudit.tutor_name} · {selectedAudit.type === 'first_publish' ? '首次入驻资料' : '资料修改'}</p>
                </div>
                <button type="button" onClick={() => setSelectedAudit(null)} aria-label="关闭资料改动对比" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X size={20} /></button>
              </div>
              <div className="overflow-y-auto p-6">
                <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="rounded-full bg-gray-100 px-3 py-1.5">左侧：当前已生效资料</span>
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">右侧：本次提交资料</span>
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">高亮项：存在改动</span>
                </div>
                {!selectedAudit.current_profile && <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">这是首次资料提交，当前暂无已生效资料，右侧内容均视为新增。</div>}
                <div className="space-y-3">
                  {diffFields.map(field => {
                    const changed = hasChanged(field.key);
                    return (
                      <div key={field.key} className={`grid grid-cols-1 gap-3 rounded-xl border p-4 md:grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)] ${changed ? 'border-amber-200 bg-amber-50/40' : 'border-gray-200 bg-white'}`}>
                        <div className="flex items-start gap-2 pt-1 text-sm font-semibold text-gray-700">{field.label}{changed && <span className="whitespace-nowrap rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">已改动</span>}</div>
                        <div className="min-w-0 rounded-lg bg-gray-50 p-3"><div className="mb-2 text-[11px] font-medium text-gray-400">当前资料</div><div className="break-words text-sm text-gray-700">{renderValue(field.key, current[field.key])}</div></div>
                        <div className={`min-w-0 rounded-lg p-3 ${changed ? 'bg-amber-50' : 'bg-gray-50'}`}><div className="mb-2 text-[11px] font-medium text-gray-400">本次提交</div><div className="break-words text-sm text-gray-700">{renderValue(field.key, draft[field.key])}</div></div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
                <button type="button" onClick={() => setSelectedAudit(null)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">关闭</button>
                {selectedAudit.status === 'pending' && <><button type="button" onClick={() => handleReject(selectedAudit.id)} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100">审核不通过</button><button type="button" onClick={() => { const auditId = selectedAudit.id; setSelectedAudit(null); handleApprove(auditId); }} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">审核通过</button></>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const showToastMsg = (msg: string, type: 'success' | 'error' = 'success') => {
  const evt = new CustomEvent('show-toast', { detail: { msg, type } });
  window.dispatchEvent(evt);
};

export const AdminDashboard: React.FC = () => {
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      setToast({ message: e.detail.msg, type: e.detail.type });
      setTimeout(() => setToast(null), 3000);
    };
    window.addEventListener('show-toast', handler);
    return () => window.removeEventListener('show-toast', handler);
  }, []);

    
  const [currentMenu, setCurrentMenu] = useState<'dispatch' | 'tutors' | 'audit'>('tutors');
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  const navigate = useNavigate();

  const token = localStorage.getItem('manju_token');
  const currentUserStr = localStorage.getItem('manju_user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

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

  const getRoleBadge = (role: Role) => {
    switch(role) {
      case 'superadmin': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-600 border border-red-100 text-xs font-bold tracking-wide whitespace-nowrap"><ShieldAlert size={14}/> 超级管理员</span>;
      case 'manager': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100 text-xs font-medium whitespace-nowrap"><Shield size={14}/> 平台管理员</span>;
      case 'tutor': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 border border-gray-200 text-xs font-medium whitespace-nowrap"><Users size={14}/> 入驻导师</span>;
    }
  };

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
        <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white mr-3"><span className="font-bold text-sm">漫</span></div>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">管理工作台</h1>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">系统管理</p>
        <nav className="flex flex-col gap-1">
          <button onClick={() => {setCurrentMenu('audit'); setMobileMenuOpen(false);}} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-sm ${currentMenu === 'audit' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <ShieldCheck size={18} className={currentMenu === 'audit' ? 'text-blue-600' : 'text-gray-400'} /> 导师资料审核
          </button>
          <button onClick={() => {setCurrentMenu('dispatch'); setMobileMenuOpen(false);}} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-sm ${currentMenu === 'dispatch' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <UserPlus size={18} className={currentMenu === 'dispatch' ? 'text-blue-600' : 'text-gray-400'} /> 学员报名分配
          </button>
          <button onClick={() => {setCurrentMenu('tutors'); setMobileMenuOpen(false);}} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-sm ${currentMenu === 'tutors' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <Users size={18} className={currentMenu === 'tutors' ? 'text-blue-600' : 'text-gray-400'} /> 全局用户管理
          </button>
          <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors text-sm">
            <ExternalLink size={18} className="text-gray-400" /> 查看导师展示页
          </button>
        </nav>
      </div>
      <div className="p-4 border-t border-gray-100 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
            {currentUser?.name?.charAt(0) || '管'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name}</p>
            <p className="text-xs text-gray-500 truncate">{currentUser?.role === 'superadmin' ? '超级管理员' : currentUser?.role === 'manager' ? '平台管理员' : '入驻导师'}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors text-sm">
          <LogOut size={18} /> 退出登录
        </button>
      </div>
    </>
  );

  return (
    <div className="admin-shell min-h-screen bg-gray-50 flex font-sans">
      {toast && <Toast message={toast.message} type={toast.type} />}
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden" />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(mobileMenuOpen || window.innerWidth >= 1024) && (
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="admin-sidebar fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-100 flex flex-col shadow-xl lg:shadow-none">
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="admin-header h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {currentMenu === 'tutors' ? '全局用户管理' : currentMenu === 'dispatch' ? '学员报名分配' : '导师资料审核'}
            </h2>
          </div>
          {currentMenu === 'tutors' && <div className="flex items-center gap-3"><div className="relative w-64 hidden sm:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="text" placeholder="搜索用户名、邮箱、备注..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400" /></div><button onClick={() => setCreateUserModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"><UserPlus size={16} /> 添加用户</button></div>}
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {currentMenu === 'tutors' && (
            <div className="max-w-7xl mx-auto space-y-6">
               <div className="sm:hidden relative mb-4">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                 <input type="text" placeholder="搜索用户名、邮箱、备注..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400" />
               </div>

               <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                 {loading ? (
                   <div className="flex justify-center items-center h-48 text-blue-600">
                     <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                   </div>
                 ) : (
                   <table className="w-full text-sm text-left whitespace-nowrap">
                     <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase tracking-wider">
                       <tr>
                         <th className="px-4 md:px-6 py-4 font-semibold min-w-[180px]">账号 / 邮箱</th>
                         <th className="px-4 md:px-6 py-4 font-semibold min-w-[120px]">系统角色</th>
                         <th className="px-4 md:px-6 py-4 font-semibold min-w-[100px]">状态</th>
                         <th className="px-4 md:px-6 py-4 font-semibold min-w-[200px]">管理备注</th>
                         <th className="px-4 md:px-6 py-4 font-semibold min-w-[100px]">最后活跃</th>
                         <th className="px-4 md:px-6 py-4 font-semibold text-right min-w-[180px]">操作</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                       {filteredUsers.length === 0 ? (
                         <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">没有找到匹配的用户</td></tr>
                       ) : (
                         filteredUsers.map((user) => (
                           <tr key={user.id} className={`${user.status === 'disabled' ? 'bg-gray-50/50' : 'hover:bg-blue-50/30'} transition-colors group`}>
                             <td className="px-4 md:px-6 py-4">
                               <div className="font-semibold text-gray-900 text-sm mb-0.5">{user.name}</div>
                               <div className="text-xs text-gray-500">{user.email}</div>
                             </td>
                             <td className="px-4 md:px-6 py-4">{getRoleBadge(user.role)}</td>
                             <td className="px-4 md:px-6 py-4">
                               <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${user.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                 <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                 {user.status === 'active' ? '正常' : '已封禁'}
                               </span>
                             </td>
                             <td className="px-4 md:px-6 py-4">
                               <div className="group/note flex items-center gap-2 cursor-pointer" onClick={() => { setSelectedUser(user); setNoteText(user.note || ''); setNoteModalOpen(true); }}>
                                 <div className="text-gray-500 text-xs italic max-w-[150px] truncate" title={user.note || '点击添加备注'}>{user.note || '点击添加备注'}</div>
                               </div>
                             </td>
                             <td className="px-4 md:px-6 py-4 text-xs text-gray-500">
                               {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '从未登录'}
                             </td>
                             <td className="px-4 md:px-6 py-4 text-right space-x-2">
                                 {(currentUser?.role === 'superadmin' || user.role === 'tutor') ? (
                                   <div className="flex items-center justify-end gap-2 opacity-100">
                                     <button onClick={() => { setSelectedUser(user); setResetModalOpen(true); }} className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">重置密码</button>
                                     <button onClick={() => handleToggleStatus(user)} className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border transition-colors shadow-sm ${user.status === 'active' ? 'border-gray-200 bg-white text-red-600 hover:bg-red-50' : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'}`}>
                                       {user.status === 'active' ? '禁用账号' : '解封账号'}
                                     </button>
                                     {user.role === 'tutor' && user.is_published !== null && (
                                       <button onClick={() => handleTogglePublish(user)} className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border transition-colors shadow-sm ${user.is_published ? 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                                         {user.is_published ? '下架隐藏' : '上架展厅'}
                                       </button>
                                     )}
                                   </div>
                                 ) : (
                                   <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded border border-gray-100 whitespace-nowrap">受保护记录</span>
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
        </div>
      </main>

      <AnimatePresence>
        {createUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setCreateUserModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} onClick={event => event.stopPropagation()} className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div><h3 className="text-lg font-bold text-gray-900">添加用户</h3><p className="mt-1 text-xs text-gray-500">创建后账号可直接登录系统</p></div>
                <button type="button" onClick={() => setCreateUserModalOpen(false)} aria-label="关闭添加用户" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><span className="text-xl leading-none">×</span></button>
              </div>
              <div className="space-y-4 p-5">
                <div><label className="mb-1 block text-xs font-medium text-gray-600">用户名称</label><input value={createUserForm.name} onChange={event => setCreateUserForm({ ...createUserForm, name: event.target.value })} placeholder="请输入用户名称" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:bg-white" /></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">邮箱账号</label><input type="email" value={createUserForm.email} onChange={event => setCreateUserForm({ ...createUserForm, email: event.target.value })} placeholder="请输入邮箱" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:bg-white" /></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">初始密码</label><div className="relative"><input type={showCreatePassword ? 'text' : 'password'} value={createUserForm.password} onChange={event => setCreateUserForm({ ...createUserForm, password: event.target.value })} placeholder="至少6位字符" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 pr-10 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:bg-white" /><button type="button" onClick={() => setShowCreatePassword(!showCreatePassword)} aria-label={showCreatePassword ? '隐藏密码' : '显示密码'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">{showCreatePassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">用户角色</label><select value={createUserForm.role} onChange={event => setCreateUserForm({ ...createUserForm, role: event.target.value as 'manager' | 'tutor' })} disabled={currentUser?.role === 'manager'} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:bg-white disabled:cursor-not-allowed disabled:text-gray-500"><option value="tutor">导师</option>{currentUser?.role === 'superadmin' && <option value="manager">管理员</option>}</select>{currentUser?.role === 'manager' && <p className="mt-1 text-xs text-gray-400">管理员仅可创建导师账号</p>}</div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">管理备注（可选）</label><textarea value={createUserForm.note} onChange={event => setCreateUserForm({ ...createUserForm, note: event.target.value })} placeholder="填写内部管理备注" rows={3} className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:bg-white" /></div>
              </div>
              <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4"><button type="button" onClick={() => setCreateUserModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">取消</button><button type="button" onClick={handleCreateUser} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">确认添加</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {resetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">重置密码</h3>
                <p className="text-xs text-gray-500 mt-1">正在为 {selectedUser?.name} ({selectedUser?.email}) 重置密码</p>
              </div>
              <div className="p-5 relative">
                <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="输入新密码 (最少6位)" className="w-full px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                <button onClick={() => { setResetModalOpen(false); setNewPassword(''); setShowPassword(false); }} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">取消</button>
                <button onClick={handleResetPassword} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">确认重置</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Note Edit Modal */}
      <AnimatePresence>
        {noteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">编辑备注</h3>
                <p className="text-xs text-gray-500 mt-1">正在编辑 {selectedUser?.name} 的管理备注</p>
              </div>
              <div className="p-5">
                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="输入备注信息..." rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
              </div>
              <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                <button onClick={() => setNoteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">取消</button>
                <button onClick={handleUpdateNote} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">保存</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
