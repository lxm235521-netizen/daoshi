import React, { useState, useEffect } from 'react';
import { Edit3, Users, Save, Check, Eye, X, Search, Edit2, LogOut, ExternalLink, ShieldCheck, ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TutorCard } from '../components/TutorCard';
import type { Tutor } from '../components/RegistrationDrawer';
import { resolveLeadCoursePrice } from '../content/coursePrice';

type StudentStatus = 'todo' | 'doing' | 'done';
const STATUS_LABELS: Record<StudentStatus, { text: string, color: string }> = {
  todo: { text: '待联系', color: 'bg-[#d9ff4f] text-[#101114]' },
  doing: { text: '沟通教学中', color: 'bg-[#101114] text-white' },
  done: { text: '已完结归档', color: 'bg-white text-[#54564f]' }
};

interface StudentLead { id: string; wechat: string; courseName: string; coursePrice: string; request: string; level: string; note: string; status: StudentStatus; assignTime: string; }
type TutorWorkspaceProfile = Tutor & { bio?: string; email?: string; isPublished?: boolean };

const EMPTY_PROFILE: Tutor = {
  id: '', name: '', title: '', avatar: '', tags: [], works: []
};

/* ---------- 与首页一致的视觉规范 ---------- */

const PANEL = 'border-2 border-[#101114] bg-white';
const CARD = 'border-2 border-[#101114] bg-white p-6 md:p-8';
const INPUT = 'w-full border-2 border-[#101114] bg-white px-3 py-2.5 text-sm text-[#101114] outline-none transition-colors placeholder:text-[#8b8d85] focus:border-[#ff5a45]';
const FIELD_LABEL = 'mb-1.5 block text-xs font-bold text-[#54564f]';
const BTN_DARK = 'inline-flex items-center justify-center gap-2 border-2 border-[#101114] bg-[#101114] px-4 py-2 text-xs font-black text-white transition-colors hover:bg-[#ff5a45]';
const BTN_GHOST = 'inline-flex items-center justify-center gap-2 border-2 border-[#101114] bg-white px-4 py-2 text-xs font-black text-[#101114] transition-colors hover:bg-[#101114] hover:text-white';
const TABLE_HEAD = 'border-b-2 border-[#101114] bg-[#f7f4ec] text-[11px] font-black uppercase tracking-wider text-[#54564f]';
const TABLE_ROW = 'border-b border-[#101114]/15 transition-colors hover:bg-[#d9ff4f]/25';

