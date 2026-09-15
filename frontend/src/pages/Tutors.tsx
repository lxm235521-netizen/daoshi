import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { TutorCard } from '../components/TutorCard';
import { TutorProfileModal } from '../components/TutorProfileModal';
import { RegistrationDrawer, type Tutor } from '../components/RegistrationDrawer';
import { courses as fallbackCourses, fetchPublicCourses, type CourseInfo } from '../content/courses';

export const Tutors: React.FC = () => {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseList, setCourseList] = useState<CourseInfo[]>(fallbackCourses);
  const [selectedTutorForProfile, setSelectedTutorForProfile] = useState<Tutor | null>(null);
  const [selectedTutorForEnroll, setSelectedTutorForEnroll] = useState<Tutor | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    axios.get('/api/tutors').then(res => {
      setTutors(res.data.map((t: any) => ({ ...t, tags: Array.isArray(t.tags) ? t.tags : [], works: t.works || [] })));
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let active = true;
    fetchPublicCourses().then(list => { if (active) setCourseList(list); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return tutors.filter(tutor => `${tutor.name} ${tutor.title} ${(tutor.tags || []).join(' ')}`.toLowerCase().includes(q));
  }, [query, tutors]);

  return (
    <div className="public-shell min-h-screen bg-[#f7f4ec] text-[#101114]">
      <nav className="sticky top-0 z-40 border-b border-[#101114]/15 bg-[#f7f4ec]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-6">
          <button type="button" onClick={() => navigate('/')} className="flex items-center gap-3 text-left font-black"><span className="grid h-8 w-8 -rotate-3 place-items-center bg-[#101114] text-xs text-[#d9ff4f]">AI</span>漫剧工作流</button>
          <button type="button" onClick={() => navigate('/')} className="inline-flex items-center gap-2 border border-[#101114] px-4 py-2 text-sm font-bold transition-colors hover:bg-[#101114] hover:text-white"><ArrowLeft size={15} /> 返回首页</button>
        </div>
      </nav>
      <header className="border-b border-[#101114]/15 bg-[linear-gradient(rgba(16,17,20,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,17,20,.1)_1px,transparent_1px)] bg-[length:64px_64px]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 md:flex-row md:items-end md:justify-between md:py-20">
          <div><p className="flex items-center gap-3 text-sm font-bold text-[#54564f] before:h-[3px] before:w-8 before:bg-[#ff5a45] before:content-['']">02 / 导师阵容</p><h1 className="mt-5 text-5xl font-black leading-none tracking-tight md:text-7xl">找到适合你的<br /><span className="text-[#ff5a45]">创作搭档。</span></h1><p className="mt-6 max-w-xl text-sm leading-7 text-[#4d4e49]">按擅长方向浏览导师，查看真实作品与教学履历，再预约适合你当前阶段的创作支持。</p></div>
          <label className="relative block w-full md:w-80"><span className="sr-only">搜索导师</span><Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#777871]" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索姓名、方向或标签" className="w-full border border-[#101114]/20 bg-[#f7f4ec] py-3.5 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-[#777871] focus:border-[#101114]" /></label>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-12">
        <div className="mb-7 flex items-center justify-between border-b border-[#101114]/15 pb-4"><p className="text-sm font-bold text-[#777871]">{loading ? '正在加载' : `${filtered.length} 位导师`}</p><span className="text-xs font-black uppercase tracking-[.18em] text-[#777871]">Mentor index</span></div>
        {loading ? <div className="py-24 text-center text-sm text-[#777871]">加载中...</div> : filtered.length === 0 ? <div className="border border-[#101114]/15 bg-white px-6 py-20 text-center"><p className="text-lg font-black">没有找到匹配的导师</p><p className="mt-2 text-sm text-[#777871]">换个关键词试试。</p></div> : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map(tutor => <TutorCard key={String(tutor.id)} {...tutor} onEnrollClick={() => setSelectedTutorForEnroll(tutor)} onProfileClick={() => setSelectedTutorForProfile(tutor)} />)}
          </div>
        )}
      </main>
      <TutorProfileModal isOpen={selectedTutorForProfile !== null} onClose={() => setSelectedTutorForProfile(null)} tutor={selectedTutorForProfile} onEnrollClick={tutor => setSelectedTutorForEnroll(tutor)} />
      <RegistrationDrawer isOpen={selectedTutorForEnroll !== null} onClose={() => setSelectedTutorForEnroll(null)} tutor={selectedTutorForEnroll} courses={courseList} tutors={tutors} />
    </div>
  );
};
