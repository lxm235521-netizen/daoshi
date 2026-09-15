import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LogIn } from 'lucide-react';
import { courses as fallbackCourses, fetchPublicCourses, type CourseInfo } from '../content/courses';
import { CourseDetailModal } from '../components/CourseDetailModal';
import { TutorRail } from '../components/TutorRail';
import { TutorProfileModal } from '../components/TutorProfileModal';
import { RegistrationDrawer, type Tutor } from '../components/RegistrationDrawer';

const parseTags = (tags: unknown): string[] => {
  if (Array.isArray(tags)) return tags.filter((tag): tag is string => typeof tag === 'string');
  if (typeof tags === 'string') { try { return parseTags(JSON.parse(tags)); } catch { return tags.split(',').map(tag => tag.trim()).filter(Boolean); } }
  return [];
};

const normalizeTutor = (t: any): Tutor => ({ id: t.id, name: t.name, title: t.title, avatar: t.avatar, bio: t.bio || '', tags: parseTags(t.tags), works: t.works || [], fullWorks: t.works });

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [allTutors, setAllTutors] = useState<Tutor[]>([]);
  const [courseList, setCourseList] = useState<CourseInfo[]>(fallbackCourses);
  const [featuredTutors, setFeaturedTutors] = useState<Tutor[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseInfo | null>(null);
  const [selectedCourseTutorId, setSelectedCourseTutorId] = useState('');
  const [selectedTutorForProfile, setSelectedTutorForProfile] = useState<Tutor | null>(null);
  const [selectedTutorForEnroll, setSelectedTutorForEnroll] = useState<Tutor | null>(null);
  const [enrollCourse, setEnrollCourse] = useState<CourseInfo | null>(null);
  const currentUserString = localStorage.getItem('manju_user');
  const currentUser = currentUserString ? JSON.parse(currentUserString) : null;
  const workspacePath = currentUser?.role === 'tutor' ? '/tutor' : '/admin';

  useEffect(() => {
    Promise.all([axios.get('/api/tutors'), axios.get('/api/tutors/featured')]).then(([allRes, featuredRes]) => {
      const all = allRes.data.map(normalizeTutor);
      const featured = featuredRes.data.map(normalizeTutor);
      setAllTutors(all);
      setFeaturedTutors(featured.length ? featured : all.slice(0, 4));
    }).catch(() => setFeaturedTutors([]));
  }, []);

  useEffect(() => {
    let active = true;
    fetchPublicCourses().then(list => { if (active) setCourseList(list); });
    return () => { active = false; };
  }, []);

  const selectedCourseTutor = useMemo(() => allTutors.find(tutor => String(tutor.id) === selectedCourseTutorId) || null, [allTutors, selectedCourseTutorId]);

  const openCourseEnroll = () => {
    if (!selectedCourse || !selectedCourseTutor) return;
    setEnrollCourse(selectedCourse);
    setSelectedTutorForEnroll(selectedCourseTutor);
    setSelectedCourse(null);
  };

  return (
    <div className="public-shell min-h-screen bg-[#f7f4ec] text-[#101114]">
      <nav className="sticky top-0 z-40 border-b border-[#101114]/15 bg-[#f7f4ec]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-6">
          <button type="button" onClick={() => navigate('/')} className="flex items-center gap-3 text-left font-black"><span className="grid h-8 w-8 place-items-center bg-[#101114] text-xs text-[#d9ff4f] -rotate-3">AI</span>漫剧工作流</button>
          <div className="hidden items-center gap-7 text-sm font-bold md:flex"><a href="#courses">课程</a><a href="#mentor">导师</a><a href="#results">战绩</a><a href="#stories">案例</a>{currentUser ? <button onClick={() => navigate(workspacePath)} className="border border-[#101114] px-4 py-2">返回后台</button> : <button onClick={() => navigate('/login')} className="inline-flex items-center gap-2 border border-[#101114] bg-[#101114] px-4 py-2 text-white"><LogIn size={15} /> 登录</button>}</div>
        </div>
      </nav>

      <header className="relative overflow-hidden border-b border-[#101114]/15 bg-[linear-gradient(rgba(16,17,20,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(16,17,20,.12)_1px,transparent_1px)] bg-[length:64px_64px] py-16 md:py-20">
        <div className="absolute right-[-22px] top-8 text-[130px] font-black leading-none text-[#101114]/[.035] md:text-[220px]">漫剧</div>
        <div className="relative mx-auto max-w-7xl px-6"><p className="flex items-center gap-3 text-sm font-bold text-[#54564f] before:h-[3px] before:w-8 before:bg-[#ff5a45] before:content-['']">不是只讲工具，是带你跑通漫剧工作流</p><h1 className="mt-6 max-w-5xl text-5xl font-black leading-[.98] tracking-tight md:text-8xl">从小白入门，<br />快速上手做漫剧。</h1><div className="mt-7 grid gap-8 md:grid-cols-[1.2fr_.8fr] md:items-end"><p className="max-w-2xl text-lg leading-8 text-[#4d4e49]">为小说作者、短视频创作者和 AI 新手设计的漫剧课程。用更容易上手的流程，带你完成从剧本改编、画面生成到漫剧成型的关键步骤。</p><div className="flex items-center gap-4 md:justify-end"><a href="#courses" className="inline-flex items-center gap-3 bg-[#101114] px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-[#ff5a45]">查看课程 <ArrowRight size={16} /></a><a href="#results" className="border-b border-[#101114] pb-1 text-sm font-bold">先看战绩</a></div></div></div>
      </header>
      <div className="overflow-hidden border-b border-[#101114] bg-[#d9ff4f]"><div className="ticker-line whitespace-nowrap py-3 text-sm font-black">小说转剧本 · AI 工作流 · 即梦实战 · GROK 课件 · 案例复盘 · 小说转剧本 · AI 工作流 · 即梦实战 · GROK 课件 · 案例复盘 · </div></div>

      <main>
        <section id="courses" className="mx-auto max-w-7xl px-6 py-20"><div className="mb-9 flex items-end justify-between gap-8"><div><span className="text-sm font-bold text-[#777871]">01 / 课程矩阵</span><h2 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">三步，做出第一支作品</h2></div><p className="hidden max-w-sm text-sm leading-7 text-[#777871] md:block">每门课都能单独学习，也能组合成完整路径。点击课程查看详情并选择导师报名。</p></div><div className="grid border-y border-[#101114] md:grid-cols-[1.25fr_1fr_1fr]">{courseList.map((course, index) => <button type="button" key={course.code} onClick={() => { setSelectedCourse(course); setSelectedCourseTutorId(''); }} className={`group flex min-h-[430px] flex-col border-[#101114] p-7 text-left transition-transform hover:-translate-y-1 ${index === 0 ? 'bg-[#1d1f23] text-white' : 'bg-[#f7f4ec] text-[#101114] md:border-l'}`}><div className="flex justify-between text-xs font-bold"><span className={index === 0 ? 'text-[#d5d7cf]' : 'text-[#777871]'}>COURSE 0{index + 1}</span><span className="border border-current px-2 py-1">{course.badge}</span></div><div className={`flex h-28 items-center text-5xl font-black ${index === 0 ? 'text-[#d9ff4f]' : 'text-[#ff5a45]'}`}>{index === 0 ? 'Aa -> ▷' : index === 1 ? '⌘' : '✦'}</div><h3 className="text-3xl font-black">{course.title}</h3><p className={`mt-4 text-sm leading-7 ${index === 0 ? 'text-[#c6c8c0]' : 'text-[#696a64]'}`}>{course.summary}</p><div className="mt-auto flex items-end justify-between border-t border-current/15 pt-7"><div className="text-5xl font-black"><small className="mr-1 text-sm">¥</small>{course.price}</div><div className="text-sm font-bold">{course.duration}</div></div><div className="mt-5 flex items-center justify-between text-sm font-black"><span>{course.fit}</span><span className={`grid h-8 w-8 place-items-center rounded-full ${index === 0 ? 'bg-[#d9ff4f] text-[#101114]' : 'bg-[#101114] text-white'}`}>↗</span></div></button>)}</div></section>

        <section id="mentor" className="overflow-hidden border-y border-[#101114]/15 bg-[#101114] py-20 text-white"><div className="mx-auto max-w-7xl px-6"><TutorRail tutors={featuredTutors} onOpenTutor={setSelectedTutorForProfile} onViewAll={() => navigate('/tutors')} /></div></section>

        <section id="results" className="mx-auto max-w-7xl px-6 py-20"><div className="mb-9 flex items-end justify-between gap-8"><div><span className="text-sm font-bold text-[#777871]">03 / 实战战绩</span><h2 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">结果，比参数更有说服力</h2></div></div><div className="grid grid-cols-12 gap-5"><article className="col-span-12 bg-[#ff5a45] p-6 text-white md:col-span-7"><span className="text-xs font-black">代表作品 / 全网播放</span><strong className="mt-10 block text-6xl font-black md:text-7xl">千万+</strong><p className="mt-3 text-sm leading-7">AI 漫剧作品全网累计播放突破千万，从剧本改编到最终成片全流程实战完成。</p></article><article className="col-span-12 border border-[#101114]/15 bg-white p-6 md:col-span-5"><span className="text-xs font-black">创作链路</span><strong className="mt-10 block text-5xl font-black">全流程</strong><p className="mt-3 text-sm leading-7 text-[#4d4e49]">覆盖故事提炼、剧本改编、分镜设计、画面生成与最终成片。</p></article><article className="col-span-12 border border-[#101114]/15 bg-white p-6 md:col-span-4"><span className="text-xs font-black">课程形态</span><strong className="mt-10 block text-5xl font-black">3 门</strong><p className="mt-3 text-sm leading-7 text-[#4d4e49]">从零入门到完整实战，按需选择。</p></article><article className="col-span-12 bg-[#d9ff4f] p-6 md:col-span-8"><span className="text-xs font-black">方法沉淀</span><strong className="mt-10 block text-5xl font-black">2 套</strong><p className="mt-3 text-sm leading-7 text-[#4d4e49]">GROK 结构化课件 + 即梦实操课件，覆盖从想法到成片的关键节点。</p></article></div></section>

        <section id="stories" className="mx-auto max-w-7xl px-6 pb-24"><span className="text-sm font-bold text-[#777871]">04 / 学员案例</span><h2 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">他们从“不会”，走到了这里</h2><div className="mt-10 border-t border-[#101114]">{[['/assets/student-1.jpg','阿简','网文作者 · 零剪辑基础','第一次知道文字要怎么拆成镜头。学完一周，把搁置半年的故事做成了 60 秒预告片。'],['/assets/student-2.jpg','老周','短视频创作者','最大的收获不是某条提示词，而是终于有了不会乱的流程，返工次数少了很多。'],['/assets/student-3.jpg','小桃','品牌运营 · AI 新手','2 小时跟着案例跑下来，角色一致性和动态镜头终于不再靠碰运气。']].map(item => <div key={item[1]} className="grid items-center gap-5 border-b border-[#101114]/15 py-7 md:grid-cols-[80px_1fr_1.4fr_30px]"><img src={item[0]} alt={`${item[1]}头像`} className="h-16 w-16 object-cover grayscale" /><div><b className="text-lg font-black">{item[1]}</b><em className="mt-1 block text-sm not-italic text-[#777871]">{item[2]}</em></div><p className="text-sm leading-7 text-[#555650]">“{item[3]}”</p><span className="text-xl">↗</span></div>)}</div></section>
      </main>

      <footer className="bg-[#101114] px-6 py-16 text-white"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-end"><h2 className="max-w-2xl text-4xl font-black leading-tight md:text-6xl">你有故事。<br />现在，把它<span className="text-[#d9ff4f]">拍出来。</span></h2><a href="#courses" className="inline-flex w-fit items-center gap-3 bg-white px-5 py-4 text-sm font-bold text-[#101114]">选择适合你的课 <ArrowRight size={16} /></a></div></footer>

      <CourseDetailModal course={selectedCourse} tutors={allTutors} selectedTutorId={selectedCourseTutorId} onTutorChange={setSelectedCourseTutorId} onClose={() => setSelectedCourse(null)} onEnroll={openCourseEnroll} />
      <TutorProfileModal isOpen={selectedTutorForProfile !== null} onClose={() => setSelectedTutorForProfile(null)} tutor={selectedTutorForProfile} onEnrollClick={tutor => { setEnrollCourse(null); setSelectedTutorForEnroll(tutor); }} />
      <RegistrationDrawer isOpen={selectedTutorForEnroll !== null} onClose={() => { setSelectedTutorForEnroll(null); setEnrollCourse(null); }} tutor={selectedTutorForEnroll} course={enrollCourse} courses={courseList} tutors={allTutors} />
    </div>
  );
};
