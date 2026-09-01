import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, LogIn, Sparkles, UsersRound } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { TutorCard } from '../components/TutorCard';
import { RegistrationDrawer } from '../components/RegistrationDrawer';
import { TutorProfileModal } from '../components/TutorProfileModal';
import type { Tutor } from '../components/RegistrationDrawer';

const focusAreas = [
  { label: '全部方向', value: 'all' },
  { label: '剧本与大纲', value: '剧本' },
  { label: '提示词工程', value: '提示词' },
  { label: '分镜设计', value: '分镜' },
  { label: '人工智能出图', value: 'AI' },
  { label: '音频与后期', value: '后期' }
];

const parseTags = (tags: unknown): string[] => {
  if (Array.isArray(tags)) return tags.filter((tag): tag is string => typeof tag === 'string');
  if (typeof tags === 'string') {
    try { return parseTags(JSON.parse(tags)); } catch { return tags.split(',').map(tag => tag.trim()).filter(Boolean); }
  }
  return [];
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFocus, setActiveFocus] = useState('all');
  const [selectedTutorForEnroll, setSelectedTutorForEnroll] = useState<Tutor | null>(null);
  const [selectedTutorForProfile, setSelectedTutorForProfile] = useState<Tutor | null>(null);
  const currentUserString = localStorage.getItem('manju_user');
  const currentUser = currentUserString ? JSON.parse(currentUserString) : null;
  const workspacePath = currentUser?.role === 'tutor' ? '/tutor' : '/admin';

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await axios.get('/api/tutors');
        setTutors(res.data.map((t: any) => ({
          id: t.id,
          name: t.name,
          title: t.title,
          avatar: t.avatar,
          bio: t.bio || '',
          tags: parseTags(t.tags),
          works: t.works || [],
          fullWorks: t.works
        })));
      } catch (err) {
        console.error('获取导师列表失败', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, []);

  const filteredTutors = useMemo(
    () => activeFocus === 'all'
      ? tutors
      : tutors.filter(tutor => `${tutor.title} ${tutor.tags.join(' ')}`.toLowerCase().includes(activeFocus.toLowerCase())),
    [activeFocus, tutors]
  );

  const selectFocus = (value: string) => {
    setActiveFocus(value);
    document.getElementById('mentor-index')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#09070f] text-gray-100 selection:bg-fuchsia-500/30">
      <div className="home-ambient-glow pointer-events-none fixed inset-0" />

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <button type="button" onClick={() => navigate('/')} className="group flex items-center gap-3" aria-label="返回漫剧社区首页">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-200 shadow-[0_0_28px_rgba(217,70,239,.16)]"><Sparkles size={17} /></span>
          <span className="text-left"><span className="block text-sm font-semibold tracking-[0.18em] text-white">漫剧</span><span className="block text-[10px] tracking-[0.12em] text-gray-500">漫剧本创作者导师库</span></span>
        </button>
        {currentUser ? (
          <button type="button" onClick={() => navigate(workspacePath)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-gray-200 transition-all hover:border-fuchsia-300/30 hover:bg-white/10">
            <ArrowLeft size={15} /> 返回{currentUser.role === 'tutor' ? '导师工作台' : '管理后台'}
          </button>
        ) : (
          <button type="button" onClick={() => navigate('/login')} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-gray-300 transition-all hover:border-fuchsia-300/30 hover:bg-white/10">
            <LogIn size={15} /> 登录
          </button>
        )}
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-10">
        <section className="mx-auto flex max-w-4xl flex-col items-center pb-14 pt-16 text-center sm:pt-24">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
            <h1 className="home-hero-title text-5xl font-semibold leading-[1.08] tracking-[-0.065em] sm:text-7xl">
              跟随顶尖创作者，<br />开启你的漫剧之旅。
            </h1>
            <p className="mx-auto mt-7 whitespace-normal text-xs leading-7 text-gray-400 sm:whitespace-nowrap sm:text-base">
              这里汇聚全网优秀的剧本、分镜、人工智能绘画与后期导师。选择你的领路人，将灵感化为惊艳的作品。
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .15 }} className="mt-10 flex flex-wrap justify-center gap-2">
            {focusAreas.map(area => (
              <button
                key={area.value}
                type="button"
                onClick={() => selectFocus(area.value)}
                className={`home-focus-filter rounded-full border px-5 py-2.5 text-xs font-medium transition-all ${activeFocus === area.value ? 'home-focus-filter-active' : ''}`}
              >
                {area.label}
              </button>
            ))}
          </motion.div>
        </section>

        <section id="mentor-index" className="scroll-mt-6 border-t border-white/[0.08] pt-10">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map(item => <div key={item} className="h-[390px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />)}</div>
          ) : filteredTutors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 py-20 text-center text-sm text-gray-500">这个方向暂时还没有公开导师，试试浏览全部方向。</div>
          ) : (
            <motion.div layout className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredTutors.map((tutor, index) => (
                <motion.div layout key={tutor.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }}>
                  <TutorCard {...tutor} onEnrollClick={() => setSelectedTutorForEnroll(tutor)} onProfileClick={() => setSelectedTutorForProfile(tutor)} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        <section className="mt-24 border-t border-white/[0.08] pt-14">
          <div className="mb-8">
            <p className="text-[10px] tracking-[0.25em] text-fuchsia-200/60">简单三步，完成撮合</p>
            <h2 className="mt-2 text-2xl font-medium tracking-tight text-white sm:text-3xl">不必独自摸索，让学习有一条路径。</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">平台只做信息撮合。你可以先浏览导师作品，再留下学习意向，由管理员协助联系与分配。</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [BookOpen, '选择方向', '按兴趣和目标筛选导师。'],
              [UsersRound, '查看作品', '了解导师方法与创作风格。'],
              [CheckCircle2, '提交报名', '平台协助完成后续撮合。']
            ].map(([Icon, title, desc], index) => {
              const StepIcon = Icon as React.ElementType;
              return (
                <div key={title as string} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-colors hover:border-fuchsia-300/20 hover:bg-white/[0.05]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-300/10 text-fuchsia-200"><StepIcon size={17} /></span>
                  <p className="mt-10 text-xs text-gray-600">步骤 0{index + 1}</p>
                  <h3 className="mt-2 text-base font-medium text-white">{title as string}</h3>
                  <p className="mt-2 text-xs leading-5 text-gray-500">{desc as string}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <RegistrationDrawer isOpen={selectedTutorForEnroll !== null} onClose={() => setSelectedTutorForEnroll(null)} tutor={selectedTutorForEnroll} />
      <TutorProfileModal isOpen={selectedTutorForProfile !== null} onClose={() => setSelectedTutorForProfile(null)} tutor={selectedTutorForProfile} onEnrollClick={tutor => setSelectedTutorForEnroll(tutor)} />
    </div>
  );
};
