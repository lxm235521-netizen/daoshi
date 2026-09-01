import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Mail, User, Image as ImageIcon, Send, CheckCircle2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Toast = ({ message, type }: { message: string, type: 'success' | 'error' }) => (<div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full flex items-center gap-3 shadow-xl backdrop-blur-xl border ${type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}><span className="text-sm font-medium">{message}</span></div>);

export const Apply: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    try {
      await axios.post('/api/tutors/apply', formData);
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.error || '申请失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((step - 1) / 2) * 100;

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col relative overflow-hidden font-sans text-gray-200">
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-pink-600/20 blur-[120px] pointer-events-none" />
      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      <header className="relative z-10 p-6 sm:p-10 flex items-center justify-between">
        <div className="flex items-center gap-3" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <SparklesIcon />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">导师入驻申请</span>
        </div>
        <button onClick={() => navigate('/login')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
          已有账号？去登录
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center relative z-10 px-4 pb-20">
        <div className="w-full max-w-xl">
          {step < 4 && (
            <div className="mb-12">
              <div className="flex justify-between text-xs font-medium text-gray-500 mb-3 px-1">
                <span className={step >= 1 ? 'text-pink-400' : ''}>基础账号</span>
                <span className={step >= 2 ? 'text-pink-400' : ''}>外显形象</span>
                <span className={step >= 3 ? 'text-pink-400' : ''}>作品实力</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${progress}%` }} 
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                />
              </div>
            </div>
          )}

          {error && <Toast message={error} type="error" />}
          <div className="bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 p-8 sm:p-12 rounded-[2rem] shadow-2xl relative">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-3xl font-extrabold text-white mb-3">你好，未来的顶尖导师</h2>
                  <p className="text-gray-400 mb-10 leading-relaxed">请留下您的邮箱，这将是您登录后台和接收平台通知的唯一凭证。</p>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2 ml-1">常用邮箱</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-pink-400 transition-colors"><Mail size={18} /></div>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="请输入常用邮箱" className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:bg-white/5 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2 ml-1">设置登录密码</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-pink-400 transition-colors">
                          <Lock size={18} />
                        </div>
                        <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="不少于6位密码" className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:bg-white/5 transition-all" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 flex justify-end">
                    <button onClick={handleNextStep1} disabled={!formData.email.includes('@') || formData.password.length < 6} className="px-8 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                      下一步 <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-3xl font-extrabold text-white mb-3">打造您的专属招牌</h2>
                  <p className="text-gray-400 mb-10 leading-relaxed">一个响亮的名字和头衔能让学员立刻记住您。</p>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2 ml-1">对外展示的昵称 / 圈名</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-pink-400 transition-colors"><User size={18} /></div>
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="例如：幻羽" className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:bg-white/5 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2 ml-1">一句话头衔</label>
                      <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="例如：资深二次元场景/分镜画师" className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:bg-white/5 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2 ml-1">个人简介</label>
                      <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="向学员简单介绍一下自己和教学特色..." className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:bg-white/5 transition-all resize-none" rows={3}></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2 ml-1">头像图片 (点击上传)</label>
                      <label className="cursor-pointer">
                        <div className="w-20 h-20 bg-black/40 border border-white/10 rounded-full flex items-center justify-center overflow-hidden hover:border-pink-500/50 transition-colors">
                          {formData.avatar ? <img src={formData.avatar} className="w-full h-full object-cover"/> : <ImageIcon size={24} className="text-gray-500"/>}
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if(!file) return;
                          const fd = new FormData(); fd.append('file', file);
                          try {
                            const res = await axios.post('/api/upload', fd);
                            setFormData({...formData, avatar: res.data.url});
                          } catch(err) { setError('上传头像失败'); }
                        }} />
                      </label>
                    </div>
                  </div>
                  <div className="mt-12 flex justify-between">
                    <button onClick={prevStep} className="px-6 py-3.5 text-gray-400 hover:text-white transition-colors flex items-center gap-2"><ArrowLeft size={18} /> 返回</button>
                    <button onClick={nextStep} disabled={!formData.name || !formData.title} className="px-8 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                      下一步 <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-3xl font-extrabold text-white mb-3">最后，秀出实力</h2>
                  <p className="text-gray-400 mb-10 leading-relaxed">附上您的代表作或过往教学案例，这是获取学员信任的利器。</p>
                  <div className="space-y-6">
                    <div>
                      <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl mb-4">
                        <p className="text-sm text-purple-300">为降低入驻门槛，暂不需要在此提交作品链接。审核通过后，您可以在导师工作台中完善和上传所有作品（支持图片直传和视频链接）。</p>
                      </div>
                    </div>
                    <div className="bg-pink-500/10 border border-pink-500/20 p-4 rounded-xl">
                      <p className="text-xs text-pink-300/80 leading-relaxed">
                        提交申请后，我们的管理员小哥哥/小姐姐会去您的作品页“串门”。一旦审核通过，您就可以登录专属的工作台，亲自布置您在大厅的豪华主页了！
                      </p>
                    </div>
                  </div>
                  <div className="mt-12 flex justify-between">
                    <button onClick={prevStep} className="px-6 py-3.5 text-gray-400 hover:text-white transition-colors flex items-center gap-2"><ArrowLeft size={18} /> 返回</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3.5 relative group overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                      {isSubmitting ? (
                        <>提交中 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /></>
                      ) : (
                        <>提交入驻申请 <Send size={18} /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                    <CheckCircle2 size={48} className="text-green-400" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-white mb-4">申请已送达！</h2>
                  <p className="text-gray-400 leading-relaxed mb-10">
                    感谢您选择漫剧社区。<br/>管理员最迟会在 24 小时内完成资质评估。<br/>审核结果将直接发送至您的邮箱 <strong className="text-white font-mono">{formData.email}</strong>。
                  </p>
                  <button onClick={() => navigate('/')} className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors">
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