const Toast = ({ message, type }: { message: string, type: 'success' | 'error' }) => (
  <div className={`fixed left-1/2 top-6 z-[100] flex -translate-x-1/2 items-center gap-3 border-2 border-[#101114] px-6 py-3 shadow-[6px_6px_0_#101114] animate-in fade-in slide-in-from-top-4 ${type === 'success' ? 'bg-[#d9ff4f] text-[#101114]' : 'bg-[#ff5a45] text-white'}`}>
    {type === 'success' ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
    <span className="text-sm font-black">{message}</span>
  </div>
);

const showToastMsg = (msg: string, type: 'success' | 'error' = 'success') => {
  const evt = new CustomEvent('show-toast', { detail: { msg, type } });
  window.dispatchEvent(evt);
};

export const TutorWorkspace: React.FC = () => {
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      setToast({ message: e.detail.msg, type: e.detail.type });
      setTimeout(() => setToast(null), 3000);
    };
    window.addEventListener('show-toast', handler);
    return () => window.removeEventListener('show-toast', handler);
  }, []);

  const [activeTab, setActiveTab] = useState<'crm' | 'profile'>('crm');
  const navigate = useNavigate();
  const token = localStorage.getItem('manju_token');
  const [students, setStudents] = useState<StudentLead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState('');

  const [profile, setProfile] = useState<TutorWorkspaceProfile>(EMPTY_PROFILE);
  const [tagInput, setTagInput] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const fetchLeads = async () => {
    try {
      const res = await axios.get('/api/tutor/leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const formatted = res.data.map((lead: any) => ({
        id: lead.id,
        wechat: lead.wechat_qq || lead.wechat_id || lead.qq_id || '未知',
        courseName: lead.course_name || '',
        coursePrice: resolveLeadCoursePrice(lead.course_name, lead.course_price),
        request: lead.learning_request || lead.request_type || '无备注',
        level: lead.level || '未知',
        note: lead.tutor_note || lead.note || '',
        status: lead.tutor_status || 'todo',
        assignTime: lead.assigned_at ? new Date(lead.assigned_at).toLocaleString() : '未知'
      }));
      setStudents(formatted);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchLeads();
    axios.get('/api/tutor/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setProfile(res.data))
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) navigate('/login');
      });
  }, [token, navigate]);

  const filteredStudents = students.filter(s => {
    const query = searchQuery.toLowerCase();
    return s.wechat.toLowerCase().includes(query)
      || s.note.toLowerCase().includes(query)
      || s.request.toLowerCase().includes(query)
      || s.courseName.toLowerCase().includes(query);
  });

  const updateStudentStatus = async (id: string, newStatus: StudentStatus) => {
    try {
      setStudents(students.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (err) {
      showToastMsg('状态更新失败', 'error');
    }
  };

  const startEditingNote = (student: StudentLead) => {
    setEditingNoteId(student.id);
    setEditingNoteValue(student.note);
  };

  const saveNote = (id: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, note: editingNoteValue } : s));
    setEditingNoteId(null);
  };

  const handleSave = async () => {
    const pendingTag = tagInput.trim();
    const tags = [...new Set([
      ...(profile.tags || []).filter(tag => tag !== '新人入驻'),
      ...(pendingTag ? [pendingTag] : [])
    ])];
    const profileToSave = { ...profile, tags };
    try {
      await axios.post('/api/tutor/profile/draft', { profileData: profileToSave }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(profileToSave);
      setTagInput('');
      setIsSaved(true);
      showToastMsg('提交成功，等待管理员审核', 'success');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      showToastMsg(err.response?.data?.error || '提交资料审核失败', 'error');
    }
  };

  const addTag = () => {
    const nextTag = tagInput.trim();
    if (!nextTag) return;
    setProfile(current => ({
      ...current,
      tags: [...new Set([...(current.tags || []).filter(tag => tag !== '新人入驻'), nextTag])]
    }));
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setProfile(current => ({
      ...current,
      tags: (current.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const tabs: { key: 'crm' | 'profile'; label: string; icon: React.ReactNode }[] = [
    { key: 'crm', label: '学员线索管理', icon: <Users size={17} /> },
    { key: 'profile', label: '个人资料配置', icon: <Edit3 size={17} /> }
  ];

  return (
    <div className="min-h-screen bg-[#f7f4ec] font-sans text-[#101114]">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <nav className="sticky top-0 z-40 border-b-2 border-[#101114] bg-[#f7f4ec]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1600px] items-center justify-between gap-4 px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {profile.avatar
              ? <img src={profile.avatar} alt="导师头像" className="h-9 w-9 border-2 border-[#101114] object-cover" />
              : <span className="grid h-9 w-9 place-items-center border-2 border-[#101114] bg-[#101114] text-xs font-black text-[#d9ff4f]">师</span>}
            <div className="min-w-0">
              <p className="truncate text-sm font-black leading-tight">{profile.name || '导师工作台'}</p>
              <p className="truncate text-[11px] font-bold text-[#777871]">导师工作台 · {activeTab === 'crm' ? '学员线索管理' : '资料配置中心'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-[11px] font-black text-[#54564f] sm:flex">
              {profile.isPublished
                ? <span className="border-2 border-[#101114] bg-[#d9ff4f] px-2.5 py-1 text-[#101114]">展厅已上架</span>
                : <span className="border-2 border-[#101114] bg-white px-2.5 py-1">待管理员上架</span>}
            </div>
            <button onClick={() => navigate('/')} className={`${BTN_GHOST} hidden md:inline-flex`}><ArrowLeft size={15} /> 返回首页</button>
          </div>
        </div>
      </nav>

      <div className="overflow-hidden border-b-2 border-[#101114] bg-[#d9ff4f]">
        <div className="ticker-line whitespace-nowrap py-2.5 text-xs font-black">学员线索管理 · 导师备注 · 服务进度 · 资料配置 · 提交审核 · 学员线索管理 · 导师备注 · 服务进度 · 资料配置 · 提交审核 · </div>
      </div>

      <div className="flex items-stretch">
        {/* 桌面端侧边栏 */}
        <aside className="hidden w-[260px] shrink-0 border-r-2 border-[#101114] bg-[#101114] lg:sticky lg:top-[70px] lg:flex lg:h-[calc(100vh-70px)] lg:flex-col lg:self-start">
          <div className="flex h-[70px] shrink-0 items-center gap-3 border-b-2 border-white/15 px-5">
            <span className="grid h-8 w-8 -rotate-3 place-items-center bg-[#d9ff4f] text-xs font-black text-[#101114]">导</span>
            <span className="text-base font-black tracking-tight text-white">导师工作台</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <p className="mb-2 mt-2 px-2 text-[11px] font-black uppercase tracking-wider text-white/40">工作区</p>
            <nav className="flex flex-col gap-1.5">
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => { setActiveTab(tab.key); setIsPreviewMode(false); }} className={`flex items-center gap-3 px-3 py-3 text-sm font-bold transition-colors ${activeTab === tab.key ? 'bg-[#d9ff4f] text-[#101114]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
              <button onClick={() => navigate('/')} className="flex items-center gap-3 px-3 py-3 text-sm font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white"><ExternalLink size={17} /> 查看导师展示页</button>
            </nav>
          </div>
          <div className="shrink-0 border-t-2 border-white/15 p-4">
            <button onClick={() => { localStorage.removeItem('manju_token'); localStorage.removeItem('manju_user'); navigate('/login'); }} className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-bold text-white/70 transition-colors hover:bg-[#ff5a45] hover:text-white">
              <LogOut size={17} /> 退出登录
            </button>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          {/* 移动端标签切换 */}
          <div className="flex gap-2 border-b-2 border-[#101114] bg-white p-3 lg:hidden">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setIsPreviewMode(false); }} className={`flex flex-1 items-center justify-center gap-2 border-2 border-[#101114] px-3 py-2 text-xs font-black transition-colors ${activeTab === tab.key ? 'bg-[#d9ff4f] text-[#101114]' : 'bg-white text-[#101114]'}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <header className="hidden shrink-0 items-center justify-between gap-4 border-b-2 border-[#101114] bg-white px-6 py-5 lg:flex">
            <h1 className="text-2xl font-black tracking-tight">{activeTab === 'crm' ? '学员线索管理' : '资料配置中心'}</h1>
            {activeTab === 'crm' && (
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777871]" size={15} />
                <input
                  type="text"
                  placeholder="搜索微信/QQ、需求、备注..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-2 border-[#101114] bg-white py-2 pl-9 pr-3 text-sm text-[#101114] outline-none transition-colors placeholder:text-[#8b8d85] focus:border-[#ff5a45]"
                />
              </div>
            )}
            {activeTab === 'profile' && (
              <div className="flex gap-3">
                <button onClick={() => setIsPreviewMode(!isPreviewMode)} className={BTN_GHOST}>
                  {isPreviewMode ? <><Edit3 size={15} /> 退出预览</> : <><Eye size={15} /> 预览展示页</>}
                </button>
                {!isPreviewMode && (
                  <button onClick={handleSave} className={BTN_DARK}>
                    {isSaved ? <Check size={15} /> : <Save size={15} />}
                    {isSaved ? '已提交审核' : '提交变更审核'}
                  </button>
                )}
              </div>
            )}
          </header>

          <div className="flex-1 p-4 md:p-6">
            {activeTab === 'crm' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#777871]">学员分配 / 我的线索</span>
                    <h2 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">学员线索管理</h2>
                  </div>
                  <div className="relative w-full sm:hidden">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777871]" size={15} />
                    <input
                      type="text"
                      placeholder="搜索微信/QQ、需求、备注..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border-2 border-[#101114] bg-white py-2 pl-9 pr-3 text-sm text-[#101114] outline-none transition-colors placeholder:text-[#8b8d85] focus:border-[#ff5a45]"
                    />
                  </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${PANEL} overflow-x-auto`}>
                  <table className="w-full whitespace-nowrap text-left text-sm">
                    <thead className={TABLE_HEAD}>
                      <tr>
                        <th className="px-5 py-4">学员联系方式</th>
                        <th className="px-5 py-4">报名课程</th>
                        <th className="px-5 py-4">当前基础</th>
                        <th className="px-5 py-4">学员诉求</th>
                        <th className="px-5 py-4">导师备注</th>
                        <th className="px-5 py-4">服务进度</th>
                        <th className="px-5 py-4 text-right">分发时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr><td colSpan={7} className="px-6 py-12 text-center font-bold text-[#777871]">没有找到匹配的学员线索</td></tr>
                      ) : (
                        filteredStudents.map((student) => (
                          <tr key={student.id} className={TABLE_ROW}>
                            <td className="px-5 py-5">
                              <div className="font-mono text-sm font-black text-[#ff5a45]">{student.wechat}</div>
                            </td>
                            <td className="px-5 py-5">
                              {student.courseName
                                ? <div className="flex items-baseline gap-2">
                                    <span className="font-black text-[#101114]">{student.courseName}</span>
                                    {student.coursePrice
                                      ? <span className="whitespace-nowrap font-black text-[#ff5a45]">¥{student.coursePrice}</span>
                                      : <span className="text-xs font-bold text-[#777871]">价格待确认</span>}
                                  </div>
                                : <span className="font-normal italic text-[#777871]">未选择课程</span>}
                            </td>
                            <td className="px-5 py-5">
                              <span className="border-2 border-[#101114] bg-[#f7f4ec] px-2 py-1 text-xs font-bold text-[#54564f]">{student.level}</span>
                            </td>
                            <td className="max-w-[220px] whitespace-normal px-5 py-5 text-[#54564f]">{student.request}</td>

                            <td className="w-64 px-5 py-5">
                              {editingNoteId === student.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    value={editingNoteValue}
                                    onChange={(e) => setEditingNoteValue(e.target.value)}
                                    className="w-full border-2 border-[#ff5a45] bg-white px-2 py-1 text-xs font-bold text-[#101114] outline-none"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && saveNote(student.id)}
                                  />
                                  <button onClick={() => saveNote(student.id)} className="border-2 border-[#101114] bg-[#d9ff4f] p-1 text-[#101114]" aria-label="保存备注"><Check size={14} /></button>
                                  <button onClick={() => setEditingNoteId(null)} className="border-2 border-[#101114] bg-white p-1 text-[#101114]" aria-label="取消编辑备注"><X size={14} /></button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="group/note flex items-center gap-2 text-left text-xs font-bold text-[#54564f] hover:text-[#ff5a45]"
                                  onClick={() => startEditingNote(student)}
                                >
                                  <span className={`max-w-[200px] truncate ${!student.note && 'italic opacity-50'}`}>
                                    {student.note || '点击添加备注...'}
                                  </span>
                                  <Edit2 size={12} className="opacity-0 transition-opacity group-hover/note:opacity-100" />
                                </button>
                              )}
                            </td>

                            <td className="px-5 py-5">
                              <div className="relative inline-block">
                                <span className={`pointer-events-none relative z-10 inline-flex items-center whitespace-nowrap border-2 border-[#101114] px-2.5 py-1 text-[11px] font-black ${STATUS_LABELS[student.status].color}`}>
                                  {STATUS_LABELS[student.status].text}
                                </span>
                                <select
                                  value={student.status}
                                  onChange={(e) => updateStudentStatus(student.id, e.target.value as StudentStatus)}
                                  aria-label="服务进度"
                                  title="切换服务进度"
                                  className="absolute inset-0 z-20 h-full w-full cursor-pointer appearance-none border-0 bg-transparent text-transparent opacity-0 outline-none"
                                >
                                  <option value="todo" className="bg-white text-[#101114]">待联系</option>
                                  <option value="doing" className="bg-white text-[#101114]">沟通教学中</option>
                                  <option value="done" className="bg-white text-[#101114]">已完结归档</option>
                                </select>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-right text-xs text-[#777871]">
                              {student.assignTime}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </motion.div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="relative">
                <AnimatePresence mode="wait">
                  {!isPreviewMode ? (
                    <motion.div key="edit" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="mx-auto max-w-3xl space-y-8 pb-20">
                      <div>
                        <span className="text-xs font-bold text-[#777871]">资料配置 / 基础信息</span>
                        <h2 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">个人资料配置</h2>
                      </div>

                      <div className={CARD}>
                        <h3 className="mb-6 flex items-center gap-2 border-b-2 border-[#101114]/15 pb-4 text-lg font-black"><Users size={18} className="text-[#ff5a45]" /> 基础展示信息</h3>
                        <div className="flex flex-col gap-6 sm:flex-row">
                          <div className="w-32">
                            <label className="group block cursor-pointer">
                              <div className="relative h-32 w-32 overflow-hidden border-2 border-[#101114]">
                                <img src={profile.avatar || 'https://via.placeholder.com/150'} alt="导师头像" className="h-full w-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-[#101114]/60 opacity-0 transition-opacity group-hover:opacity-100">
                                  <span className="text-xs font-black text-white">更换头像</span>
                                </div>
                              </div>
                              <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const formData = new FormData(); formData.append('file', file);
                                try {
                                  const res = await axios.post('/api/tutor/upload', formData, { headers: { Authorization: `Bearer ${token}` } });
                                  setProfile({ ...profile, avatar: res.data.url });
                                } catch (err) { showToastMsg('头像上传失败', 'error'); }
                              }} />
                            </label>
                          </div>
                          <div className="flex-1 space-y-4">
                            <div><label className={FIELD_LABEL}>外显昵称</label><input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className={INPUT} /></div>
                            <div><label className={FIELD_LABEL}>一句话头衔</label><input value={profile.title} onChange={e => setProfile({ ...profile, title: e.target.value })} className={INPUT} /></div>
                          </div>
                        </div>
                      </div>

                      <div className={CARD}>
                        <h3 className="mb-6 flex items-center gap-2 border-b-2 border-[#101114]/15 pb-4 text-lg font-black"><Edit2 size={18} className="text-[#ff5a45]" /> 教学标签与简介</h3>
                        <div className="space-y-4">
                          <div>
                            <label className={FIELD_LABEL}>核心教学标签（输入后按回车添加）</label>
                            <div className="flex min-h-[46px] w-full flex-wrap items-center gap-2 border-2 border-[#101114] bg-white px-3 py-2 transition-colors focus-within:border-[#ff5a45]">
                              {profile.tags?.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 border-2 border-[#101114] bg-[#d9ff4f] px-2 py-0.5 text-xs font-black text-[#101114]">
                                  {tag}
                                  <button type="button" onClick={() => removeTag(tag)} className="text-[#101114]/70 hover:text-[#ff5a45]" aria-label={`删除标签 ${tag}`}><X size={13} /></button>
                                </span>
                              ))}
                              <input
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                    e.preventDefault();
                                    addTag();
                                  }
                                }}
                                className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-sm text-[#101114] outline-none placeholder:text-[#8b8d85]"
                                placeholder={profile.tags?.length ? '继续输入标签' : '例如：动态漫，按回车添加'}
                              />
                            </div>
                          </div>
                          <div>
                            <label className={FIELD_LABEL}>个人简介</label>
                            <textarea value={profile.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })} className={`${INPUT} resize-none`} rows={4} placeholder="介绍你的教学方向和经验" />
                          </div>
                        </div>
                      </div>

                      <div className={CARD}>
                        <h3 className="mb-6 flex items-center gap-2 border-b-2 border-[#101114]/15 pb-4 text-lg font-black"><Save size={18} className="text-[#ff5a45]" /> 作品展示库</h3>
                        <div className="space-y-4">
                          {profile.works?.map((work, index) => (
                            <div key={index} className="flex items-center gap-3 border-2 border-[#101114] bg-[#f7f4ec] p-3">
                              {typeof work === 'string' || !work.type ? (
                                <img src={typeof work === 'string' ? work : work.url} className="h-16 w-16 border-2 border-[#101114] object-cover" />
                              ) : work.type === 'video' ? (
                                <div className="flex h-16 w-16 items-center justify-center border-2 border-[#101114] bg-[#101114] text-xs font-black text-[#d9ff4f]">视频</div>
                              ) : (
                                <img src={work.url} className="h-16 w-16 border-2 border-[#101114] object-cover" />
                              )}
                              <div className="flex-1 truncate text-sm font-bold text-[#54564f]">
                                {typeof work === 'string' ? work : (work.raw || work.url)}
                              </div>
                              <button onClick={() => setProfile({ ...profile, works: profile.works?.filter((_, i) => i !== index) })} className="border-2 border-[#101114] bg-white p-2 text-[#ff5a45] transition-colors hover:bg-[#ff5a45] hover:text-white" aria-label="删除作品"><X size={16} /></button>
                            </div>
                          ))}

                          <div className="flex flex-col gap-3 border-t-2 border-[#101114]/15 pt-4 md:flex-row">
                            <label className="flex-1 cursor-pointer">
                              <div className="w-full border-2 border-[#101114] bg-[#d9ff4f] px-4 py-3 text-center text-sm font-black text-[#101114] transition-colors hover:bg-[#101114] hover:text-[#d9ff4f]">
                                + 上传本地图片作品
                              </div>
                              <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const formData = new FormData(); formData.append('file', file);
                                try {
                                  const res = await axios.post('/api/tutor/upload', formData, { headers: { Authorization: `Bearer ${token}` } });
                                  setProfile({ ...profile, works: [...(profile.works || []), { type: 'image', url: res.data.url }] });
                                } catch (err) { showToastMsg('作品上传失败', 'error'); }
                              }} />
                            </label>

                            <div className="flex flex-1 gap-2">
                              <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="粘贴哔哩哔哩 / 抖音 / 腾讯视频链接" className={`${INPUT} min-w-0 flex-1`} />
                              <button onClick={() => {
                                const rawUrl = videoUrl.trim();
                                if (!rawUrl) return;
                                const bvidMatch = rawUrl.match(/BV[0-9a-zA-Z]+/);
                                const parsedUrl = bvidMatch ? `//player.bilibili.com/player.html?bvid=${bvidMatch[0]}&page=1&high_quality=1` : rawUrl;
                                setProfile({ ...profile, works: [...(profile.works || []), { type: 'video', url: parsedUrl, raw: rawUrl }] });
                                setVideoUrl('');
                              }} className={`${BTN_DARK} shrink-0 px-6 py-3`}>添加视频</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 lg:hidden">
                        <button onClick={() => setIsPreviewMode(!isPreviewMode)} className={BTN_GHOST}>
                          {isPreviewMode ? <><Edit3 size={15} /> 退出预览</> : <><Eye size={15} /> 预览展示页</>}
                        </button>
                        {!isPreviewMode && (
                          <button onClick={handleSave} className={BTN_DARK}>
                            {isSaved ? <Check size={15} /> : <Save size={15} />}
                            {isSaved ? '已提交审核' : '提交变更审核'}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center pb-20">
                      <div className="mb-8 text-center"><span className="animate-pulse border-2 border-[#101114] bg-[#d9ff4f] px-4 py-1.5 text-sm font-black text-[#101114]">👀 预览模式</span></div>
                      <div className="pointer-events-none w-[380px] max-w-full"><TutorCard {...profile} onEnrollClick={() => { }} onProfileClick={() => { }} /></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
