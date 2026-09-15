import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, BadgeCheck, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Tutor } from './RegistrationDrawer';

interface TutorRailProps {
  tutors: Tutor[];
  onOpenTutor: (tutor: Tutor) => void;
  onViewAll: () => void;
}

const fallbackTutor: Tutor = {
  id: 'featured-fallback',
  name: '主理人导师',
  title: '漫剧创作实战导师',
  avatar: '/assets/mentor.jpg',
  bio: '围绕真实创作中的卡点，带你从故事拆解、角色稳定、画面生成到最终成片跑通完整流程。',
  tags: ['小说改编', 'AI 工作流', '漫剧成片'],
  works: [],
};

export const TutorRail: React.FC<TutorRailProps> = ({ tutors, onOpenTutor, onViewAll }) => {
  const displayTutors = useMemo(() => (tutors.length > 0 ? tutors : [fallbackTutor]), [tutors]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeTutor = displayTutors[activeIndex] || displayTutors[0];
  const canOpenProfile = tutors.length > 0;

  useEffect(() => {
    setActiveIndex(index => Math.min(index, displayTutors.length - 1));
  }, [displayTutors.length]);

  useEffect(() => {
    if (displayTutors.length < 2 || isPaused) return;
    const timer = window.setInterval(() => {
      setActiveIndex(index => (index + 1) % displayTutors.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [displayTutors.length, isPaused]);

  const openTutorProfile = () => {
    if (canOpenProfile) onOpenTutor(activeTutor);
  };

  return (
    <div
      className="relative -mx-6 px-6 pt-16 sm:mx-0 sm:px-0 lg:pt-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute right-0 top-0 z-20 flex items-center gap-4">
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-2 border border-[#d9ff4f] bg-[#d9ff4f] px-4 py-2.5 text-xs font-black text-[#101114] transition-colors hover:bg-white"
        >
          查看所有导师 <ArrowUpRight size={14} />
        </button>
        <span className="text-xs font-bold text-[#aeb0a9]">
          {String(activeIndex + 1).padStart(2, '0')} / {String(displayTutors.length).padStart(2, '0')}
        </span>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(300px,.72fr)_minmax(0,1.28fr)] lg:items-center lg:gap-16">
        <button
          type="button"
          onClick={openTutorProfile}
          disabled={!canOpenProfile}
          className="group relative aspect-[4/5] max-h-[520px] overflow-hidden bg-[#292b2f] text-left disabled:cursor-default lg:aspect-[5/6]"
          aria-label={canOpenProfile ? `查看${activeTutor.name}的详细信息` : '导师展示'}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={`${activeTutor.id}-avatar`}
              src={activeTutor.avatar || '/assets/mentor.jpg'}
              alt={activeTutor.name}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              onError={(event) => {
                event.currentTarget.src = '/assets/mentor.jpg';
              }}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </AnimatePresence>
          <span className="absolute left-5 top-5 inline-flex items-center gap-2 border border-white/25 bg-[#101114]/75 px-3 py-2 text-[11px] font-black uppercase tracking-[.14em] text-white backdrop-blur-sm">
            <Sparkles size={13} className="text-[#d9ff4f]" /> 精选导师
          </span>
          <span className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
            <span className="max-w-[80%] text-lg font-black leading-tight text-white drop-shadow-md">{activeTutor.title || '主理人 / 实战导师'}</span>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#d9ff4f] text-[#101114]"><ArrowUpRight size={17} /></span>
          </span>
        </button>

        <div className="relative min-w-0">
          <div className="flex items-center gap-3 text-sm font-bold text-[#aeb0a9]"><span>02 / 导师</span><span className="h-px w-10 bg-[#d9ff4f]/70" /></div>
          <button
            type="button"
            onClick={openTutorProfile}
            disabled={!canOpenProfile}
            className="mt-3 block max-w-3xl text-left disabled:cursor-default"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTutor.id}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#d9ff4f]"><BadgeCheck size={14} /> 已认证导师</div>
                <h2 className="mt-3 text-5xl font-black leading-[.95] tracking-tight text-white md:text-7xl">{activeTutor.name}</h2>
                <p className="mt-5 max-w-xl text-xl font-black leading-tight text-[#d9ff4f]">{activeTutor.title || '漫剧创作实战导师'}</p>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-[#b8bab4] md:text-base">
                  {activeTutor.bio || '课程不是功能说明书。所有内容都围绕真实创作中的卡点设计：为什么故事不好看、为什么角色不稳定、为什么生成了一堆素材却剪不成片。'}
                </p>
              </motion.div>
            </AnimatePresence>
          </button>

          <div className="mt-7 flex flex-wrap gap-2">
            {activeTutor.tags.slice(0, 4).map(tag => (
              <span key={tag} className="border border-white/15 bg-white/[.06] px-3 py-1.5 text-[11px] font-bold text-[#e9ebe4]">
                {tag}
              </span>
            ))}
          </div>

          <button type="button" onClick={openTutorProfile} disabled={!canOpenProfile} className="mt-8 inline-flex items-center gap-2 border-b border-[#d9ff4f] pb-2 text-sm font-black text-white transition-colors hover:text-[#d9ff4f] disabled:cursor-default">
            查看导师履历 <ArrowUpRight size={16} className="text-[#d9ff4f]" />
          </button>

          {displayTutors.length > 1 && (
            <div className="mt-10 flex items-center gap-4" aria-label="导师轮播进度">
              <button type="button" onClick={() => setActiveIndex(index => (index - 1 + displayTutors.length) % displayTutors.length)} aria-label="上一位导师" className="grid h-8 w-8 place-items-center border border-white/20 text-white transition-colors hover:border-[#d9ff4f] hover:text-[#d9ff4f]"><ChevronLeft size={15} /></button>
              {displayTutors.map((tutor, index) => (
                <button
                  key={tutor.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`查看第${index + 1}位导师`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  className={`h-1.5 transition-all ${index === activeIndex ? 'w-10 bg-[#d9ff4f]' : 'w-5 bg-white/30 hover:bg-white/70'}`}
                />
              ))}
              <button type="button" onClick={() => setActiveIndex(index => (index + 1) % displayTutors.length)} aria-label="下一位导师" className="grid h-8 w-8 place-items-center border border-white/20 text-white transition-colors hover:border-[#d9ff4f] hover:text-[#d9ff4f]"><ChevronRight size={15} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
