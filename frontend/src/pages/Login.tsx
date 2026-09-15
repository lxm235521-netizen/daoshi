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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f4ec] p-4 font-sans text-[#101114] selection:bg-[#d9ff4f]">
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(rgba(16,17,20,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,17,20,.08) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-md relative z-10">
        <div className="relative overflow-hidden border border-[#101114]/15 bg-white p-8 shadow-[8px_8px_0_#101114] sm:p-10">
          <div className="absolute left-0 top-0 h-1 w-full bg-[#d9ff4f]" />

          <div className="text-center mb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-[#101114] bg-[#101114]">
              <SparklesIcon />
            </div>
            <h1 className="mb-2 text-2xl font-black tracking-tight">欢迎回到漫剧社区</h1>
            <p className="text-sm text-[#777871]">连接创意，创造无限可能</p>
          </div>

          <div className="relative mb-8 flex border border-[#101114]/15 bg-[#eeeae0] p-1">
            <div className={`absolute bottom-1 top-1 w-[calc(50%-4px)] border border-[#101114] bg-[#d9ff4f] transition-transform duration-300 ease-in-out ${role === 'tutor' ? 'translate-x-0' : 'translate-x-[calc(100%+8px)]'}`} />
            <button type="button" onClick={() => setRole('tutor')} className="z-10 flex-1 py-2.5 text-sm font-bold text-[#101114]">导师登录</button>
            <button type="button" onClick={() => setRole('admin')} className="z-10 flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-bold text-[#101114]">管理员入口</button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="border border-[#ff5a45]/30 bg-[#ff5a45]/10 p-3 text-center text-sm text-[#c53c2d]">
                {error}
              </motion.div>
            )}
            <div>
              <label className="mb-2 ml-1 block text-xs font-bold text-[#54564f]">{role === 'admin' ? '管理员用户名' : '邮箱账号'}</label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#777871] transition-colors group-focus-within:text-[#ff5a45]"><Mail size={18} /></div>
              <input type={role === 'admin' ? 'text' : 'email'} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={role === 'admin' ? '请输入管理员用户名' : '请输入邮箱账号'} autoComplete={role === 'admin' ? 'username' : 'email'} required className="w-full border border-[#101114]/20 bg-[#f7f4ec] py-3 pl-11 pr-4 text-sm text-[#101114] placeholder-[#777871] outline-none transition-all focus:border-[#101114]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1 mr-1">
                <label className="block text-xs font-bold text-[#54564f]">登录密码</label>
                {role === 'tutor' && <a href="#" className="text-xs font-bold text-[#ff5a45] transition-colors hover:text-[#101114]">忘记密码?</a>}
              </div>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#777871] transition-colors group-focus-within:text-[#ff5a45]"><Lock size={18} /></div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full border border-[#101114]/20 bg-[#f7f4ec] py-3 pl-11 pr-4 text-sm tracking-widest text-[#101114] placeholder-[#777871] outline-none transition-all focus:border-[#101114]" />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="group mt-8 w-full border border-[#101114] bg-[#d9ff4f] py-3.5 text-sm font-black tracking-wide text-[#101114] transition-colors hover:bg-[#101114] hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
              <div className="relative flex items-center justify-center gap-2 overflow-hidden">
                <AnimatePresence mode="wait">
                  {isSubmitting ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#101114]/30 border-t-[#101114]" />验证中...
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
            <p className="mt-8 text-center text-xs text-[#777871]">
              还没有账号？ <button type="button" onClick={() => navigate('/apply')} className="font-bold text-[#ff5a45] transition-colors hover:text-[#101114]">申请入驻</button>
            </p>
          ) : (
            <div className="mt-8 flex items-center justify-center gap-2 border border-[#ff5a45]/20 bg-[#ff5a45]/10 py-2 text-center text-xs text-[#c53c2d]">
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
