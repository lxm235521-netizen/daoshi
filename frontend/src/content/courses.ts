export interface CourseInfo {
  /** 后台课程表主键；静态兜底数据没有该字段 */
  id?: string;
  code: string;
  title: string;
  badge: string;
  duration: string;
  price: string;
  summary: string;
  details: string[];
  fit: string;
  /** 后台排序值与上架状态，仅接口数据携带 */
  sortOrder?: number;
  isActive?: boolean;
}

export const courses: CourseInfo[] = [
  {
    code: 'COURSE-01',
    title: '小说转剧本课',
    badge: '录播课',
    duration: '随时学 · 反复看',
    price: '68',
    summary: '把小说语言翻译成镜头语言。涵盖冲突提炼、人物动机、场景拆分与可拍摄的剧本格式。',
    details: [
      '拆解叙事骨架，找到真正能拍的戏眼。',
      '把长篇小说改成更适合短内容传播的场景节奏。',
      '输出可直接进入分镜与生成环节的剧本结构。'
    ],
    fit: '适合：小说作者 / 入门创作者'
  },
  {
    code: 'COURSE-02',
    title: 'AI 创作工作流课',
    badge: '1 小时',
    duration: '核心流程 · 快速入门',
    price: '100',
    summary: '用一套清晰流程串联灵感、提示词、分镜与生成工具，减少反复试错，稳定推进项目。',
    details: [
      '建立从灵感到成片的标准工作顺序。',
      '统一提示词、参考图和生成记录的管理方式。',
      '用低成本步骤把卡点从“试出来”改成“流程化”。'
    ],
    fit: '适合：想提升效率的创作者'
  },
  {
    code: 'COURSE-03',
    title: '即梦实战工作流',
    badge: '2 小时',
    duration: '完整实战 · 案例拆解',
    price: '298',
    summary: '从参考图、角色一致性到动态生成与成片复盘，完整跑通即梦 AI 影像制作链路。',
    details: [
      '理解角色一致性、镜头节奏和素材复用的关系。',
      '把单张图、连续镜头和动效素材组织成可交付成片。',
      '通过案例复盘减少参数碰运气。'
    ],
    fit: '适合：准备独立完成作品的人'
  }
];

const normalizeDetails = (details: unknown): string[] => {
  if (Array.isArray(details)) return details.filter((item): item is string => typeof item === 'string');
  if (typeof details === 'string') {
    try {
      const parsed = JSON.parse(details);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
    } catch {
      return details.split('\n').map(item => item.trim()).filter(Boolean);
    }
  }
  return [];
};

const normalizeCourse = (raw: any): CourseInfo => ({
  id: raw?.id,
  code: String(raw?.code ?? ''),
  title: String(raw?.title ?? ''),
  badge: String(raw?.badge ?? ''),
  duration: String(raw?.duration ?? ''),
  price: String(raw?.price ?? ''),
  summary: String(raw?.summary ?? ''),
  details: normalizeDetails(raw?.details),
  fit: String(raw?.fit ?? ''),
  sortOrder: typeof raw?.sortOrder === 'number' ? raw.sortOrder : undefined,
  isActive: typeof raw?.isActive === 'boolean' ? raw.isActive : undefined
});

/**
 * 读取后台维护的课程展示数据。
 * 接口不可用时回落到本文件内置的静态课程，保证展示页不会空白。
 */
export const fetchPublicCourses = async (): Promise<CourseInfo[]> => {
  try {
    const { default: axios } = await import('axios');
    const res = await axios.get('/api/courses');
    const list = Array.isArray(res.data) ? res.data.map(normalizeCourse).filter(course => course.code && course.title) : [];
    return list.length ? list : courses;
  } catch {
    return courses;
  }
};
