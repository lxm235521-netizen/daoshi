import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, X } from 'lucide-react';
import type { CourseInfo } from '../content/courses';
import type { Tutor } from './RegistrationDrawer';

interface CourseDetailModalProps {
  course: CourseInfo | null;
  tutors: Tutor[];
  selectedTutorId: string;
  onTutorChange: (value: string) => void;
  onClose: () => void;
  onEnroll: () => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({ course, tutors, selectedTutorId, onTutorChange, onClose, onEnroll }) => {
  return (
    <AnimatePresence>
      {course && (
        <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="course-modal w-full max-w-3xl border border-[#1d1f23] bg-[#f7f4ec] text-[#101114] shadow-[0_24px_80px_rgba(16,17,20,.18)]" initial={{ y: 30, opacity: 0, scale: .98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0, scale: .98 }} onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-[#101114]/10 px-6 py-5">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[#777871]">{course.code}</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">{course.title}</h2>
              </div>
              <button type="button" onClick={onClose} aria-label="关闭课程详情" className="grid h-11 w-11 place-items-center border border-[#101114]/15 bg-white text-[#101114] transition-colors hover:bg-[#101114] hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.2fr_.8fr]">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="border border-[#101114] px-3 py-1 text-xs font-bold">{course.badge}</span>
                  <span className="text-sm font-bold text-[#777871]">{course.duration}</span>
                  <span className="text-sm font-bold text-[#101114]">¥{course.price}</span>
                </div>
                <p className="max-w-xl text-[15px] leading-8 text-[#4d4e49]">{course.summary}</p>
                <div className="space-y-3 border-t border-[#101114]/10 pt-5">
                  {course.details.map(item => (
                    <div key={item} className="flex gap-3 text-[14px] leading-7 text-[#2f302c]"><Check size={18} className="mt-1 shrink-0 text-[#d9ff4f]" />{item}</div>
                  ))}
                </div>
              </div>
              <div className="space-y-4 border-l border-[#101114]/10 pl-0 md:pl-6">
                <div>
                  <p className="text-xs font-bold tracking-[0.18em] text-[#777871]">报名导师</p>
                  <select value={selectedTutorId} onChange={e => onTutorChange(e.target.value)} className="mt-2 w-full border border-[#101114]/15 bg-white px-4 py-3 text-sm text-[#101114] outline-none">
                    <option value="">请选择导师</option>
                    {tutors.map(tutor => <option key={tutor.id} value={String(tutor.id)}>{tutor.name}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.18em] text-[#777871]">适合人群</p>
                  <p className="mt-2 text-sm leading-7 text-[#4d4e49]">{course.fit}</p>
                </div>
                <button type="button" onClick={onEnroll} disabled={!selectedTutorId} className="mt-2 inline-flex w-full items-center justify-center gap-3 bg-[#101114] px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-[#ff5a45] disabled:cursor-not-allowed disabled:bg-[#b6b7b1]">
                  预约报名 <ArrowRight size={16} />
                </button>
                <p className="text-xs leading-6 text-[#777871]">报名后会进入后台线索池，管理员会根据课程和导师意向分配。</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
