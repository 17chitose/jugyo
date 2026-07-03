import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { COURSES, CURRICULUM, USER_PROGRESS, USERS } from '../src/data/mock-data';

const prisma = new PrismaClient();

async function main() {
  // Ensure Supabase Storage bucket 'uploads' exists
  await prisma.$executeRawUnsafe(`
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('uploads', 'uploads', true)
    ON CONFLICT (id) DO NOTHING;
  `).catch((err) => {
    // eslint-disable-next-line no-console
    console.warn('Could not create storage bucket uploads (this is normal if storage schema does not exist):', err.message);
  });

  await prisma.$transaction([
    prisma.progress.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.video.deleteMany(),
    prisma.chapter.deleteMany(),
    prisma.course.deleteMany(),
    prisma.user.deleteMany(),
    prisma.uploadAsset.deleteMany(),
  ]);

  const userIdMap = new Map<number, number>();
  const courseIdMap = new Map<number, number>();
  const videoIdMap = new Map<string, number>();

  for (const user of USERS) {
    const created = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        role: user.role === 'admin' ? UserRole.admin : UserRole.student,
        status: user.status === 'inactive' ? UserStatus.inactive : UserStatus.active,
      },
    });

    userIdMap.set(user.id, created.id);
  }

  for (const course of COURSES) {
    const createdCourse = await prisma.course.create({
      data: {
        title: course.title,
        thumbnailUrl: course.thumbnail,
      },
    });

    courseIdMap.set(course.id, createdCourse.id);

    // Seed chapters and videos for this course
    for (const chapterGroup of CURRICULUM) {
      const createdChapter = await prisma.chapter.create({
        data: {
          courseId: createdCourse.id,
          order: chapterGroup.order,
          title: chapterGroup.title,
        },
      });

      for (const video of chapterGroup.videos) {
        const createdVideo = await prisma.video.create({
          data: {
            chapterId: createdChapter.id,
            order: video.order,
            title: video.title,
            duration: video.duration,
            assetKey: `seed/${video.id}.mp4`,
          },
        });

        // Compound key uniquely mapping mock video ID per course to the DB ID
        videoIdMap.set(`${course.id}-${video.id}`, createdVideo.id);
      }
    }
  }

  for (const user of USERS) {
    const createdUserId = userIdMap.get(user.id);

    if (!createdUserId) {
      continue;
    }

    for (const courseId of user.courses) {
      const createdCourseId = courseIdMap.get(courseId);

      if (!createdCourseId) {
        continue;
      }

      await prisma.enrollment.create({
        data: {
          userId: createdUserId,
          courseId: createdCourseId,
        },
      });
    }
  }

  for (const [userId, courses] of Object.entries(USER_PROGRESS)) {
    const createdUserId = userIdMap.get(Number(userId));

    if (!createdUserId) {
      continue;
    }

    for (const [courseId, progress] of Object.entries(courses)) {
      const createdCourseId = courseIdMap.get(Number(courseId));
      
      // Resolve the first video of the curriculum for this course
      const firstChapter = CURRICULUM[0];
      const firstVideoId = firstChapter?.videos[0]?.id;
      const createdVideoId = firstVideoId ? videoIdMap.get(`${courseId}-${firstVideoId}`) : undefined;

      if (!createdCourseId || !createdVideoId) {
        continue;
      }

      await prisma.progress.create({
        data: {
          userId: createdUserId,
          courseId: createdCourseId,
          videoId: createdVideoId,
          percent: progress.progress,
          completed: progress.progress >= 100,
          lastWatchedAt: new Date(),
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });