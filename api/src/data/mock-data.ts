export type UserStatus = 'active' | 'inactive';
export type UserRole = 'student' | 'admin';
export type VideoStatus = 'completed' | 'in-progress' | 'available' | 'locked';

export interface Course {
  id: number;
  title: string;
  thumbnail: string;
  progress: number;
  totalVideos: number;
  completedVideos: number;
}

export interface CourseVideo {
  id: number;
  chapterId: number;
  order: number;
  title: string;
  duration: string;
  status: VideoStatus;
  progress?: number;
  videoUrl: string;
}

export interface CurriculumChapter {
  id: number;
  order: number;
  title: string;
  videos: CourseVideo[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  role: UserRole;
  courses: number[];
}

export interface UserProgressItem {
  progress: number;
  completed: number;
  total: number;
  lastWatched: string;
}

export const COURSES: Course[] = [
  {
    id: 1,
    title: 'Webデザイン基礎コース',
    thumbnail: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=400&h=225&fit=crop&auto=format',
    progress: 65,
    totalVideos: 20,
    completedVideos: 13,
  },
  {
    id: 2,
    title: 'JavaScript完全マスター',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=225&fit=crop&auto=format',
    progress: 30,
    totalVideos: 35,
    completedVideos: 10,
  },
  {
    id: 3,
    title: 'React & Next.js 実践入門',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop&auto=format',
    progress: 0,
    totalVideos: 28,
    completedVideos: 0,
  },
  {
    id: 4,
    title: 'UI/UXデザイン実践',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop&auto=format',
    progress: 100,
    totalVideos: 15,
    completedVideos: 15,
  },
];

const SAMPLE_VIDEO_URL = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

export const CURRICULUM: CurriculumChapter[] = [
  {
    id: 1,
    order: 1,
    title: '第1章：HTMLの基礎',
    videos: [
      { id: 1, chapterId: 1, order: 1, title: 'HTMLとは何か', duration: '8:23', status: 'completed', videoUrl: SAMPLE_VIDEO_URL },
      { id: 2, chapterId: 1, order: 2, title: '基本的なタグの使い方', duration: '12:45', status: 'completed', videoUrl: SAMPLE_VIDEO_URL },
      { id: 3, chapterId: 1, order: 3, title: 'フォームの作成', duration: '15:10', status: 'in-progress', progress: 45, videoUrl: SAMPLE_VIDEO_URL },
    ],
  },
  {
    id: 2,
    order: 2,
    title: '第2章：CSSスタイリング',
    videos: [
      { id: 4, chapterId: 2, order: 1, title: 'CSSセレクタの基礎', duration: '10:30', status: 'available', videoUrl: SAMPLE_VIDEO_URL },
      { id: 5, chapterId: 2, order: 2, title: 'Flexboxレイアウト', duration: '18:22', status: 'locked', videoUrl: SAMPLE_VIDEO_URL },
      { id: 6, chapterId: 2, order: 3, title: 'Gridレイアウト', duration: '20:15', status: 'locked', videoUrl: SAMPLE_VIDEO_URL },
    ],
  },
  {
    id: 3,
    order: 3,
    title: '第3章：レスポンシブデザイン',
    videos: [
      { id: 7, chapterId: 3, order: 1, title: 'メディアクエリの使い方', duration: '13:40', status: 'locked', videoUrl: SAMPLE_VIDEO_URL },
      { id: 8, chapterId: 3, order: 2, title: 'モバイルファースト設計', duration: '16:55', status: 'locked', videoUrl: SAMPLE_VIDEO_URL },
    ],
  },
];

export const USERS: User[] = [
  { id: 1, name: '田中 花子', email: 'tanaka@example.com', status: 'active', role: 'student', courses: [1, 2] },
  { id: 2, name: '佐藤 太郎', email: 'sato@example.com', status: 'active', role: 'student', courses: [1, 3] },
  { id: 3, name: '鈴木 一郎', email: 'suzuki@example.com', status: 'inactive', role: 'student', courses: [2] },
  { id: 4, name: '高橋 美穂', email: 'takahashi@example.com', status: 'active', role: 'admin', courses: [1, 2, 3, 4] },
  { id: 5, name: '伊藤 健太', email: 'ito@example.com', status: 'active', role: 'student', courses: [3, 4] },
];

export const USER_PROGRESS: Record<number, Record<number, UserProgressItem>> = {
  1: {
    1: { progress: 65, completed: 13, total: 20, lastWatched: 'フォームの作成' },
    2: { progress: 30, completed: 10, total: 35, lastWatched: 'CSSセレクタの基礎' },
  },
  2: {
    1: { progress: 42, completed: 8, total: 20, lastWatched: '基本的なタグの使い方' },
    3: { progress: 11, completed: 3, total: 28, lastWatched: 'React基礎 第1回' },
  },
  3: {
    2: { progress: 80, completed: 28, total: 35, lastWatched: 'Gridレイアウト' },
  },
  4: {
    1: { progress: 100, completed: 20, total: 20, lastWatched: '完了' },
    2: { progress: 57, completed: 20, total: 35, lastWatched: 'Flexboxレイアウト' },
    3: { progress: 25, completed: 7, total: 28, lastWatched: 'コンポーネント設計入門' },
    4: { progress: 100, completed: 15, total: 15, lastWatched: '完了' },
  },
  5: {
    3: { progress: 64, completed: 18, total: 28, lastWatched: '状態管理パターン' },
    4: { progress: 47, completed: 7, total: 15, lastWatched: 'ワイヤーフレーム作成' },
  },
};

export function getCourseById(id: number) {
  return COURSES.find((course) => course.id === id);
}

export function getCurriculumByCourseId(courseId: number) {
  return {
    courseId,
    chapters: [...CURRICULUM].sort((left, right) => left.order - right.order),
  };
}

export function getUserById(id: number) {
  return USERS.find((user) => user.id === id);
}

export function createUser(input: Pick<User, 'name' | 'email'> & Partial<Pick<User, 'status' | 'role' | 'courses'>>) {
  const nextId = Math.max(...USERS.map((user) => user.id)) + 1;
  const createdUser: User = {
    id: nextId,
    name: input.name,
    email: input.email,
    status: input.status ?? 'active',
    role: input.role ?? 'student',
    courses: input.courses ?? [],
  };

  USERS.push(createdUser);
  return createdUser;
}

export function updateUser(id: number, input: Partial<Pick<User, 'name' | 'email' | 'status' | 'role' | 'courses'>>) {
  const user = getUserById(id);
  if (!user) {
    return undefined;
  }

  Object.assign(user, input);
  return user;
}