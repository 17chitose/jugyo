import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function calculateCourseProgress(
  chapters: { videos: { id: number }[] }[],
  progressEntries: { percent: number; videoId: number; completed: boolean }[],
) {
  const totalVideos = chapters.reduce((count, chapter) => count + chapter.videos.length, 0);
  const distinctCompletedVideos = new Set(progressEntries.filter((entry) => entry.completed).map((entry) => entry.videoId)).size;
  const averageProgress = progressEntries.length
    ? Math.round(progressEntries.reduce((sum, entry) => sum + entry.percent, 0) / progressEntries.length)
    : 0;

  if (totalVideos === 0) {
    return {
      progress: averageProgress,
      totalVideos: 0,
      completedVideos: 0,
    };
  }

  return {
    progress: averageProgress,
    totalVideos,
    completedVideos: distinctCompletedVideos,
  };
}

@Controller('courses')
export class CoursesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll() {
    const courses = await this.prisma.course.findMany({
      include: {
        chapters: {
          include: {
            videos: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        progress: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return courses.map((course) => {
      const courseProgress = calculateCourseProgress(course.chapters, course.progress);

      return {
        id: course.id,
        title: course.title,
        thumbnail: course.thumbnailUrl,
        ...courseProgress,
      };
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const courseId = Number(id);
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: {
            videos: {
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!course) {
      return { message: 'Course not found' };
    }

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnailUrl,
      curriculum: {
        courseId,
        chapters: course.chapters.map((chapter) => ({
          id: chapter.id,
          order: chapter.order,
          title: chapter.title,
          videos: chapter.videos.map((video) => ({
            id: video.id,
            chapterId: video.chapterId,
            order: video.order,
            title: video.title,
            duration: video.duration,
            status: 'available',
            videoUrl: video.assetKey ?? '',
          })),
        })),
      },
    };
  }

  @Get(':id/curriculum')
  async findCurriculum(@Param('id') id: string) {
    const courseId = Number(id);
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: {
            videos: {
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!course) {
      return { message: 'Course not found' };
    }

    return {
      courseId,
      chapters: course.chapters.map((chapter) => ({
        id: chapter.id,
        order: chapter.order,
        title: chapter.title,
        videos: chapter.videos.map((video) => ({
          id: video.id,
          chapterId: video.chapterId,
          order: video.order,
          title: video.title,
          duration: video.duration,
          status: 'available',
          videoUrl: video.assetKey ?? '',
        })),
      })),
    };
  }

  @Get(':id/chapters')
  async findChapters(@Param('id') id: string) {
    return this.findCurriculum(id);
  }
}