import { courses } from './courses';

/** 课程编号 → 价格（用于报名后写入线索快照） */
export const coursePriceByCode = (code?: string | null): string => {
  if (!code) return '';
  return courses.find(course => course.code === code)?.price || '';
};

/** 课程名称 → 价格（用于线索缺少价格快照时的兜底展示） */
export const coursePriceByName = (title?: string | null): string => {
  if (!title) return '';
  const matched = courses.find(course => course.title === title);
  return matched?.price || '';
};

/**
 * 线索展示用价格：优先使用报名时写入的快照，
 * 历史数据没有快照时按课程名称回落到当前课程配置。
 */
export const resolveLeadCoursePrice = (courseName?: string | null, coursePrice?: string | number | null): string => {
  const snapshot = coursePrice === null || coursePrice === undefined ? '' : String(coursePrice).trim();
  return snapshot || coursePriceByName(courseName);
};
