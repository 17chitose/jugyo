import { useEffect, useRef, useState } from "react";
import {
  Play, CheckCircle2, Lock, ChevronDown, ChevronRight,
  Volume2, Maximize2, Pause, SkipForward, Users, Video,
  Upload, LogOut, Menu, X, Edit2, BookOpen, ChevronLeft,
  BarChart2,
} from "lucide-react";

type View =
  | "login"
  | "student-courses"
  | "student-curriculum"
  | "student-video"
  | "admin-users"
  | "admin-courses"
  | "admin-progress";

const COURSES = [
  {
    id: 1,
    title: "Webデザイン基礎コース",
    thumbnail: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=400&h=225&fit=crop&auto=format",
    progress: 65,
    totalVideos: 20,
    completedVideos: 13,
  },
  {
    id: 2,
    title: "JavaScript完全マスター",
    thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=225&fit=crop&auto=format",
    progress: 30,
    totalVideos: 35,
    completedVideos: 10,
  },
  {
    id: 3,
    title: "React & Next.js 実践入門",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop&auto=format",
    progress: 0,
    totalVideos: 28,
    completedVideos: 0,
  },
  {
    id: 4,
    title: "UI/UXデザイン実践",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop&auto=format",
    progress: 100,
    totalVideos: 15,
    completedVideos: 15,
  },
];

type VideoStatus = "completed" | "in-progress" | "available" | "locked";

interface CourseVideo {
  id: number;
  chapterId: number;
  order: number;
  title: string;
  duration: string;
  status: VideoStatus;
  progress?: number;
  videoUrl: string;
}

interface CurriculumChapter {
  id: number;
  order: number;
  title: string;
  videos: CourseVideo[];
}

const SAMPLE_VIDEO_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const INITIAL_CURRICULUM: CurriculumChapter[] = [
  {
    id: 1,
    order: 1,
    title: "第1章：HTMLの基礎",
    videos: [
      { id: 1, chapterId: 1, order: 1, title: "HTMLとは何か", duration: "8:23", status: "completed", videoUrl: SAMPLE_VIDEO_URL },
      { id: 2, chapterId: 1, order: 2, title: "基本的なタグの使い方", duration: "12:45", status: "completed", videoUrl: SAMPLE_VIDEO_URL },
      { id: 3, chapterId: 1, order: 3, title: "フォームの作成", duration: "15:10", status: "in-progress", progress: 45, videoUrl: SAMPLE_VIDEO_URL },
    ],
  },
  {
    id: 2,
    order: 2,
    title: "第2章：CSSスタイリング",
    videos: [
      { id: 4, chapterId: 2, order: 1, title: "CSSセレクタの基礎", duration: "10:30", status: "available", videoUrl: SAMPLE_VIDEO_URL },
      { id: 5, chapterId: 2, order: 2, title: "Flexboxレイアウト", duration: "18:22", status: "locked", videoUrl: SAMPLE_VIDEO_URL },
      { id: 6, chapterId: 2, order: 3, title: "Gridレイアウト", duration: "20:15", status: "locked", videoUrl: SAMPLE_VIDEO_URL },
    ],
  },
  {
    id: 3,
    order: 3,
    title: "第3章：レスポンシブデザイン",
    videos: [
      { id: 7, chapterId: 3, order: 1, title: "メディアクエリの使い方", duration: "13:40", status: "locked", videoUrl: SAMPLE_VIDEO_URL },
      { id: 8, chapterId: 3, order: 2, title: "モバイルファースト設計", duration: "16:55", status: "locked", videoUrl: SAMPLE_VIDEO_URL },
    ],
  },
];

const INITIAL_USERS = [
  { id: 1, name: "田中 花子", email: "tanaka@example.com", status: "active" as const, courses: [1, 2] },
  { id: 2, name: "佐藤 太郎", email: "sato@example.com", status: "active" as const, courses: [1, 3] },
  { id: 3, name: "鈴木 一郎", email: "suzuki@example.com", status: "inactive" as const, courses: [2] },
  { id: 4, name: "高橋 美穂", email: "takahashi@example.com", status: "active" as const, courses: [1, 2, 3, 4] },
  { id: 5, name: "伊藤 健太", email: "ito@example.com", status: "active" as const, courses: [3, 4] },
];
type User = typeof INITIAL_USERS[number];

// Per-user per-course progress mock data
const USER_PROGRESS: Record<number, Record<number, { progress: number; completed: number; total: number; lastWatched: string }>> = {
  1: {
    1: { progress: 65, completed: 13, total: 20, lastWatched: "フォームの作成" },
    2: { progress: 30, completed: 10, total: 35, lastWatched: "CSSセレクタの基礎" },
  },
  2: {
    1: { progress: 42, completed: 8, total: 20, lastWatched: "基本的なタグの使い方" },
    3: { progress: 11, completed: 3, total: 28, lastWatched: "React基礎 第1回" },
  },
  3: {
    2: { progress: 80, completed: 28, total: 35, lastWatched: "Gridレイアウト" },
  },
  4: {
    1: { progress: 100, completed: 20, total: 20, lastWatched: "完了" },
    2: { progress: 57, completed: 20, total: 35, lastWatched: "Flexboxレイアウト" },
    3: { progress: 25, completed: 7, total: 28, lastWatched: "コンポーネント設計入門" },
    4: { progress: 100, completed: 15, total: 15, lastWatched: "完了" },
  },
  5: {
    3: { progress: 64, completed: 18, total: 28, lastWatched: "状態管理パターン" },
    4: { progress: 47, completed: 7, total: 15, lastWatched: "ワイヤーフレーム作成" },
  },
};

function VideoStatusBadge({ status, progress }: { status: VideoStatus; progress?: number }) {
  if (status === "completed") {
    return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
  }
  if (status === "in-progress") {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-blue-600 font-semibold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {progress}%
        </span>
      </div>
    );
  }
  if (status === "available") {
    return <Play className="w-5 h-5 text-blue-500 shrink-0" />;
  }
  return <Lock className="w-4 h-4 text-slate-300 shrink-0" />;
}

function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const boxSize = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const textSize = size === "sm" ? "text-base" : "text-xl";
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${boxSize} bg-blue-600 rounded-xl flex items-center justify-center shadow-sm`}>
        <BookOpen className="w-4 h-4 text-white" />
      </div>
      <span className={`font-extrabold text-slate-800 tracking-tight ${textSize}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        LearnFlow
      </span>
    </div>
  );
}

function ProgressBar({ value, color = "blue", height = "h-2" }: { value: number; color?: "blue" | "emerald" | "amber"; height?: string }) {
  const colors = { blue: "bg-blue-500", emerald: "bg-emerald-500", amber: "bg-amber-400" };
  return (
    <div className={`w-full ${height} bg-slate-100 rounded-full overflow-hidden`}>
      <div
        className={`h-full rounded-full transition-all ${colors[color]}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function cloneCurriculum(curriculum: CurriculumChapter[]) {
  return curriculum.map((chapter) => ({
    ...chapter,
    videos: [...chapter.videos].sort((left, right) => left.order - right.order).map((video) => ({ ...video })),
  }));
}

function isChapterUnlocked(chapterIndex: number, curriculum: CurriculumChapter[]) {
  if (chapterIndex === 0) return true;
  return curriculum.slice(0, chapterIndex).every((chapter) => chapter.videos.every((video) => video.status === "completed"));
}

function getVisibleVideoStatus(video: CourseVideo, videoIndex: number, chapterUnlocked: boolean): VideoStatus {
  if (!chapterUnlocked) return "locked";
  if (video.status !== "locked") return video.status;
  return videoIndex === 0 ? "available" : "locked";
}

function chapterCompletionPercentage(chapter: CurriculumChapter) {
  if (chapter.videos.length === 0) return 0;
  const completed = chapter.videos.filter((video) => video.status === "completed").length;
  return Math.round((completed / chapter.videos.length) * 100);
}

function AdminLayout({
  children,
  sidebarOpen,
  setSidebarOpen,
  adminTab,
  setAdminTab,
  setView,
}: {
  children: React.ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  adminTab: "users" | "courses" | "progress";
  setAdminTab: (tab: "users" | "courses" | "progress") => void;
  setView: (view: any) => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-30 w-60 bg-white border-r border-slate-100 flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-5 border-b border-slate-100">
          <Logo size="sm" />
          <p className="text-xs text-slate-400 mt-1 ml-9">管理者パネル</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { tab: "users" as const, icon: Users, label: "ユーザー管理" },
            { tab: "courses" as const, icon: BookOpen, label: "コース・動画管理" },
            { tab: "progress" as const, icon: BarChart2, label: "進捗確認" },
          ].map(({ tab, icon: Icon, label }) => (
            <button
              key={tab}
              onClick={() => { setAdminTab(tab); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                adminTab === tab
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => setView("login")}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-600 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-100 h-14 flex items-center px-4 gap-3 shrink-0 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-slate-600 p-1 -ml-1">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-slate-800 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {adminTab === "users" ? "ユーザー管理" : adminTab === "courses" ? "コース・動画管理" : "進捗確認"}
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:block">管理者</span>
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-slate-600">管</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("login");
  const [coursesList, setCoursesList] = useState(COURSES);
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0]);

  useEffect(() => {
    fetch("http://localhost:3001/api/courses")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch courses");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCoursesList(data);
        }
      })
      .catch((err) => {
        console.warn("Backend API is offline, using mock courses data:", err);
      });
  }, []);
  const [curriculum, setCurriculum] = useState<CurriculumChapter[]>(() => cloneCurriculum(INITIAL_CURRICULUM));
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo>(() => cloneCurriculum(INITIAL_CURRICULUM)[0].videos[2]);
  const [openChapters, setOpenChapters] = useState<number[]>([1]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [usersList, setUsersList] = useState(INITIAL_USERS);
  const [editCourses, setEditCourses] = useState<number[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadOrder, setUploadOrder] = useState(1);
  const [uploadChapterId, setUploadChapterId] = useState(1);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [selectedProgressUser, setSelectedProgressUser] = useState<User>(INITIAL_USERS[0]);
  const [progressExpandedCourse, setProgressExpandedCourse] = useState<number | null>(null);
  const [userFormName, setUserFormName] = useState("");
  const [userFormEmail, setUserFormEmail] = useState("");
  const [userFormPassword, setUserFormPassword] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/api/users")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setUsersList(data);
        }
      })
      .catch((err) => {
        console.warn("Backend API is offline, using mock users data:", err);
      });
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    fetch("http://localhost:3001/api/courses/" + selectedCourse.id + "/curriculum")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch curriculum");
        return res.json();
      })
      .then((data) => {
        if (data && data.chapters) {
          setCurriculum(data.chapters);
        }
      })
      .catch((err) => {
        console.warn("Backend API is offline, using mock curriculum data:", err);
      });
  }, [selectedCourse?.id]);

  const activeChapterIndex = curriculum.findIndex((chapter) => chapter.id === selectedVideo.chapterId);
  const activeChapter = activeChapterIndex >= 0 ? curriculum[activeChapterIndex] : null;
  const activeChapterVideos = activeChapter?.videos ?? [];
  const activeVideoIndex = activeChapterVideos.findIndex((video) => video.id === selectedVideo.id);
  const chapterUnlocked = activeChapterIndex >= 0 ? isChapterUnlocked(activeChapterIndex, curriculum) : false;
  const videoProgress = videoDuration > 0 ? Math.round((currentTime / videoDuration) * 100) : (selectedVideo.status === "completed" ? 100 : selectedVideo.progress ?? 0);
  const canAdvance = videoProgress >= 90;

  useEffect(() => {
    setCurrentTime(0);
    setVideoDuration(0);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [selectedVideo.id]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  const toggleChapter = (id: number) =>
    setOpenChapters((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );

  const markVideoCompleted = (videoId: number) => {
    setCurriculum((prev) => {
      const next = cloneCurriculum(prev);
      for (const chapter of next) {
        const video = chapter.videos.find((item) => item.id === videoId);
        if (video) {
          video.status = "completed";
          video.progress = 100;
          return next;
        }
      }
      return prev;
    });
    setSelectedVideo((prev) => ({ ...prev, status: "completed", progress: 100 }));
  };

  const currentVideoState = activeChapterVideos[activeVideoIndex] ?? selectedVideo;

  const goToNextVideo = () => {
    if (!canAdvance || !activeChapter) return;

    const nextInChapter = activeChapterVideos[activeVideoIndex + 1];
    if (nextInChapter && chapterUnlocked) {
      setSelectedVideo(nextInChapter);
      setView("student-video");
      return;
    }

    const nextChapter = curriculum[activeChapterIndex + 1];
    if (!nextChapter) return;

    const nextChapterUnlocked = isChapterUnlocked(activeChapterIndex + 1, curriculum);
    if (nextChapterUnlocked && nextChapter.videos[0]) {
      setSelectedVideo(nextChapter.videos[0]);
      setOpenChapters((prev) => (prev.includes(nextChapter.id) ? prev : [...prev, nextChapter.id]));
      setView("student-video");
    }
  };

  const handleSaveUpload = async () => {
    if (!uploadedFile || !uploadTitle.trim() || isUploading) return;

    const targetChapterId = uploadSelectedChapterId || uploadChapterId;
    setIsUploading(true);

    try {
      let publicUrl = "";

      try {
        // 1. Get presigned upload URL from backend
        const res = await fetch("http://localhost:3001/api/uploads/presign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: uploadedFile.name,
            contentType: uploadedFile.type || "video/mp4",
          }),
        });

        if (!res.ok) {
          throw new Error("アップロード用の署名付きURLの取得に失敗しました。");
        }

        const data = await res.json();
        const { uploadUrl, objectKey } = data;

        // 2. Upload file directly to Supabase Storage using the signed URL
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: uploadedFile,
          headers: {
            "Content-Type": uploadedFile.type || "video/mp4",
          },
        });

        if (!uploadRes.ok) {
          throw new Error("Supabase Storageへのファイルアップロードに失敗しました。");
        }

        publicUrl = `https://dprgzaqyeohytuoiywlr.supabase.co/storage/v1/object/public/uploads/${objectKey}`;

        // 3. Register the uploaded video in the database
        try {
          const videoRes = await fetch("http://localhost:3001/api/courses/videos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chapterId: targetChapterId,
              order: uploadOrder,
              title: uploadTitle.trim(),
              duration: "00:00",
              assetKey: publicUrl,
            }),
          });
          if (!videoRes.ok) throw new Error("DBへの動画登録に失敗しました。");
        } catch (dbErr) {
          console.warn("Backend API database registration failed, but file was uploaded:", dbErr);
        }

      } catch (err) {
        console.warn("Backend API is offline, using mock simulated upload:", err);
        // Simulate a delay for simulated mock upload
        await new Promise((resolve) => setTimeout(resolve, 1500));
        publicUrl = SAMPLE_VIDEO_URL;
      }

      // 4. Update local state curriculum
      setCurriculum((prev) => {
        const next = cloneCurriculum(prev);
        const chapterIndex = next.findIndex((chapter) => chapter.id === targetChapterId);
        if (chapterIndex < 0) return prev;

        const chapter = next[chapterIndex];
        const insertOrder = Math.min(Math.max(1, uploadOrder), chapter.videos.length + 1);
        const nextVideoId = Math.max(0, ...next.flatMap((chapterItem) => chapterItem.videos.map((video) => video.id))) + 1;
        const newVideo: CourseVideo = {
          id: nextVideoId,
          chapterId: chapter.id,
          order: insertOrder,
          title: uploadTitle.trim(),
          duration: "00:00",
          status: "available",
          videoUrl: publicUrl,
        };

        chapter.videos.splice(insertOrder - 1, 0, newVideo);
        chapter.videos.forEach((video, index) => {
          video.order = index + 1;
        });

        return next;
      });

      setUploadedFile(null);
      setUploadTitle("");
      setUploadOrder(1);
      setShowUploadVideoModal(false);
      alert("動画が正常にアップロードされ、カリキュラムに追加されました！");
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(err.message || "アップロード中にエラーが発生しました。");
    } finally {
      setIsUploading(false);
    }
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditCourses([...user.courses]);
    setUserFormName(user.name);
    setUserFormEmail(user.email);
    setUserFormPassword("");
    setShowCreateUser(false);
  };

  const openCreate = () => {
    setEditingUser(null);
    setEditCourses([]);
    setUserFormName("");
    setUserFormEmail("");
    setUserFormPassword("");
    setShowCreateUser(true);
  };

  const closeModal = () => {
    setEditingUser(null);
    setShowCreateUser(false);
    setUserFormName("");
    setUserFormEmail("");
    setUserFormPassword("");
  };

  const saveUser = async () => {
    if (!userFormName.trim() || !userFormEmail.trim()) {
      alert("名前とメールアドレスを入力してください。");
      return;
    }

    try {
      if (showCreateUser) {
        const res = await fetch("http://localhost:3001/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: userFormName.trim(),
            email: userFormEmail.trim(),
            status: "active",
            role: "student",
            courses: editCourses,
          }),
        });
        if (!res.ok) throw new Error("ユーザーの新規作成に失敗しました。");
        const newUser = await res.json();
        setUsersList((prev) => [...prev, newUser]);
      } else if (editingUser) {
        const res = await fetch(`http://localhost:3001/api/users/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: userFormName.trim(),
            email: userFormEmail.trim(),
            status: editingUser.status,
            courses: editCourses,
          }),
        });
        if (!res.ok) throw new Error("ユーザー情報の更新に失敗しました。");
        const updatedUser = await res.json();
        setUsersList((prev) =>
          prev.map((u) => (u.id === editingUser.id ? updatedUser : u))
        );
      }
    } catch (err) {
      console.warn("Backend API is offline, using mock fallback:", err);
      if (showCreateUser) {
        const newId = Math.max(0, ...usersList.map((u) => u.id)) + 1;
        const newUser: User = {
          id: newId,
          name: userFormName.trim(),
          email: userFormEmail.trim(),
          role: "student",
          status: "active",
          courses: editCourses,
        };
        setUsersList((prev) => [...prev, newUser]);
      } else if (editingUser) {
        setUsersList((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? {
                  ...editingUser,
                  name: userFormName.trim(),
                  email: userFormEmail.trim(),
                  courses: editCourses,
                }
              : u
          )
        );
      }
    }
    closeModal();
  };

  const handleDeleteUser = async () => {
    if (!editingUser) return;
    if (!window.confirm(`${editingUser.name}のアカウントを削除してもよろしいですか？`)) return;

    try {
      const res = await fetch(`http://localhost:3001/api/users/${editingUser.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("ユーザーの削除に失敗しました。");
    } catch (err) {
      console.warn("Backend API is offline, using mock fallback for delete:", err);
    }

    setUsersList((prev) => prev.filter((u) => u.id !== editingUser.id));
    closeModal();
  };

  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [courseFormTitle, setCourseFormTitle] = useState("");
  const [courseFormThumbnailUrl, setCourseFormThumbnailUrl] = useState("");
  const [courseFormThumbnailFile, setCourseFormThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState("");
  const [thumbnailDragOver, setThumbnailDragOver] = useState(false);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  
  const [adminViewCourseDetail, setAdminViewCourseDetail] = useState(false);
  const [uploadSelectedChapterId, setUploadSelectedChapterId] = useState<number | null>(null);
  const [showUploadVideoModal, setShowUploadVideoModal] = useState(false);

  const openEditCourse = (course: any) => {
    setEditingCourse(course);
    setCourseFormTitle(course.title);
    setCourseFormThumbnailUrl(course.thumbnail || "");
    setCourseFormThumbnailFile(null);
    setThumbnailPreviewUrl(course.thumbnail || "");
  };

  const closeEditCourseModal = () => {
    setEditingCourse(null);
    setCourseFormTitle("");
    setCourseFormThumbnailUrl("");
    setCourseFormThumbnailFile(null);
    setThumbnailPreviewUrl("");
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setCourseFormThumbnailFile(file);
      setThumbnailPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleThumbnailDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setThumbnailDragOver(false);
    const file = e.dataTransfer.files[0] ?? null;
    if (file) {
      setCourseFormThumbnailFile(file);
      setThumbnailPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearThumbnailSelection = () => {
    setCourseFormThumbnailFile(null);
    setCourseFormThumbnailUrl("");
    setThumbnailPreviewUrl("");
  };

  const saveCourseEdit = async () => {
    if (!editingCourse || !courseFormTitle.trim()) return;

    setIsThumbnailUploading(true);

    try {
      let finalThumbnailUrl = courseFormThumbnailUrl;

      if (courseFormThumbnailFile) {
        try {
          const res = await fetch("http://localhost:3001/api/uploads/presign", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileName: courseFormThumbnailFile.name,
              contentType: courseFormThumbnailFile.type || "image/png",
            }),
          });

          if (!res.ok) {
            throw new Error("アップロードURLの取得に失敗しました。");
          }

          const data = await res.json();
          const { uploadUrl, objectKey } = data;

          const uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            body: courseFormThumbnailFile,
            headers: {
              "Content-Type": courseFormThumbnailFile.type || "image/png",
            },
          });

          if (!uploadRes.ok) {
            throw new Error("Supabase Storageへのアップロードに失敗しました。");
          }

          finalThumbnailUrl = `https://dprgzaqyeohytuoiywlr.supabase.co/storage/v1/object/public/uploads/${objectKey}`;
        } catch (uploadErr) {
          console.warn("Backend API upload failed, falling back to local object URL:", uploadErr);
          finalThumbnailUrl = thumbnailPreviewUrl || "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=400&h=225&fit=crop&auto=format";
        }
      }

      try {
        const patchRes = await fetch(`http://localhost:3001/api/courses/${editingCourse.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: courseFormTitle.trim(),
            thumbnailUrl: finalThumbnailUrl,
          }),
        });

        if (!patchRes.ok) {
          throw new Error("DBのコース情報の更新に失敗しました。");
        }
      } catch (patchErr) {
        console.warn("Backend API is offline, using local state fallback for course edit:", patchErr);
      }

      setCoursesList((prev) =>
        prev.map((c) =>
          c.id === editingCourse.id
            ? { ...c, title: courseFormTitle.trim(), thumbnail: finalThumbnailUrl }
            : c
        )
      );

      closeEditCourseModal();
      alert("コース情報を正常に保存しました！");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "エラーが発生しました。");
    } finally {
      setIsThumbnailUploading(false);
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (!window.confirm("この動画を削除してもよろしいですか？")) return;

    try {
      const res = await fetch(`http://localhost:3001/api/courses/videos/${videoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("動画の削除に失敗しました。");
      }

      setCurriculum((prev) =>
        prev.map((chapter) => ({
          ...chapter,
          videos: chapter.videos.filter((v) => v.id !== videoId),
        }))
      );
      alert("動画を削除しました。");
    } catch (err: any) {
      console.warn("Backend API is offline, using mock fallback for delete video:", err);
      setCurriculum((prev) =>
        prev.map((chapter) => ({
          ...chapter,
          videos: chapter.videos.filter((v) => v.id !== videoId),
        }))
      );
    }
  };

  const toggleEditCourse = (id: number) =>
    setEditCourses((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  const toggleUserStatus = () => {
    if (!editingUser) return;
    setEditingUser({ ...editingUser, status: editingUser.status === "active" ? "inactive" : "active" });
  };

  const handleLogin = () => {
    if (loginEmail.toLowerCase().includes("admin")) {
      setView("admin-users");
    } else {
      setView("student-courses");
    }
  };

  // ─── LOGIN ───────────────────────────────────────────────────────────────────
  if (view === "login") {
    return (
      <div
        className="min-h-screen bg-white flex items-center justify-center p-4"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <Logo />
            </div>
            <p className="text-slate-400 text-sm">オンライン学習プラットフォーム</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h1 className="text-lg font-bold text-slate-800 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              ログイン
            </h1>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">メールアドレス</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="example@email.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">パスワード</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2.5 rounded-xl transition-colors text-sm mt-1"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                ログイン
              </button>
            </div>
            <p className="text-xs text-slate-300 text-center mt-5 leading-relaxed">
              ※ アカウントは管理者より配布されます
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={() => { setLoginEmail("student@example.com"); setLoginPassword("demo1234"); }}
              className="text-xs text-blue-500 hover:text-blue-700 hover:underline transition-colors"
            >
              生徒デモ
            </button>
            <span className="text-slate-200 text-xs">|</span>
            <button
              onClick={() => { setLoginEmail("admin@example.com"); setLoginPassword("demo1234"); }}
              className="text-xs text-blue-500 hover:text-blue-700 hover:underline transition-colors"
            >
              管理者デモ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STUDENT HEADER ───────────────────────────────────────────────────────────
  const StudentHeader = ({ back }: { back?: () => void }) => (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-10" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {back && (
            <button onClick={back} className="text-slate-400 hover:text-slate-700 transition-colors -ml-1 p-1">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <Logo size="sm" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 hidden sm:block font-medium">田中 花子</span>
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-blue-700">田</span>
          </div>
          <button
            onClick={() => setView("login")}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">ログアウト</span>
          </button>
        </div>
      </div>
    </header>
  );

  // ─── STUDENT: COURSES ─────────────────────────────────────────────────────────
  if (view === "student-courses") {
    return (
      <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>
        <StudentHeader />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              マイコース
            </h1>
            <p className="text-slate-400 text-sm mt-1">受講が許可されているコース一覧</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {coursesList.map((course) => (
              <button
                key={course.id}
                onClick={() => { setSelectedCourse(course); setView("student-curriculum"); }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="aspect-video relative overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {course.progress === 100 && (
                    <div className="absolute inset-0 bg-emerald-500/25 flex items-center justify-center">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                  {course.progress > 0 && course.progress < 100 && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {course.progress}%
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 text-sm leading-snug mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {course.title}
                  </h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">{course.completedVideos} / {course.totalVideos} 動画</span>
                      <span
                        className={`text-xs font-bold tabular-nums ${course.progress === 100 ? "text-emerald-600" : "text-blue-600"}`}
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {course.progress}%
                      </span>
                    </div>
                    <ProgressBar value={course.progress} color={course.progress === 100 ? "emerald" : "blue"} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ─── STUDENT: CURRICULUM ─────────────────────────────────────────────────────
  if (view === "student-curriculum") {
    return (
      <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>
        <StudentHeader back={() => setView("student-courses")} />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm">
                <img src={selectedCourse.thumbnail} alt={selectedCourse.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-800 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {selectedCourse.title}
                </h1>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                  基礎から実践まで体系的に学べるコンプリートコース。HTML・CSS・レスポンシブデザインを網羅しています。
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium">全体の学習進捗</span>
                  <span className="font-bold text-blue-600 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {selectedCourse.progress}%
                  </span>
                </div>
                <ProgressBar value={selectedCourse.progress} />
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-slate-400">{selectedCourse.completedVideos}/{selectedCourse.totalVideos}</p>
                <p className="text-xs text-slate-400">動画完了</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {curriculum
              .slice()
              .sort((left, right) => left.order - right.order)
              .map((chapter, chapterIndex) => {
                const unlocked = isChapterUnlocked(chapterIndex, curriculum);
                const isOpen = openChapters.includes(chapter.id);

                return (
                  <div key={chapter.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <button
                      onClick={() => unlocked && toggleChapter(chapter.id)}
                      disabled={!unlocked}
                      className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${
                        unlocked ? "hover:bg-slate-50/70" : "bg-slate-50/40 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${unlocked ? "bg-blue-50" : "bg-slate-100"}`}>
                          <span className={`text-xs font-bold ${unlocked ? "text-blue-600" : "text-slate-400"}`}>{chapter.order}</span>
                        </div>
                        <span className="font-bold text-slate-800 text-sm truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {chapter.title}
                        </span>
                        <span className="text-xs text-slate-400 font-medium shrink-0">{chapter.videos.length}本</span>
                        {!unlocked && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                            <Lock className="w-3 h-3" />
                            ロック中
                          </span>
                        )}
                      </div>
                      {unlocked
                        ? isOpen
                          ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        : <Lock className="w-4 h-4 text-slate-300 shrink-0" />}
                    </button>
                    {unlocked && isOpen && (
                      <div className="border-t border-slate-50">
                        {chapter.videos
                          .slice()
                          .sort((left, right) => left.order - right.order)
                          .map((video, idx) => {
                            const visibleStatus = getVisibleVideoStatus(video, idx, unlocked);
                            const isLocked = visibleStatus === "locked";

                            return (
                              <button
                                key={video.id}
                                disabled={isLocked}
                                onClick={() => {
                                  if (isLocked) return;
                                  setSelectedVideo(video);
                                  setView("student-video");
                                }}
                                className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors ${
                                  isLocked
                                    ? "opacity-50 cursor-not-allowed bg-slate-50/50"
                                    : "hover:bg-blue-50/50 cursor-pointer"
                                } ${idx < chapter.videos.length - 1 ? "border-b border-slate-50" : ""}`}
                              >
                                <VideoStatusBadge status={visibleStatus} progress={video.progress} />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm truncate ${isLocked ? "text-slate-400" : "text-slate-700 font-medium"}`}>
                                    {video.order}. {video.title}
                                  </p>
                                </div>
                                <span className="text-xs text-slate-400 shrink-0 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                  {video.duration}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    )}
                    {unlocked && !isOpen && (
                      <div className="border-t border-slate-50 px-5 py-3 text-xs text-slate-400">
                        開いて動画を選択できます
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </main>
      </div>
    );
  }

  // ─── STUDENT: VIDEO PLAYER (light theme) ─────────────────────────────────────
  if (view === "student-video") {
    const chapterVideos = activeChapterVideos;
    const displayedProgress = Math.max(0, Math.min(100, videoProgress));

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Light header */}
        <header className="bg-white border-b border-slate-100 shrink-0 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView("student-curriculum")}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 -ml-1"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <Logo size="sm" />
            </div>
            <p className="text-slate-600 text-sm font-medium hidden md:block truncate max-w-xs">
              {selectedVideo.title}
            </p>
            <button onClick={() => setView("login")} className="text-slate-400 hover:text-slate-600 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
          {/* Player + Info column */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="relative bg-black aspect-video lg:aspect-auto lg:flex-1 lg:min-h-0 select-none">
              <video
                key={selectedVideo.id}
                ref={videoRef}
                src={currentVideoState.videoUrl}
                className="absolute inset-0 h-full w-full object-cover"
                playsInline
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
                onLoadedMetadata={() => {
                  setVideoDuration(videoRef.current?.duration ?? 0);
                  setVolume(videoRef.current?.volume ?? 0.8);
                }}
                onEnded={() => {
                  markVideoCompleted(selectedVideo.id);
                  setIsPlaying(false);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
              <button
                onClick={() => {
                  const video = videoRef.current;
                  if (!video) return;
                  if (video.paused) void video.play();
                  else video.pause();
                }}
                className="absolute inset-0 flex items-center justify-center cursor-pointer group"
              >
                <div className="w-16 h-16 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
                  {isPlaying ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white ml-1" />}
                </div>
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pt-8 pb-3 px-4">
                <div
                  className="mb-2.5 cursor-pointer group"
                  onClick={(event) => {
                    const video = videoRef.current;
                    if (!video || !videoDuration) return;
                    const rect = event.currentTarget.getBoundingClientRect();
                    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
                    video.currentTime = ratio * videoDuration;
                  }}
                >
                  <div className="w-full h-1 group-hover:h-1.5 bg-white/20 rounded-full overflow-hidden transition-all">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${displayedProgress}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      const video = videoRef.current;
                      if (!video) return;
                      if (video.paused) void video.play();
                      else video.pause();
                    }}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <div className="flex items-center gap-2 w-32">
                    <Volume2 className="w-4 h-4 text-white/60 shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(event) => setVolume(Number(event.target.value))}
                      className="w-full accent-white"
                    />
                  </div>
                  <div className="flex-1" />
                  <span className="text-white/60 text-xs tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, "0")} / {Math.floor((videoDuration || 0) / 60)}:{String(Math.floor((videoDuration || 0) % 60)).padStart(2, "0")}
                  </span>
                  <button
                    onClick={async () => {
                      const video = videoRef.current;
                      if (!video) return;
                      if (document.fullscreenElement) await document.exitFullscreen();
                      else await video.requestFullscreen();
                    }}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Progress bar — light */}
            <div className="bg-white border-b border-slate-100 px-4 sm:px-5 py-3.5 shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-500 text-xs font-semibold">視聴進捗</span>
                <span className="text-blue-600 text-xs font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {displayedProgress}%
                </span>
              </div>
              <ProgressBar value={displayedProgress} height="h-2" />
              <p className="text-slate-400 text-xs mt-1.5">
                {canAdvance
                  ? "視聴完了 — 次の動画に進めます"
                  : `残り約${Math.ceil((Math.max(videoDuration, 1) * (1 - displayedProgress / 100)) / 60)}分で次の動画へ進めます`}
              </p>
            </div>

            {/* Video title — light */}
            <div className="bg-white px-4 sm:px-5 py-4 shrink-0 border-b border-slate-100">
              <h2 className="text-slate-800 font-bold text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {currentVideoState.title}
              </h2>
              <p className="text-slate-400 text-sm mt-0.5">{selectedCourse.title} · 第{activeChapter?.order ?? 1}章</p>
            </div>

            {/* Mobile playlist — light */}
            <div className="lg:hidden bg-white border-t border-slate-100">
              <div className="p-4">
                <button
                  disabled={!canAdvance}
                  onClick={goToNextVideo}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors ${
                    canAdvance
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  <SkipForward className="w-4 h-4" />
                  {canAdvance ? "次の動画へ進む" : `次の動画へ（${displayedProgress}%まで視聴）`}
                </button>
              </div>
              <div className="border-t border-slate-100 pb-2">
                <p className="px-4 pt-3 pb-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">この章の動画</p>
                {chapterVideos.map((v, index) => {
                  const visibleStatus = getVisibleVideoStatus(v, index, chapterUnlocked);
                  const isLocked = visibleStatus === "locked";

                  return (
                    <button
                      key={v.id}
                      disabled={isLocked}
                      onClick={() => {
                        if (isLocked) return;
                        setSelectedVideo(v);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left border-l-2 transition-colors ${
                        v.id === selectedVideo.id
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-transparent hover:bg-slate-50"
                      } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <VideoStatusBadge status={visibleStatus} progress={v.progress} />
                      <span className={`text-sm flex-1 truncate ${v.id === selectedVideo.id ? "text-blue-700 font-semibold" : "text-slate-600"}`}>
                        {v.order}. {v.title}
                      </span>
                      <span className="text-slate-400 text-xs tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {v.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Desktop sidebar — light */}
          <aside className="hidden lg:flex flex-col w-72 xl:w-80 bg-white border-l border-slate-100 shrink-0">
            <div className="p-4 border-b border-slate-100">
              <button
                disabled={!canAdvance}
                onClick={goToNextVideo}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors ${
                  canAdvance
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <SkipForward className="w-4 h-4" />
                次の動画へ進む
              </button>
              {!canAdvance && (
                <p className="text-slate-400 text-xs text-center mt-2 leading-relaxed">
                  90%以上視聴すると次へ進めます<br />
                  <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>（現在 {displayedProgress}%）</span>
                </p>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              <p className="px-4 pt-4 pb-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">この章の動画</p>
              {chapterVideos.map((v, index) => {
                const visibleStatus = getVisibleVideoStatus(v, index, chapterUnlocked);
                const isLocked = visibleStatus === "locked";

                return (
                  <button
                    key={v.id}
                    disabled={isLocked}
                    onClick={() => {
                      if (isLocked) return;
                      setSelectedVideo(v);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-l-2 transition-colors ${
                      v.id === selectedVideo.id
                        ? "border-blue-500 bg-blue-50/60"
                        : "border-transparent hover:bg-slate-50"
                    } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <VideoStatusBadge status={visibleStatus} progress={v.progress} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${v.id === selectedVideo.id ? "text-blue-700 font-semibold" : "text-slate-600"}`}>
                        {v.order}. {v.title}
                      </p>
                      <p className="text-xs text-slate-400 tabular-nums mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {v.duration}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // ─── ADMIN LAYOUT ─────────────────────────────────────────────────────────────
  const adminTab = view === "admin-progress" ? "progress" : view === "admin-courses" ? "courses" : "users";
  const setAdminTab = (tab: "users" | "courses" | "progress") => {
    if (tab === "users") setView("admin-users");
    else if (tab === "courses") {
      setAdminViewCourseDetail(false); // Reset detail sub-view when clicking sidebar tab
      setView("admin-courses");
    } else setView("admin-progress");
  };

  // ─── ADMIN: USER MANAGEMENT ───────────────────────────────────────────────────
  if (view === "admin-users") {
    return (
      <AdminLayout
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        setView={setView}
      >
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-lg font-extrabold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                ユーザー一覧
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">{usersList.length} 名のアカウント</p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              + アカウント新規作成
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["名前", "メールアドレス", "ステータス", "受講コース数", ""].map((h, i) => (
                      <th
                        key={i}
                        className={`text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider ${
                          i === 1 ? "hidden sm:table-cell" : i === 3 ? "hidden md:table-cell" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((user, idx) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/70 transition-colors ${idx < usersList.length - 1 ? "border-b border-slate-50" : ""}`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-blue-700">{user.name[0]}</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-sm text-slate-500">{user.email}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          user.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {user.status === "active" ? "有効" : "無効"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-sm text-slate-500 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {user.courses.length} コース
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => openEdit(user)}
                          className="text-slate-300 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {(editingUser || showCreateUser) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {showCreateUser ? "アカウント新規作成" : "ユーザー編集"}
                </h3>
                <button onClick={closeModal} className="text-slate-300 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">名前</label>
                  <input
                    type="text"
                    value={userFormName}
                    onChange={(e) => setUserFormName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">メールアドレス</label>
                  <input
                    type="email"
                    value={userFormEmail}
                    onChange={(e) => setUserFormEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
                {showCreateUser && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">初期パスワード</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={userFormPassword}
                      onChange={(e) => setUserFormPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2.5">受講コース</label>
                  <div className="space-y-2.5">
                    {coursesList.map((course) => (
                      <label key={course.id} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={editCourses.includes(course.id)}
                          onChange={() => toggleEditCourse(course.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{course.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {!showCreateUser && editingUser && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2.5">アカウント状態</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={toggleUserStatus}
                        className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                          editingUser.status === "active" ? "bg-emerald-500" : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                            editingUser.status === "active" ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className={`text-sm font-semibold ${editingUser.status === "active" ? "text-emerald-600" : "text-slate-400"}`}>
                        {editingUser.status === "active" ? "有効" : "無効"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex gap-3 items-center justify-between">
                <div>
                  {!showCreateUser && editingUser && (
                    <button
                      onClick={handleDeleteUser}
                      className="px-4 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      アカウントを削除
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={closeModal} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                    キャンセル
                  </button>
                  <button
                    onClick={saveUser}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {showCreateUser ? "アカウントを作成" : "変更を保存"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </AdminLayout>
    );
  }

  // ─── ADMIN: COURSE MANAGEMENT ──────────────────────────────────────────────────
  if (view === "admin-courses") {
    return (
      <AdminLayout
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        setView={setView}
      >
        <div className="p-4 sm:p-6">
          {!adminViewCourseDetail ? (
            <>
              <div className="mb-6">
                <h1 className="text-lg font-extrabold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  コース・動画管理
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">コース情報の編集や、受講動画の追加・削除を行います</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {coursesList.map((course) => (
                  <div key={course.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="aspect-video relative overflow-hidden bg-slate-100">
                      <img
                        src={course.thumbnail || "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=400&h=225&fit=crop&auto=format"}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm mb-2">{course.title}</h3>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between gap-2">
                        <button
                          onClick={() => openEditCourse(course)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          情報編集
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourse(course);
                            setAdminViewCourseDetail(true);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                          受講動画一覧
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Course Detail / Curriculum management */}
              <div className="mb-6 flex items-center gap-4">
                <button
                  onClick={() => setAdminViewCourseDetail(false)}
                  className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-100 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg font-extrabold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {selectedCourse.title}
                  </h1>
                  <p className="text-slate-400 text-xs mt-0.5">チャプター別カリキュラムと動画の管理</p>
                </div>
              </div>

              <div className="space-y-6 max-w-4xl">
                {curriculum.map((chapter) => (
                  <div key={chapter.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {chapter.order}. {chapter.title}
                        </h3>
                        <p className="text-slate-400 text-xs mt-0.5">{chapter.videos.length} 本の動画</p>
                      </div>
                      <button
                        onClick={() => {
                          setUploadSelectedChapterId(chapter.id);
                          setUploadOrder(chapter.videos.length + 1);
                          setShowUploadVideoModal(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        動画を追加
                      </button>
                    </div>

                    {chapter.videos.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        この章にはまだ動画が登録されていません。右上の「動画を追加」からアップロードしてください。
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {chapter.videos.map((video) => (
                          <div key={video.id} className="py-3.5 flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center text-xs font-bold text-slate-400 tabular-nums">
                                {video.order}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-700">{video.title}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{video.duration || "0:00"}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="px-3 py-1.5 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
                            >
                              削除
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Edit Course Modal */}
        {editingCourse && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  コース編集
                </h3>
                <button onClick={closeEditCourseModal} className="text-slate-300 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">コース名</label>
                  <input
                    type="text"
                    value={courseFormTitle}
                    onChange={(e) => setCourseFormTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">サムネイル画像</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setThumbnailDragOver(true); }}
                    onDragLeave={() => setThumbnailDragOver(false)}
                    onDrop={handleThumbnailDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                      thumbnailDragOver ? "border-blue-400 bg-blue-50"
                      : courseFormThumbnailFile || courseFormThumbnailUrl ? "border-emerald-400 bg-emerald-50/50"
                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50/70"
                    }`}
                  >
                    {courseFormThumbnailFile || courseFormThumbnailUrl ? (
                      <div>
                        {thumbnailPreviewUrl && (
                          <img src={thumbnailPreviewUrl} alt="Preview" className="w-full max-h-32 object-cover rounded-xl mb-3 border border-slate-100" />
                        )}
                        <p className="text-xs text-slate-500 truncate">{courseFormThumbnailFile ? courseFormThumbnailFile.name : "既存のサムネイル"}</p>
                        <button
                          onClick={clearThumbnailSelection}
                          className="text-xs text-red-400 hover:text-red-600 mt-2 transition-colors underline underline-offset-2"
                        >
                          削除して選び直す
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-700 font-bold text-xs">サムネイルをドラッグ＆ドロップ</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">または</p>
                        <label className="mt-1.5 inline-block cursor-pointer">
                          <span className="text-xs text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 transition-colors">
                            ファイルを選択する
                          </span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailFileChange} />
                        </label>
                        <p className="text-slate-300 text-[10px] mt-2">PNG, JPG形式</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
                <button onClick={closeEditCourseModal} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                  キャンセル
                </button>
                <button
                  disabled={isThumbnailUploading}
                  onClick={saveCourseEdit}
                  className={`px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors ${
                    isThumbnailUploading ? "bg-slate-300 cursor-wait text-slate-500" : ""
                  }`}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {isThumbnailUploading ? "保存中..." : "変更を保存"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Video Modal */}
        {showUploadVideoModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  新規動画アップロード
                </h3>
                <button onClick={() => { setShowUploadVideoModal(false); setUploadedFile(null); }} className="text-slate-300 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); setUploadedFile(e.dataTransfer.files[0] ?? null); }}
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    dragOver ? "border-blue-400 bg-blue-50"
                    : uploadedFile ? "border-emerald-400 bg-emerald-50/50"
                    : "border-slate-200 hover:border-blue-300 hover:bg-slate-50/70"
                  }`}
                >
                  {uploadedFile ? (
                    <div>
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <p className="font-bold text-slate-800 text-sm truncate max-w-[300px] mx-auto">{uploadedFile.name}</p>
                      <p className="text-xs text-slate-400 mt-1">動画ファイルが選択されました</p>
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="text-xs text-red-400 hover:text-red-600 mt-2 transition-colors underline underline-offset-2"
                      >
                        削除して選び直す
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-700 font-bold text-xs">動画ファイルをドラッグ＆ドロップ</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">または</p>
                      <label className="mt-1.5 inline-block cursor-pointer">
                        <span className="text-xs text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 transition-colors">
                          ファイルを選択する
                        </span>
                        <input type="file" accept="video/mp4" className="hidden" onChange={(e) => setUploadedFile(e.target.files?.[0] ?? null)} />
                      </label>
                      <p className="text-slate-300 text-[10px] mt-2">MP4形式</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">動画タイトル</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="例：HTMLタグの基本"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">表示順</label>
                  <input
                    type="number"
                    min={1}
                    value={uploadOrder}
                    onChange={(e) => setUploadOrder(Number(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
                <button onClick={() => { setShowUploadVideoModal(false); setUploadedFile(null); }} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                  キャンセル
                </button>
                <button
                  disabled={!uploadedFile || !uploadTitle.trim() || isUploading}
                  onClick={handleSaveUpload}
                  className={`px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors ${
                    isUploading ? "bg-slate-300 text-slate-500 cursor-wait" : ""
                  }`}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {isUploading ? "アップロード中..." : "動画を保存"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    );
  }

  // ─── ADMIN: PROGRESS ─────────────────────────────────────────────────────────
  if (view === "admin-progress") {
    const userProgress = USER_PROGRESS[selectedProgressUser.id] ?? {};
    const enrolledCourses = coursesList.filter((c) => selectedProgressUser.courses.includes(c.id));
    const avgProgress = enrolledCourses.length
      ? Math.round(enrolledCourses.reduce((sum, c) => sum + (userProgress[c.id]?.progress ?? 0), 0) / enrolledCourses.length)
      : 0;
    const completedCount = enrolledCourses.filter((c) => (userProgress[c.id]?.progress ?? 0) === 100).length;

    return (
      <AdminLayout
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        setView={setView}
      >
        <div className="p-4 sm:p-6">
          <div className="mb-5">
            <h1 className="text-lg font-extrabold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              進捗確認
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">生徒ごとのコース学習進捗を確認できます</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-5">
            {/* User list */}
            <div className="lg:w-56 shrink-0">
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">生徒一覧</p>
                </div>
                {usersList.map((user) => {
                  const up = USER_PROGRESS[user.id] ?? {};
                  const enrolled = coursesList.filter((c) => user.courses.includes(c.id));
                  const avg = enrolled.length
                    ? Math.round(enrolled.reduce((s, c) => s + (up[c.id]?.progress ?? 0), 0) / enrolled.length)
                    : 0;
                  return (
                    <button
                      key={user.id}
                      onClick={() => { setSelectedProgressUser(user); setProgressExpandedCourse(null); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-l-2 transition-colors ${
                        selectedProgressUser.id === user.id
                          ? "border-blue-500 bg-blue-50/60"
                          : "border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-blue-700">{user.name[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate font-medium ${selectedProgressUser.id === user.id ? "text-blue-700" : "text-slate-700"}`}>
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-400 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          平均 {avg}%
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Progress detail */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "平均進捗率", value: `${avgProgress}%`, sub: `${enrolledCourses.length}コース受講中`, color: "text-blue-600" },
                  { label: "完了コース", value: `${completedCount}`, sub: `/ ${enrolledCourses.length} コース`, color: "text-emerald-600" },
                  { label: "進行中", value: `${enrolledCourses.length - completedCount}`, sub: "コース学習中", color: "text-amber-500" },
                ].map((card) => (
                  <div key={card.label} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 font-medium mb-1">{card.label}</p>
                    <p className={`text-2xl font-extrabold tabular-nums ${card.color}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {card.value}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* User name + status */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700">{selectedProgressUser.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {selectedProgressUser.name}
                      </p>
                      <p className="text-xs text-slate-400">{selectedProgressUser.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    selectedProgressUser.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedProgressUser.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {selectedProgressUser.status === "active" ? "有効" : "無効"}
                  </span>
                </div>

                {/* Overall progress bar */}
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">全コース平均進捗</span>
                  <span className="font-bold text-blue-600 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {avgProgress}%
                  </span>
                </div>
                <ProgressBar value={avgProgress} height="h-2.5" />
              </div>

              {/* Per-course breakdown */}
              <div className="space-y-3">
                {enrolledCourses.length === 0 && (
                  <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                    <p className="text-slate-400 text-sm">受講コースがありません</p>
                  </div>
                )}
                {enrolledCourses.map((course) => {
                  const cp = userProgress[course.id];
                  const p = cp?.progress ?? 0;
                  const isExpanded = progressExpandedCourse === course.id;
                  const barColor: "blue" | "emerald" | "amber" = p === 100 ? "emerald" : p > 0 ? "blue" : "amber";

                  return (
                    <div key={course.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <button
                        onClick={() => setProgressExpandedCourse(isExpanded ? null : course.id)}
                        className="w-full flex items-center gap-4 p-4 sm:p-5 hover:bg-slate-50/60 transition-colors text-left"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-sm font-bold text-slate-800 truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                              {course.title}
                            </p>
                            <div className="flex items-center gap-2 shrink-0 ml-3">
                              {p === 100 && (
                                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">完了</span>
                              )}
                              <span className={`text-sm font-bold tabular-nums ${p === 100 ? "text-emerald-600" : p > 0 ? "text-blue-600" : "text-slate-400"}`}
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                {p}%
                              </span>
                            </div>
                          </div>
                          <ProgressBar value={p} color={barColor} height="h-1.5" />
                          {cp && (
                            <p className="text-xs text-slate-400 mt-1.5">
                              {cp.completed}/{cp.total} 動画完了
                              {cp.lastWatched !== "完了" && <span> · 最終視聴：{cp.lastWatched}</span>}
                            </p>
                          )}
                          {!cp && <p className="text-xs text-slate-300 mt-1">未視聴</p>}
                        </div>
                        {isExpanded
                          ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                      </button>

                      {/* Expanded: chapter breakdown */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 px-5 py-4 space-y-3">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">章別進捗</p>
                          {curriculum.map((chapter) => {
                            const chapterPct = chapterCompletionPercentage(chapter);
                            const chapterColor: "blue" | "emerald" | "amber" = chapterPct === 100 ? "emerald" : chapterPct > 0 ? "blue" : "amber";
                            return (
                              <div key={chapter.id}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs text-slate-600 font-medium">{chapter.title}</span>
                                  <span className={`text-xs font-bold tabular-nums ${chapterPct === 100 ? "text-emerald-600" : chapterPct > 0 ? "text-blue-600" : "text-slate-300"}`}
                                    style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                    {chapterPct}%
                                  </span>
                                </div>
                                <ProgressBar value={chapterPct} color={chapterColor} height="h-1.5" />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }



  return null;
}
