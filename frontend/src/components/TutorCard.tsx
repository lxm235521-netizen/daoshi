import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCheck, ChevronRight, Image as ImageIcon, Play, Star, X } from 'lucide-react';

export interface TutorCardProps {
  name: string;
  title: string;
  avatar: string;
  bio?: string;
  tags: string[];
  works: any[];
  onEnrollClick: () => void;
  onProfileClick: () => void;
}

export const TutorCard: React.FC<TutorCardProps> = ({ name, title, avatar, tags, works, onEnrollClick, onProfileClick }) => {
  const [lightboxWork, setLightboxWork] = useState<any>(null);

  const handleWorkClick = (e: React.MouseEvent, work: any) => {
    e.stopPropagation();
    setLightboxWork(work);
  };

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEnrollClick();
  }

  return (
    <>
      <motion.div
        onClick={onProfileClick}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="tutor-card relative group overflow-hidden rounded-2xl border backdrop-blur-sm cursor-pointer"
      >
        <div className="absolute -inset-px bg-gradient-to-r from-purple-500/0 via-purple-500/40 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="tutor-card-surface relative h-full p-5 flex flex-col gap-4 z-10 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="tutor-card-avatar relative w-16 h-16 rounded-full overflow-hidden border-2 transition-colors">
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2"><h3 className="tutor-card-title text-lg font-bold transition-colors">{name}</h3><BadgeCheck size={15} className="tutor-card-verified" /></div>
              <p className="tutor-card-muted text-sm line-clamp-1">{title || '漫剧创作导师'}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span key={index} className="tutor-card-tag px-2.5 py-1 text-xs font-medium rounded-full border">
                {tag}
              </span>
            ))}
          </div>

          <div className="tutor-card-muted flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5"><ImageIcon size={13} className="tutor-card-accent" /> {works.length} 份作品</span>
            <span className="inline-flex items-center gap-1.5"><span className="tutor-card-dot h-1 w-1 rounded-full" /> 资料已审核</span>
          </div>

          <div className="tutor-card-footer mt-auto pt-4 border-t">
            <div className="tutor-card-muted flex items-center justify-between text-xs mb-2">
              <span className="flex items-center gap-1"><Star size={12}/> 精选作品</span>
              <button 
                onClick={handleEnrollClick}
                className="tutor-card-action flex items-center gap-1 transition-colors font-medium z-20 relative px-3 py-1.5 rounded-full"
              >
                直接报名 <ChevronRight size={12}/>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {works.slice(0, 3).map((work, idx) => {
                const isVideo = work.type === 'video';
                const imgUrl = typeof work === 'string' ? work : (work.url || '');
                return (
                  <div 
                    key={idx} 
                    onClick={(e) => handleWorkClick(e, work)}
                    className="tutor-card-media aspect-square rounded-md overflow-hidden relative group/work z-20 flex items-center justify-center"
                  >
                    {!isVideo ? (
                      <img src={imgUrl} alt="导师作品" className="w-full h-full object-cover opacity-80 group-hover/work:opacity-100 group-hover/work:scale-110 transition-all duration-500" />
                    ) : (
                      <div className="tutor-card-video text-[10px] font-bold w-full h-full flex flex-col gap-1 items-center justify-center"><Play size={15} fill="currentColor" /> 视频</div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/work:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-[10px] font-medium">{isVideo ? '播放' : '放大'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 独立的作品大图浏览（暗房模式） */}
      <AnimatePresence>
        {lightboxWork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { e.stopPropagation(); setLightboxWork(null); }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4"
          >
            <button 
              className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-[80]"
              onClick={(e) => { e.stopPropagation(); setLightboxWork(null); }}
            >
              <X size={24} />
            </button>
            
            {lightboxWork.type === 'video' ? (
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="w-full max-w-4xl aspect-video rounded-lg shadow-2xl bg-black overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
              >
                <iframe src={lightboxWork.url} className="w-full h-full border-0" allowFullScreen></iframe>
              </motion.div>
            ) : (
              <motion.img 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                src={typeof lightboxWork === 'string' ? lightboxWork : lightboxWork.url} 
                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" 
                alt="作品预览"
                onClick={(e) => e.stopPropagation()} 
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
