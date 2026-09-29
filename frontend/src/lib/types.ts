export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export type ModuleStatus = 'not_started' | 'in_progress' | 'completed';

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  durationSeconds: number;
  orderIndex: number;
  completed: boolean;
  lastPositionSeconds: number;
}

export interface CourseModule {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  orderIndex: number;
  material: { title: string; key: string } | null;
  lessons: Lesson[];
  totalLessons: number;
  completedLessons: number;
  durationSeconds: number;
  percent: number;
  status: ModuleStatus;
  locked: boolean;
}

export interface Course {
  modules: CourseModule[];
  totalLessons: number;
  completedLessons: number;
  percent: number;
  completed: boolean;
  nextLessonId: string | null;
  sequentialUnlock: boolean;
}

export interface LessonDetail {
  lesson: Lesson;
  module: { id: string; slug: string; title: string; orderIndex: number };
  stream: { url: string; expiresAt: string; demo: boolean };
  downloads: { title: string; url: string }[];
  note: { content: string; updated_at: string | null };
  prev: { id: string; slug: string; title: string } | null;
  next: { id: string; slug: string; title: string; locked: boolean } | null;
  watermark: string | null;
  coursePercent: number;
}
