import React, { useState, useEffect } from 'react';
import { Edit3, Users, Save, Check, Eye, X, Search, Edit2, LogOut, ExternalLink, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TutorCard } from '../components/TutorCard';
import type { Tutor } from '../components/RegistrationDrawer';

type StudentStatus = 'todo' | 'doing' | 'done';
const STATUS_LABELS: Record<StudentStatus, { text: string, color: string }> = {
  todo: { text: '待联系', color: 'bg-yellow-500/10 text-yellow-500' },
  doing: { text: '沟通教学中', color: 'bg-blue-500/10 text-blue-500' },
  done: { text: '已完结归档', color: 'bg-green-500/10 text-green-500' }
};

interface StudentLead { id: string; wechat: string; request: string; level: string; note: string; status: StudentStatus; assignTime: string; }
type TutorWorkspaceProfile = Tutor & { bio?: string; email?: string; isPublished?: boolean };

const EMPTY_PROFILE: Tutor = {
  id: '', name: '', title: '', avatar: '', tags: [], works: []
};



const Toast = ({ message, type }: { message: string, type: 'success' | 'error' }) => (
  <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 border transition-all animate-in fade-in slide-in-from-top-4 ${type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
    {type === 'success' ? <ShieldCheck size={18} className="text-green-600" /> : <ShieldAlert size={18} className="text-red-600" />}
    <span className="font-medium text-sm">{message}</span>
  </div>
);

const showToastMsg = (msg: string, type: 'success' | 'error' = 'success') => {
  const evt = new CustomEvent('show-toast', { detail: { msg, type } });
  window.dispatchEvent(evt);
};

export const TutorWorkspace: React.FC = () => {
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

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
        wechat: lead.wechat_id || lead.qq_id || '未知',
        request: lead.request_type || '无备注',
        level: lead.level || '未知',
        note: lead.note || '',
        status: lead.status || 'todo',
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
    return s.wechat.toLowerCase().includes(query) || s.note.toLowerCase().includes(query) || s.request.toLowerCase().includes(query);
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

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-200 flex font-sans">
      {toast && <Toast message={toast.message} type={toast.type} />}
      <aside className="w-64 border-r border-white/10 bg-[#0a0a0c] p-6 flex flex-col shrink-0 z-10">
        <h1 className="text-xl font-black text-white tracking-tight mb-10 flex items-center gap-3">
          {profile.avatar ? <img src={profile.avatar} alt="导师头像" className="w-8 h-8 rounded-lg object-cover border border-white/20" /> : <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-white/20" />}
          导师工作台
        </h1>
        <nav className="flex flex-col gap-2 flex-1">
          <button onClick={() => setActiveTab('crm')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'crm' ? 'bg-purple-500/10 text-purple-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}><Users size={18} /> 学员线索管理</button>
          <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'profile' ? 'bg-purple-500/10 text-purple-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}><Edit3 size={18} /> 个人资料配置</button>
          <button onClick={() => navigate('/')} className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-500 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"><ExternalLink size={18} /> 查看导师展示页</button>
          <button onClick={() => { localStorage.removeItem('manju_token'); localStorage.removeItem('manju_user'); navigate('/login'); }} className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-500 hover:text-red-300 hover:bg-red-500/10 transition-colors"><LogOut size={18} /> 退出登录</button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between shrink-0">
          <h2 className="text-2xl font-bold text-white">{activeTab === 'crm' ? '学员线索管理' : '资料配置中心'}</h2>
          
          {activeTab === 'crm' && (
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="搜索微信/QQ、需求、备注..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#111113] border border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors text-white placeholder:text-gray-600"
              />
            </div>
          )}
          
          {activeTab === 'profile' && (
            <div className="flex gap-4">
              <button 
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
              >
                {isPreviewMode ? <><Edit3 size={16} /> 退出预览</> : <><Eye size={16} /> 预览展示页</>}
              </button>
              {!isPreviewMode && (
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-500/20"
                >
                  {isSaved ? <Check size={18} /> : <Save size={18} />}
                  {isSaved ? '已提交审核' : '提交变更审核'}
                </button>
              )}
            </div>
          )}
        </header>

        <div className="flex-1 overflow-auto p-8 relative">
          {activeTab === 'crm' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-[#111113] border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-semibold">学员联系方式</th>
                    <th className="px-6 py-4 font-semibold">当前基础</th>
                    <th className="px-6 py-4 font-semibold">核心需求</th>
                    <th className="px-6 py-4 font-semibold">导师备注</th>
                    <th className="px-6 py-4 font-semibold">服务进度</th>
                    <th className="px-6 py-4 font-semibold text-right">分发时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStudents.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">没有找到匹配的学员线索</td></tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-5">
                          <div className="font-mono font-medium text-purple-400 mb-1">{student.wechat}</div>
                        </td>
                        <td className="px-6 py-5"><span className="px-2 py-1 bg-white/5 text-gray-300 rounded text-xs">{student.level}</span></td>
                        <td className="px-6 py-5 text-gray-300">{student.request}</td>
                        
                        <td className="px-6 py-5 w-64">
                          {editingNoteId === student.id ? (
                            <div className="flex items-center gap-2">
                              <input 
                                value={editingNoteValue}
                                onChange={(e) => setEditingNoteValue(e.target.value)}
                                className="bg-[#111113] border border-purple-500/50 rounded px-2 py-1 text-xs text-white w-full outline-none focus:border-purple-400"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && saveNote(student.id)}
                              />
                              <button onClick={() => saveNote(student.id)} className="text-purple-400 hover:text-purple-300"><Check size={14}/></button>
                              <button onClick={() => setEditingNoteId(null)} className="text-gray-500 hover:text-gray-300"><X size={14}/></button>
                            </div>
                          ) : (
                            <div 
                              className="group/note flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-200"
                              onClick={() => startEditingNote(student)}
                            >
                              <span className={`truncate max-w-[200px] ${!student.note && 'italic opacity-50'}`}>
                                {student.note || '点击添加备注...'}
                              </span>
                              <Edit2 size={12} className="opacity-0 group-hover/note:opacity-100 transition-opacity text-purple-400" />
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-5 whitespace-nowrap">
                          <select 
                            value={student.status}
                            onChange={(e) => updateStudentStatus(student.id, e.target.value as StudentStatus)}
                            className={`bg-transparent outline-none cursor-pointer font-medium text-xs px-2 py-1 rounded appearance-none border border-transparent hover:border-white/10 ${STATUS_LABELS[student.status].color}`}
                          >
                            <option value="todo" className="bg-[#111113] text-yellow-500">待联系</option>
                            <option value="doing" className="bg-[#111113] text-blue-500">沟通教学中</option>
                            <option value="done" className="bg-[#111113] text-green-500">已完结归档</option>
                          </select>
                        </td>

                        <td className="px-6 py-4 text-right text-gray-500 text-xs">
                          {student.assignTime}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <div className="relative h-full">
              <AnimatePresence mode="wait">
                {!isPreviewMode ? (
                  
                    <motion.div key="edit" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-3xl mx-auto space-y-8 pb-20 pt-8">
                      <div className="bg-[#111113] p-8 rounded-3xl border border-white/10 shadow-xl">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4"><Users className="text-purple-400" /> 基础展示信息</h3>
                        <div className="flex gap-6">
                          <div className="w-32">
                            <label className="cursor-pointer group block">
                              <div className="w-32 h-32 rounded-2xl bg-black border border-white/10 overflow-hidden relative group transition-all group-hover:border-purple-500">
                                <img src={profile.avatar || 'https://via.placeholder.com/150'} alt="导师头像" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <span className="text-xs text-white">更换头像</span>
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
                            <div><label className="block text-xs text-gray-500 mb-1">外显昵称</label><input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none" /></div>
                            <div><label className="block text-xs text-gray-500 mb-1">一句话头衔</label><input value={profile.title} onChange={e => setProfile({...profile, title: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none" /></div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#111113] p-8 rounded-3xl border border-white/10 shadow-xl">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4"><Edit2 className="text-purple-400" /> 教学标签与简介</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">核心教学标签（输入后按回车添加）</label>
                            <div className="flex flex-wrap items-center gap-2 min-h-[44px] w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 focus-within:border-purple-500">
                              {profile.tags?.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-300">
                                  {tag}
                                  <button type="button" onClick={() => removeTag(tag)} className="text-purple-300/70 hover:text-white" aria-label={`删除标签 ${tag}`}><X size={13} /></button>
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
                                className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-white outline-none placeholder:text-gray-600"
                                placeholder={profile.tags?.length ? '继续输入标签' : '例如：动态漫，按回车添加'}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">个人简介</label>
                            <textarea value={profile.bio || ''} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none resize-none" rows={4} placeholder="介绍你的教学方向和经验" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#111113] p-8 rounded-3xl border border-white/10 shadow-xl">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4"><Save className="text-purple-400" /> 作品展示库</h3>
                        <div className="space-y-4">
                          {profile.works?.map((work, index) => (
                            <div key={index} className="flex items-center gap-3 bg-[#0a0a0c] p-3 rounded-lg border border-white/10">
                              {typeof work === 'string' || !work.type ? (
                                <img src={typeof work === 'string' ? work : work.url} className="w-16 h-16 object-cover rounded bg-black" />
                              ) : work.type === 'video' ? (
                                <div className="w-16 h-16 bg-purple-900/20 text-purple-400 flex items-center justify-center rounded text-xs font-bold border border-purple-500/30">视频</div>
                              ) : (
                                <img src={work.url} className="w-16 h-16 object-cover rounded bg-black" />
                              )}
                              <div className="flex-1 text-sm text-gray-400 truncate">
                                {typeof work === 'string' ? work : (work.raw || work.url)}
                              </div>
                              <button onClick={() => setProfile({...profile, works: profile.works?.filter((_, i) => i !== index)})} className="text-red-500 hover:text-red-400 p-2"><X size={16} /></button>
                            </div>
                          ))}
                          
                          <div className="flex gap-2 pt-4 border-t border-white/5">
                            <label className="flex-1 cursor-pointer">
                              <div className="w-full bg-purple-600/10 text-purple-400 border border-purple-500/20 hover:bg-purple-600/20 rounded-lg px-4 py-3 text-center text-sm font-medium transition-colors">
                                + 上传本地图片作品
                              </div>
                              <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const formData = new FormData(); formData.append('file', file);
                                try {
                                  const res = await axios.post('/api/tutor/upload', formData, { headers: { Authorization: `Bearer ${token}` } });
                                  setProfile({...profile, works: [...(profile.works || []), { type: 'image', url: res.data.url }]});
                                } catch (err) { showToastMsg('作品上传失败', 'error'); }
                              }} />
                            </label>
                            
                            <div className="flex-1 flex gap-2">
                              <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="粘贴哔哩哔哩 / 抖音 / 腾讯视频链接" className="min-w-0 flex-1 bg-[#0a0a0c] border border-blue-500/20 rounded-lg px-3 py-3 text-sm text-white placeholder:text-gray-600 focus:border-blue-400 focus:outline-none" />
                              <button onClick={() => {
                                const rawUrl = videoUrl.trim();
                                if (!rawUrl) return;
                                const bvidMatch = rawUrl.match(/BV[0-9a-zA-Z]+/);
                                const parsedUrl = bvidMatch ? `//player.bilibili.com/player.html?bvid=${bvidMatch[0]}&page=1&high_quality=1` : rawUrl;
                                setProfile({...profile, works: [...(profile.works || []), { type: 'video', url: parsedUrl, raw: rawUrl }]});
                                setVideoUrl('');
                              }} className="shrink-0 bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600/20 rounded-lg px-4 py-3 text-sm font-medium transition-colors">添加视频</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                ) : (
                  <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center pb-20">
                    <div className="mb-8 text-center"><span className="bg-purple-500/20 text-purple-400 px-4 py-1.5 rounded-full text-sm font-bold animate-pulse">👀 预览模式</span></div>
                    <div className="w-[380px] pointer-events-none"><TutorCard {...profile} onEnrollClick={() => {}} onProfileClick={() => {}} /></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
