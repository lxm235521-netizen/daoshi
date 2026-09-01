import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

type LoginRole = 'tutor' | 'admin';

export const Login: React.FC = () => {
  const [role, setRole] = useState<LoginRole>('tutor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // 发送真实登录请求
      const response = await axios.post('/api/auth/login', {
        email,
        password,
        loginRole: role
      });

      // 提取并保存 Token 与用户信息
      const { token, user } = response.data;
      localStorage.setItem('manju_token', token);
      localStorage.setItem('manju_user', JSON.stringify(user));

      // 根据实际角色跳转
      if (user.role === 'superadmin' || user.role === 'manager') {
        navigate('/admin');
      } else {
        navigate('/tutor');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('服务器响应异常，请检查网络');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-purple-500/30">
      
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/30 blur-[120px] pointer-events-none" />
      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-md relative z-10">
        <div className="bg-[#0a0a0c]/60 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(147,51,234,0.3)]">
              <SparklesIcon />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">欢迎回到漫剧社区</h1>
            <p className="text-sm text-gray-500">连接创意，创造无限可能</p>
          </div>

          <div className="bg-black/50 p-1 rounded-xl flex relative mb-8 border border-white/5">
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#1c1c22] rounded-lg border border-white/10 shadow-lg transition-transform duration-300 ease-in-out ${role === 'tutor' ? 'translate-x-0' : 'translate-x-[calc(100%+8px)]'}`} />
            <button type="button" onClick={() => setRole('tutor')} className={`flex-1 py-2.5 text-sm font-medium z-10 transition-colors ${role === 'tutor' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>导师登录</button>
            <button type="button" onClick={() => setRole('admin')} className={`flex-1 py-2.5 text-sm font-medium z-10 transition-colors flex items-center justify-center gap-1.5 ${role === 'admin' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>管理员入口</button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
                {error}
              </motion.div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 ml-1">邮箱账号</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors"><Mail size={18} /></div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="请输入邮箱账号" required className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/5 transition-all text-sm" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1 mr-1">
                <label className="block text-xs font-medium text-gray-400">登录密码</label>
                {role === 'tutor' && <a href="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">忘记密码?</a>}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors"><Lock size={18} /></div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/5 transition-all text-sm tracking-widest" />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full relative group mt-8">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-50 group-hover:opacity-100 transition duration-500 blur-sm"></div>
              <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 py-3.5 rounded-xl text-white font-bold text-sm tracking-wide overflow-hidden">
                <AnimatePresence mode="wait">
                  {isSubmitting ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />验证中...
                    </motion.div>
                  ) : (
                    <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      进入系统 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </button>
          </form>

          {role === 'tutor' ? (
            <p className="text-center text-xs text-gray-500 mt-8">
              还没有账号？ <button type="button" onClick={() => navigate('/apply')} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">申请入驻</button>
            </p>
          ) : (
            <div className="flex items-center justify-center gap-2 text-center text-xs text-red-400/70 mt-8 bg-red-500/10 py-2 rounded-lg border border-red-500/10">
              <ShieldAlert size={14} /> 仅限系统超级管理员登录
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const SparklesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);
