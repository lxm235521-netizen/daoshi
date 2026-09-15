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
  featured?: boolean;
}

export const TutorCard: React.FC<TutorCardProps> = ({ name, title, avatar, tags, works, onEnrollClick, onProfileClick, featured }) => {
  const [lightboxWork, setLightboxWork] = useState<any>(null);
  const handleWorkClick = (e: React.MouseEvent, work: any) => { e.stopPropagation(); setLightboxWork(work); };
  const handleEnrollClick = (e: React.MouseEvent) => { e.stopPropagation(); onEnrollClick(); };

  return <>
    <motion.div onClick={onProfileClick} whileHover={{ y: -6 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="group flex cursor-pointer flex-col overflow-hidden border border-[#101114]/15 bg-white">
      <div className="flex h-full flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-4"><div className="h-16 w-16 overflow-hidden border border-[#101114]/15 bg-[#eeeae0]"><img src={avatar || '/assets/mentor.jpg'} alt={name} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = '/assets/mentor.jpg'; }} /></div><div><div className="flex items-center gap-2"><h3 className="text-lg font-black text-[#101114]">{name}</h3><BadgeCheck size={15} className="text-[#ff5a45]" /></div><p className="mt-1 line-clamp-1 text-sm text-[#4d4e49]">{title || '漫剧创作导师'}</p></div></div>{featured && <span className="border border-[#101114] bg-[#d9ff4f] px-2 py-1 text-[11px] font-black text-[#101114]">精选</span>}</div>
        <div className="flex flex-wrap gap-2">{tags.map((tag, index) => <span key={index} className="border border-[#101114]/15 bg-[#f7f4ec] px-2.5 py-1 text-xs font-bold text-[#101114]">{tag}</span>)}</div>
        <div className="flex items-center gap-4 text-xs text-[#777871]"><span className="inline-flex items-center gap-1.5"><ImageIcon size={13} className="text-[#ff5a45]" /> {works.length} 份作品</span><span className="inline-flex items-center gap-1.5"><span className="h-1 w-1 bg-[#101114]" /> 资料已审核</span></div>
        <div className="mt-auto border-t border-[#101114]/10 pt-4"><div className="mb-3 flex items-center justify-between text-xs text-[#777871]"><span className="inline-flex items-center gap-1"><Star size={12} className="text-[#ff5a45]" /> 精选作品</span><button onClick={handleEnrollClick} className="inline-flex items-center gap-1 border border-[#101114]/15 px-3 py-1.5 font-bold text-[#101114] transition-colors hover:bg-[#101114] hover:text-white">直接报名 <ChevronRight size={12} /></button></div><div className="grid grid-cols-3 gap-2">{works.slice(0, 3).map((work, idx) => { const isVideo = work.type === 'video'; const imgUrl = typeof work === 'string' ? work : (work.url || ''); return <div key={idx} onClick={(e) => handleWorkClick(e, work)} className="relative aspect-square overflow-hidden border border-[#101114]/10 bg-[#f2efe6]">{!isVideo ? <img src={imgUrl} alt="导师作品" className="h-full w-full object-cover opacity-85 transition-transform duration-500 hover:scale-110" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <div className="flex h-full w-full flex-col items-center justify-center bg-[#101114] text-[10px] font-bold text-white"><Play size={15} fill="currentColor" /> 视频</div>}<div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity hover:opacity-100"><span className="text-white text-[10px] font-medium">{isVideo ? '播放' : '放大'}</span></div></div>; })}</div></div>
      </div>
    </motion.div>

    <AnimatePresence>
      {lightboxWork && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => { e.stopPropagation(); setLightboxWork(null); }} className="fixed inset-0 z-[70] flex items-center justify-center bg-[#101114]/90 p-4"><button aria-label="关闭作品预览" className="absolute right-6 top-6 grid h-10 w-10 place-items-center border border-white/20 bg-white/10 text-white transition-colors hover:bg-[#d9ff4f] hover:text-[#101114]" onClick={e => { e.stopPropagation(); setLightboxWork(null); }}><X size={20} /></button>{lightboxWork.type === 'video' ? <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative aspect-video w-full max-w-4xl overflow-hidden bg-black shadow-2xl" onClick={e => e.stopPropagation()}><iframe src={lightboxWork.url} className="h-full w-full border-0" allowFullScreen /></motion.div> : <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={typeof lightboxWork === 'string' ? lightboxWork : lightboxWork.url} className="max-h-[90vh] max-w-full shadow-2xl" alt="作品预览" onClick={e => e.stopPropagation()} />}</motion.div>}
    </AnimatePresence>
  </>;
};
