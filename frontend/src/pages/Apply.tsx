import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Mail, User, Image as ImageIcon, Send, CheckCircle2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Toast = ({ message, type }: { message: string, type: 'success' | 'error' }) => (<div className={`fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-3 border px-6 py-3 shadow-xl ${type === 'success' ? 'border-[#d9ff4f] bg-[#d9ff4f] text-[#101114]' : 'border-[#ff5a45]/30 bg-[#ff5a45]/10 text-[#c53c2d]'}`}><span className="text-sm font-bold">{message}</span></div>);

export const Apply: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!avatarFile) { setAvatarPreview(''); return; }
    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const [formData, setFormData] = useState({
      email: '',
      password: '',
      name: '',
      title: '',
      avatar: '',
      bio: '',
      worksUrl: ''
    });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const handleNextStep1 = async () => { setError(''); if (step === 1) { try { await axios.post('/api/tutors/check-email', { email: formData.email }); setStep(2); } catch (err: any) { setError(err.response?.data?.error || '校验失败'); } } else { nextStep(); } };
  const prevStep = () => { setError(''); setStep(s => Math.max(s - 1, 1)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      // 头像随表单一起以 multipart 提交：申请页未登录，不走需鉴权的通用上传接口
      const fd = new FormData();
      fd.append('email', formData.email);
      fd.append('password', formData.password);
      fd.append('name', formData.name);
      fd.append('title', formData.title);
      fd.append('bio', formData.bio || '');
      fd.append('worksUrl', formData.worksUrl || '');
      if (avatarFile) fd.append('file', avatarFile);
      await axios.post('/api/tutors/apply', fd, {
        headers: { 'content-type': 'multipart/form-data' }
      });
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.error || '申请失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((step - 1) / 2) * 100;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f7f4ec] font-sans text-[#101114]">
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(rgba(16,17,20,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,17,20,.08) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

      <header className="relative z-10 flex items-center justify-between border-b border-[#101114]/15 p-6 sm:p-10">
        <div className="flex items-center gap-3" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="flex h-10 w-10 items-center justify-center border border-[#101114] bg-[#101114]">
            <SparklesIcon />
          </div>
          <span className="text-xl font-black tracking-tight">导师入驻申请</span>
        </div>
        <button onClick={() => navigate('/login')} className="border border-[#101114]/20 px-4 py-2 text-sm font-bold transition-colors hover:bg-[#101114] hover:text-white">
          已有账号？去登录
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center relative z-10 px-4 pb-20">
        <div className="w-full max-w-xl">
          {step < 4 && (
            <div className="mb-12">
              <div className="mb-3 flex justify-between px-1 text-xs font-bold text-[#777871]">
                <span className={step >= 1 ? 'text-[#ff5a45]' : ''}>基础账号</span>
                <span className={step >= 2 ? 'text-[#ff5a45]' : ''}>外显形象</span>
                <span className={step >= 3 ? 'text-[#ff5a45]' : ''}>作品实力</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden border border-[#101114]/15 bg-white">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${progress}%` }} 
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="h-full bg-[#d9ff4f]"
                />
              </div>
            </div>
          )}

          {error && <Toast message={error} type="error" />}
          <div className="relative border border-[#101114]/15 bg-white p-8 shadow-[8px_8px_0_#101114] sm:p-12">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="mb-3 text-3xl font-black">你好，未来的顶尖导师</h2>
                  <p className="mb-10 leading-relaxed text-[#777871]">请留下您的邮箱，这将是您登录后台和接收平台通知的唯一凭证。</p>
                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 ml-1 block text-xs font-bold text-[#54564f]">常用邮箱</label>
                      <div className="relative group">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#777871] transition-colors group-focus-within:text-[#ff5a45]"><Mail size={18} /></div>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="请输入常用邮箱" className="w-full border border-[#101114]/20 bg-[#f7f4ec] py-4 pl-12 pr-4 text-[#101114] placeholder-[#777871] outline-none transition-all focus:border-[#101114]" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 ml-1 block text-xs font-bold text-[#54564f]">设置登录密码</label>
                      <div className="relative group">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#777871] transition-colors group-focus-within:text-[#ff5a45]">
                          <Lock size={18} />
                        </div>
                        <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="不少于6位密码" className="w-full border border-[#101114]/20 bg-[#f7f4ec] py-4 pl-12 pr-4 text-[#101114] placeholder-[#777871] outline-none transition-all focus:border-[#101114]" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 flex justify-end">
                    <button onClick={handleNextStep1} disabled={!formData.email.includes('@') || formData.password.length < 6} className="flex items-center gap-2 border border-[#101114] bg-[#d9ff4f] px-8 py-3.5 font-black transition-colors hover:bg-[#101114] hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
                      下一步 <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="mb-3 text-3xl font-black">打造您的专属招牌</h2>
                  <p className="mb-10 leading-relaxed text-[#777871]">一个响亮的名字和头衔能让学员立刻记住您。</p>
                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 ml-1 block text-xs font-bold text-[#54564f]">对外展示的昵称 / 圈名</label>
                      <div className="relative group">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#777871] transition-colors group-focus-within:text-[#ff5a45]"><User size={18} /></div>
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="例如：幻羽" className="w-full border border-[#101114]/20 bg-[#f7f4ec] py-4 pl-12 pr-4 text-[#101114] placeholder-[#777871] outline-none transition-all focus:border-[#101114]" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 ml-1 block text-xs font-bold text-[#54564f]">一句话头衔</label>
                      <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="例如：资深二次元场景/分镜画师" className="w-full border border-[#101114]/20 bg-[#f7f4ec] py-4 px-5 text-[#101114] placeholder-[#777871] outline-none transition-all focus:border-[#101114]" />
                    </div>
                    <div>
                      <label className="mb-2 ml-1 block text-xs font-bold text-[#54564f]">个人简介</label>
                      <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="向学员简单介绍一下自己和教学特色..." className="w-full resize-none border border-[#101114]/20 bg-[#f7f4ec] px-5 py-4 text-[#101114] placeholder-[#777871] outline-none transition-all focus:border-[#101114]" rows={3}></textarea>
                    </div>
                    <div>
                      <label className="mb-2 ml-1 block text-xs font-bold text-[#54564f]">头像图片 (点击上传)</label>
                      <label className="cursor-pointer">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden border border-[#101114]/20 bg-[#f7f4ec] transition-colors hover:border-[#101114]">
                          {avatarPreview ? <img src={avatarPreview} className="h-full w-full object-cover"/> : <ImageIcon size={24} className="text-[#777871]"/>}
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setAvatarFile(file);
                          setFormData(prev => ({ ...prev, avatar: file.name }));
                        }} />
                      </label>
                      <p className="mt-2 text-xs leading-5 text-[#777871]">
                        {avatarFile ? `已选择：${avatarFile.name}` : '支持 jpg / png，10MB 以内；提交申请时一并上传'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-12 flex justify-between">
                    <button onClick={prevStep} className="flex items-center gap-2 px-6 py-3.5 font-bold text-[#777871] transition-colors hover:text-[#101114]"><ArrowLeft size={18} /> 返回</button>
                    <button onClick={nextStep} disabled={!formData.name || !formData.title} className="flex items-center gap-2 border border-[#101114] bg-[#d9ff4f] px-8 py-3.5 font-black transition-colors hover:bg-[#101114] hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
                      下一步 <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="mb-3 text-3xl font-black">最后，秀出实力</h2>
                  <p className="mb-10 leading-relaxed text-[#777871]">附上您的代表作或过往教学案例，这是获取学员信任的利器。</p>
                  <div className="space-y-6">
                    <div>
                      <div className="mb-4 border border-[#101114]/15 bg-[#eeeae0] p-4">
                        <p className="text-sm leading-6 text-[#54564f]">为降低入驻门槛，暂不需要在此提交作品链接。审核通过后，您可以在导师工作台中完善和上传所有作品（支持图片直传和视频链接）。</p>
                      </div>
                    </div>
                    <div className="border border-[#ff5a45]/25 bg-[#ff5a45]/10 p-4">
                      <p className="text-xs leading-relaxed text-[#c53c2d]">
                        提交申请后，我们的管理员小哥哥/小姐姐会去您的作品页“串门”。一旦审核通过，您就可以登录专属的工作台，亲自布置您在大厅的豪华主页了！
                      </p>
                    </div>
                  </div>
                  <div className="mt-12 flex justify-between">
                    <button onClick={prevStep} className="flex items-center gap-2 px-6 py-3.5 font-bold text-[#777871] transition-colors hover:text-[#101114]"><ArrowLeft size={18} /> 返回</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="group flex items-center gap-2 border border-[#101114] bg-[#d9ff4f] px-8 py-3.5 font-black text-[#101114] transition-colors hover:bg-[#101114] hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
                      {isSubmitting ? (
                        <>提交中 <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#101114]/30 border-t-[#101114]" /></>
                      ) : (
                        <>提交入驻申请 <Send size={18} /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center border border-[#d9ff4f] bg-[#d9ff4f]">
                    <CheckCircle2 size={48} className="text-[#101114]" />
                  </div>
                  <h2 className="mb-4 text-3xl font-black">申请已送达！</h2>
                  <p className="mb-10 leading-relaxed text-[#777871]">
                    感谢您选择漫剧社区。<br/>管理员最迟会在 24 小时内完成资质评估。<br/>审核结果将直接发送至您的邮箱 <strong className="font-mono text-[#101114]">{formData.email}</strong>。
                  </p>
                  <button onClick={() => navigate('/')} className="border border-[#101114] bg-[#d9ff4f] px-8 py-3.5 font-black text-[#101114] transition-colors hover:bg-[#101114] hover:text-white">
                    返回大厅看看其他导师
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);
