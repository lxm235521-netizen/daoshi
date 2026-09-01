import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Image as ImageIcon, BadgeCheck, BookOpen, Layers3, Sparkles } from 'lucide-react';
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={stopPropagation}
              className="tutor-profile-modal relative w-full max-w-5xl border rounded-3xl overflow-hidden shadow-2xl h-[90vh] flex flex-col"
            >
              <button 
                onClick={onClose} 
                aria-label="关闭导师详情"
                className="tutor-profile-close absolute top-4 right-4 z-10 p-2 rounded-full transition-all"
              >
                <X size={24} />
              </button>

              <div className="relative h-48 sm:h-64 w-full flex-shrink-0">
                <img 
                  src={typeof tutor.works[0] === 'string' ? tutor.works[0] : tutor.works[0]?.url} 
                  alt="导师作品封面" 
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="tutor-profile-cover-gradient absolute inset-0 bg-gradient-to-t to-transparent" />
                
                <div className="absolute bottom-0 left-0 w-full px-8 translate-y-1/3 flex items-end gap-6">
                  <div className="tutor-profile-avatar w-32 h-32 rounded-2xl overflow-hidden border-4 shadow-xl flex-shrink-0">
                    <img src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="pb-2">
                    <h1 className="tutor-profile-title text-3xl sm:text-4xl font-extrabold mb-2">{tutor.name}</h1>
                    <p className="tutor-profile-subtitle text-lg">{tutor.title || '漫剧创作导师'}</p>
                    <div className="tutor-profile-verified mt-3 inline-flex items-center gap-1.5 text-xs"><BadgeCheck size={14} /> 已通过平台资料审核</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-8 pt-20 pb-24">
                <div className="mb-10 grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
                  <div className="max-w-3xl">
                  <h3 className="tutor-profile-heading mb-4 flex items-center gap-2 text-xl font-bold"><BookOpen size={19} className="tutor-profile-accent" />导师履历</h3>
                  <div className="tutor-profile-muted leading-relaxed space-y-4">
                    <p>{tutor.bio || '导师暂未填写个人简介。'}</p>
                  </div>
                  </div>
                  <div className="tutor-profile-summary rounded-2xl border p-5"><p className="tutor-profile-accent text-[10px] uppercase tracking-[0.25em]">一览</p><div className="mt-5 grid grid-cols-2 gap-4"><div><p className="tutor-profile-stat text-2xl font-semibold">{tutor.tags.length}</p><p className="tutor-profile-muted mt-1 text-xs">教学方向</p></div><div><p className="tutor-profile-stat text-2xl font-semibold">{tutor.works.length}</p><p className="tutor-profile-muted mt-1 text-xs">公开作品</p></div></div><div className="tutor-profile-muted mt-5 flex items-center gap-2 border-t pt-4 text-xs"><Sparkles size={14} className="tutor-profile-accent" /> 真实作品与资料展示</div></div>
                </div>

                <div className="mb-12"><h3 className="tutor-profile-muted mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]"><Layers3 size={15} className="tutor-profile-accent" />教学方向</h3><div className="flex flex-wrap gap-3">
                  {tutor.tags.map((tag, i) => (
                    <span key={i} className="tutor-profile-tag px-4 py-2 rounded-lg border font-medium">
                      {tag}
                    </span>
                  ))}
                </div></div>

                <div className="tutor-profile-tabs border-b mb-8 flex gap-8">
                  <button 
                    onClick={() => setActiveTab('works')}
                    className={`tutor-profile-tab pb-4 text-lg font-medium transition-colors relative flex items-center gap-2 ${activeTab === 'works' ? 'tutor-profile-tab-active' : ''}`}
                  >
                    <ImageIcon size={18} />
                    全部图片作品
                    {activeTab === 'works' && (
                      <motion.div layoutId="activeTabIndicator" className="tutor-profile-indicator absolute bottom-0 left-0 w-full h-0.5" />
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveTab('videos')}
                    className={`tutor-profile-tab pb-4 text-lg font-medium transition-colors relative flex items-center gap-2 ${activeTab === 'videos' ? 'tutor-profile-tab-active' : ''}`}
                  >
                    <Video size={18} />
                    视频展示
                    {activeTab === 'videos' && (
                      <motion.div layoutId="activeTabIndicator" className="tutor-profile-indicator absolute bottom-0 left-0 w-full h-0.5" />
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
                      <div key={idx} className="tutor-profile-work rounded-xl overflow-hidden break-inside-avoid">
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
                      <div className="tutor-profile-empty md:col-span-2 aspect-video rounded-2xl overflow-hidden border flex items-center justify-center flex-col">
                        <Video size={32} className="mb-2 opacity-50" />
                        <span className="text-sm">导师未上传视频</span>
                      </div>
                    ) : tutor.works.filter((work: any) => typeof work !== 'string' && work.type === 'video').map((work: any, idx) => (
                      <div key={idx} className="tutor-profile-video aspect-video rounded-2xl overflow-hidden border relative z-10">
                        <iframe src={work.url} title={`导师视频 ${idx + 1}`} scrolling="no" allowFullScreen={true} className="w-full h-full" />
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              <div className="tutor-profile-footer absolute bottom-0 left-0 w-full p-6 pointer-events-none">
                <div className="flex justify-end pointer-events-auto">
                  <button 
                    onClick={() => {
                      onClose();
                      setTimeout(() => onEnrollClick(tutor), 300);
                    }}
                    className="tutor-profile-enroll px-8 py-4 rounded-full text-white font-bold flex items-center gap-3 shadow-lg transition-all hover:-translate-y-1"
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
