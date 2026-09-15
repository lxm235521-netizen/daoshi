import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Image as ImageIcon, BookOpen, Layers3, Sparkles } from 'lucide-react';
import type { Tutor } from './RegistrationDrawer';

interface TutorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: Tutor | null;
  onEnrollClick: (tutor: Tutor) => void;
}

export const TutorProfileModal: React.FC<TutorProfileModalProps> = ({ isOpen, onClose, tutor, onEnrollClick }) => {
  const [activeTab, setActiveTab] = useState<'works' | 'videos'>('works');

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <AnimatePresence>
      {isOpen && tutor && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#101114]/80 p-3 backdrop-blur-sm sm:p-6"
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={stopPropagation}
              className="relative flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden border border-white/20 bg-[#f7f4ec] text-[#101114] shadow-[0_24px_80px_rgba(16,17,20,.3)]"
            >
              <button 
                onClick={onClose} 
                aria-label="关闭导师详情"
                className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center border border-white/25 bg-[#101114]/70 text-white backdrop-blur-sm transition-colors hover:bg-[#d9ff4f] hover:text-[#101114]"
              >
                <X size={24} />
              </button>

              <div className="relative h-52 w-full flex-shrink-0 bg-[#101114] sm:h-64">
                <img 
                  src={typeof tutor.works[0] === 'string' ? tutor.works[0] : tutor.works[0]?.url || tutor.avatar || '/assets/mentor.jpg'}
                  alt="导师作品封面" 
                    className="h-full w-full object-cover opacity-45"
                    onError={(event) => { event.currentTarget.src = '/assets/mentor.jpg'; }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(16,17,20,.96),rgba(16,17,20,.22),transparent)]" />
                
                <div className="absolute bottom-0 left-0 flex w-full translate-y-1/3 items-end gap-5 px-6 sm:px-8">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden border-4 border-[#d9ff4f] bg-[#292b2f] shadow-xl sm:h-28 sm:w-28">
                    <img src={tutor.avatar || '/assets/mentor.jpg'} alt={tutor.name} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = '/assets/mentor.jpg'; }} />
                  </div>
                  <div className="pb-2 text-white">
                    <p className="mb-2 text-[11px] font-black uppercase tracking-[.18em] text-[#d9ff4f]">精选导师 / 资料档案</p>
                    <h1 className="text-3xl font-black leading-none sm:text-4xl">{tutor.name}</h1>
                    <p className="mt-2 text-sm font-bold text-[#d5d7cf]">{tutor.title || '漫剧创作导师'}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-24 pt-20 sm:px-8">
                <div className="mb-10 grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
                  <div className="max-w-3xl">
                  <h3 className="mb-4 flex items-center gap-2 text-xl font-black"><BookOpen size={19} className="text-[#ff5a45]" />导师履历</h3>
                  <div className="space-y-4 text-sm leading-8 text-[#4d4e49]">
                    <p>{tutor.bio || '导师暂未填写个人简介。'}</p>
                  </div>
                  </div>
                  <div className="border border-[#101114]/15 bg-white p-5"><p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff5a45]">一览</p><div className="mt-5 grid grid-cols-2 gap-4"><div><p className="text-2xl font-black">{tutor.tags.length}</p><p className="mt-1 text-xs text-[#777871]">教学方向</p></div><div><p className="text-2xl font-black">{tutor.works.length}</p><p className="mt-1 text-xs text-[#777871]">公开作品</p></div></div><div className="mt-5 flex items-center gap-2 border-t border-[#101114]/10 pt-4 text-xs text-[#777871]"><Sparkles size={14} className="text-[#ff5a45]" /> 真实作品与资料展示</div></div>
                </div>

                <div className="mb-12"><h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#777871]"><Layers3 size={15} className="text-[#ff5a45]" />教学方向</h3><div className="flex flex-wrap gap-2">
                  {tutor.tags.map((tag, i) => (
                    <span key={i} className="border border-[#101114]/15 bg-white px-3 py-2 text-xs font-bold">
                      {tag}
                    </span>
                  ))}
                </div></div>

                <div className="mb-8 flex gap-8 border-b border-[#101114]/15">
                  <button 
                    onClick={() => setActiveTab('works')}
                    className={`relative flex items-center gap-2 pb-4 text-sm font-black transition-colors ${activeTab === 'works' ? 'text-[#101114]' : 'text-[#777871]'}`}
                  >
                    <ImageIcon size={18} />
                    全部图片作品
                    {activeTab === 'works' && (
                      <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 h-1 w-full bg-[#d9ff4f]" />
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveTab('videos')}
                    className={`relative flex items-center gap-2 pb-4 text-sm font-black transition-colors ${activeTab === 'videos' ? 'text-[#101114]' : 'text-[#777871]'}`}
                  >
                    <Video size={18} />
                    视频展示
                    {activeTab === 'videos' && (
                      <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 h-1 w-full bg-[#d9ff4f]" />
                    )}
                  </button>
                </div>

                {activeTab === 'works' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
                  >
                    {tutor.works.filter((work: any) => typeof work === 'string' || work.type !== 'video').map((work: any, idx) => (
                      <div key={idx} className="overflow-hidden border border-[#101114]/10 bg-[#eeeae0] break-inside-avoid">
                        <img src={typeof work === 'string' ? work : work.url} alt={`${tutor.name}作品 ${idx + 1}`} loading="lazy" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'videos' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {tutor.works.filter((work: any) => typeof work !== 'string' && work.type === 'video').length === 0 ? (
                      <div className="md:col-span-2 flex aspect-video flex-col items-center justify-center overflow-hidden border border-[#101114]/15 bg-white text-[#777871]">
                        <Video size={32} className="mb-2 opacity-50" />
                        <span className="text-sm">导师未上传视频</span>
                      </div>
                    ) : tutor.works.filter((work: any) => typeof work !== 'string' && work.type === 'video').map((work: any, idx) => (
                      <div key={idx} className="relative z-10 aspect-video overflow-hidden border border-[#101114]/15 bg-[#101114]">
                        <iframe src={work.url} title={`导师视频 ${idx + 1}`} scrolling="no" allowFullScreen={true} className="w-full h-full" />
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              <div className="pointer-events-none absolute bottom-0 left-0 w-full bg-[linear-gradient(to_top,#f7f4ec,rgba(247,244,236,.85),transparent)] p-6">
                <div className="pointer-events-auto flex justify-end">
                  <button 
                    onClick={() => {
                      onClose();
                      setTimeout(() => onEnrollClick(tutor), 300);
                    }}
                    className="flex items-center gap-3 bg-[#101114] px-6 py-3.5 text-sm font-black text-white shadow-lg transition-colors hover:bg-[#ff5a45]"
                  >
                    预约报名该导师 
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
