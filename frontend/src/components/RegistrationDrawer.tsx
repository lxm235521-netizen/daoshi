import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, X } from 'lucide-react';
import axios from 'axios';
import type { CourseInfo } from '../content/courses';

export interface Tutor { id: number | string; name: string; title: string; avatar: string; bio?: string; tags: string[]; works: any[]; fullWorks?: any[]; }

interface RegistrationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: Tutor | null;
  course?: CourseInfo | null;
  courses?: CourseInfo[];
  tutors?: Tutor[];
  onTutorChange?: (tutor: Tutor | null) => void;
}

export const RegistrationDrawer: React.FC<RegistrationDrawerProps> = ({ isOpen, onClose, tutor, course, courses = [], tutors = [], onTutorChange }) => {
  const [selectedTutorId, setSelectedTutorId] = useState(tutor ? String(tutor.id) : '');
  const [selectedCourseCode, setSelectedCourseCode] = useState(course?.code || '');
  const [level, setLevel] = useState('');
  const [request, setRequest] = useState('');
  const [wechat, setWechat] = useState('');
  const [timeNote, setTimeNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedTutorId(tutor ? String(tutor.id) : '');
    setSelectedCourseCode(course?.code || '');
  }, [tutor, course, isOpen]);

  const selectedTutor = tutors.find(item => String(item.id) === selectedTutorId) || tutor || null;
  const selectedCourse = courses.find(item => item.code === selectedCourseCode) || course || null;
  const handleClose = () => { setSubmitted(false); setLevel(''); setRequest(''); setWechat(''); setTimeNote(''); setError(''); setSelectedCourseCode(''); onClose(); };
  const handleTutorChange = (value: string) => { setSelectedTutorId(value); onTutorChange?.(tutors.find(item => String(item.id) === value) || null); };

  const submitForm = async () => {
    if (!selectedCourse) { setError('请先选择一门课程'); return; }
    if (!selectedTutor) { setError('请先选择一位导师'); return; }
    if (!level || !request || !wechat) { setError('请完整填写基础水平、学习诉求和联系方式'); return; }
    setError(''); setIsSubmitting(true);
    try {
      await axios.post('/api/leads', { wechat, level, request, timeNote, intentTutorId: selectedTutor.id, courseName: selectedCourse.title, courseCode: selectedCourse.code, coursePrice: selectedCourse.price });
      setSubmitted(true);
    } catch (err: any) { setError(err.response?.data?.error || '网络请求失败，请稍后再试'); } finally { setIsSubmitting(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="fixed inset-0 z-[90] bg-[#101114]/55 backdrop-blur-sm" />
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="public-drawer fixed right-0 top-0 z-[100] h-full w-full max-w-md overflow-y-auto border-l border-[#101114]/15 bg-[#f7f4ec] p-6 text-[#101114] shadow-2xl sm:p-8">
          {!submitted ? <div className="flex min-h-full flex-col">
            <div className="mb-8 flex items-start justify-between gap-5"><div><p className="text-xs font-bold tracking-[0.18em] text-[#777871]">学习报名</p><h2 className="mt-2 text-2xl font-black">{selectedCourse?.title || '预约报名'}</h2></div><button type="button" onClick={handleClose} aria-label="关闭报名窗口" className="grid h-11 w-11 shrink-0 place-items-center border border-[#101114]/15 bg-white transition-colors hover:bg-[#101114] hover:text-white"><X size={18} /></button></div>
            <div className="flex-1 space-y-6">
              <div>
                <label htmlFor="registration-course" className="mb-2 block text-sm font-bold">选择课程<span className="text-[#ff5a45]"> *</span></label>
                <select id="registration-course" value={selectedCourseCode} onChange={e => setSelectedCourseCode(e.target.value)} className="w-full border border-[#101114]/20 bg-white px-4 py-3 text-sm outline-none focus:border-[#101114]">
                  <option value="">请选择课程</option>
                  {courses.map(item => <option key={item.code} value={item.code}>{item.title} · ¥{item.price}</option>)}
                </select>
                {selectedCourse && <p className="mt-2 text-xs leading-5 text-[#777871]">{selectedCourse.duration}</p>}
              </div>
              {tutors.length > 0 && <div><label htmlFor="registration-tutor" className="mb-2 block text-sm font-bold">选择导师<span className="text-[#ff5a45]"> *</span></label><select id="registration-tutor" value={selectedTutorId} onChange={e => handleTutorChange(e.target.value)} className="w-full border border-[#101114]/20 bg-white px-4 py-3 text-sm outline-none focus:border-[#101114]"><option value="">请选择导师</option>{tutors.map(item => <option key={item.id} value={String(item.id)}>{item.name} · {item.title || '漫剧创作导师'}</option>)}</select></div>}
              {selectedTutor && <div className="flex items-center gap-4 border border-[#101114]/15 bg-[#d9ff4f] p-4"><img src={selectedTutor.avatar || '/assets/mentor.jpg'} alt={selectedTutor.name} className="h-12 w-12 object-cover" /><div><p className="text-xs text-[#4d4e49]">意向导师</p><p className="font-black">{selectedTutor.name}</p></div></div>}
              {error && <div className="border border-[#ff5a45]/40 bg-[#ff5a45]/10 p-3 text-sm leading-6 text-[#9f2e21]" role="alert">{error}</div>}
              <div><p className="mb-3 text-sm font-bold">目前的水平<span className="text-[#ff5a45]"> *</span></p><div className="grid grid-cols-2 gap-3">{['零基础小白', '有一定基础'].map(item => <button type="button" key={item} onClick={() => setLevel(item)} className={`border px-3 py-3 text-sm font-semibold transition-colors ${level === item ? 'border-[#101114] bg-[#101114] text-white' : 'border-[#101114]/15 bg-white text-[#4d4e49] hover:border-[#101114]'}`}>{item}</button>)}</div></div>
              <div><label htmlFor="registration-request" className="mb-2 block text-sm font-bold">想解决什么问题<span className="text-[#ff5a45]"> *</span></label><textarea id="registration-request" value={request} onChange={e => setRequest(e.target.value)} placeholder="例如：想把自己的小说做成一支短预告片" rows={4} className="w-full resize-none border border-[#101114]/15 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#101114]" /></div>
              <div><label htmlFor="registration-contact" className="mb-2 block text-sm font-bold">微信 / QQ<span className="text-[#ff5a45]"> *</span></label><input id="registration-contact" value={wechat} onChange={e => setWechat(e.target.value)} placeholder="填写方便联系你的账号" className="w-full border border-[#101114]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#101114]" /></div>
              <div><label htmlFor="registration-time" className="mb-2 block text-sm font-bold">方便联系的时间</label><input id="registration-time" value={timeNote} onChange={e => setTimeNote(e.target.value)} placeholder="例如：工作日 19:00 后" className="w-full border border-[#101114]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#101114]" /></div>
            </div>
            <button type="button" onClick={submitForm} disabled={isSubmitting} className="mt-8 inline-flex w-full items-center justify-center gap-3 bg-[#101114] px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-[#ff5a45] disabled:cursor-not-allowed disabled:bg-[#aeb0a9]">{isSubmitting ? '提交中...' : '提交报名'} <ArrowRight size={17} /></button>
          </div> : <div className="flex min-h-full flex-col items-center justify-center text-center"><CheckCircle2 size={58} className="text-[#ff5a45]" /><h2 className="mt-6 text-3xl font-black">报名已提交</h2><p className="mt-4 max-w-xs text-sm leading-7 text-[#4d4e49]">管理员已经收到你的学习意向，会根据课程和导师尽快联系你。</p><button type="button" onClick={handleClose} className="mt-10 border border-[#101114] bg-[#d9ff4f] px-5 py-3 text-sm font-bold transition-colors hover:bg-[#101114] hover:text-white">返回浏览</button></div>}
        </motion.div>
      </>}
    </AnimatePresence>
  );
};
