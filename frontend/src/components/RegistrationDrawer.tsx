import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send } from 'lucide-react';
import axios from 'axios';

export interface Tutor { id: number | string; name: string; title: string; avatar: string; bio?: string; tags: string[]; works: any[]; fullWorks?: any[]; }

interface RegistrationDrawerProps { isOpen: boolean; onClose: () => void; tutor: Tutor | null; }

export const RegistrationDrawer: React.FC<RegistrationDrawerProps> = ({ isOpen, onClose, tutor }) => {
  const [level, setLevel] = useState('');
  const [request, setRequest] = useState('');
  const [wechat, setWechat] = useState('');
  const [timeNote, setTimeNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setSubmitted(false);
    setLevel(''); setRequest(''); setWechat(''); setTimeNote(''); setError('');
    onClose();
  };

  const submitForm = async () => {
    if (!level || !request || !wechat) {
      setError('请完整填写基础水平、学习诉求和联系方式');
      return;
    }
    setError('');
    setIsSubmitting(true);
    
    try {
      await axios.post('/api/leads', {
        wechat,
        level,
        request,
        timeNote,
        intentTutorId: tutor?.id
      });
      setSubmitted(true);
    } catch (err) {
      setError('网络请求失败，请稍后再试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-[#09090b]/95 border-l border-white/10 z-50 p-6 sm:p-8 overflow-y-auto shadow-2xl">
            {!submitted ? (
              <div className="flex flex-col min-h-full">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2"><Sparkles className="text-purple-400" size={20} /> 预约导师</h2>
                  <button onClick={handleClose} className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"><X size={20} /></button>
                </div>

                {tutor && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 mb-8">
                    <img src={tutor.avatar} alt={tutor.name} className="w-12 h-12 rounded-full object-cover border border-white/20" />
                    <div><p className="text-xs text-gray-400">正在报名</p><p className="font-bold text-gray-100">{tutor.name} 的门下</p></div>
                  </div>
                )}

                <div className="flex-1 flex flex-col gap-6">
                  {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">{error}</div>}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">目前的水平是？<span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                      {['零基础小白', '有一定基础'].map((lvl) => (
                        <button key={lvl} onClick={() => setLevel(lvl)} className={`p-3 rounded-xl border text-sm font-medium transition-all ${level === lvl ? 'border-purple-500 bg-purple-500/20 text-purple-200' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}>{lvl}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">想学什么 / 学习诉求<span className="text-red-500">*</span></label>
                    <textarea rows={3} value={request} onChange={(e)=>setRequest(e.target.value)} placeholder="例如：想系统学习爆款短剧剧本的结构..." className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/70 focus:bg-white/10 transition-all resize-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">联系方式 (微信 / QQ)<span className="text-red-500">*</span></label>
                    <input type="text" value={wechat} onChange={(e)=>setWechat(e.target.value)} placeholder="方便导师加您的微信号/QQ" className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/70 focus:bg-white/10 transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">联系时间备注</label>
                    <input type="text" value={timeNote} onChange={(e)=>setTimeNote(e.target.value)} placeholder="例如：工作日晚上8点后" className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/70 focus:bg-white/10 transition-all text-sm" />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                  <button onClick={submitForm} disabled={isSubmitting} className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(147,51,234,0.3)] disabled:opacity-50">
                    {isSubmitting ? '提交中...' : '提交报名'} <Send size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }} className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                  <Sparkles className="text-green-400" size={32} />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-100 mb-4">报名已提交！</h2>
                <p className="text-gray-400 mb-8 leading-relaxed text-sm">管理员小姐姐已经收到您的请求，<br/>我们会尽快通过微信/QQ与您联系并分配导师。</p>
                <button onClick={handleClose} className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors text-sm font-medium">关闭窗口</button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
