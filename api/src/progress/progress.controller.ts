import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('progress')
export class ProgressController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('users/:id')
  async findByUser(@Param('id') id: string) {
    const userId = Number(id);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                progress: {
                  where: { userId },
                  include: {
                    video: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return { message: 'User not found' };
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        role: user.role,
        courses: user.enrollments.map((enrollment) => enrollment.courseId),
      },
      courses: user.enrollments.map((enrollment) => {
        const progressEntries = enrollment.course.progress;
        const completedVideos = progressEntries.filter((entry) => entry.completed).length;
        const totalVideos = progressEntries.length;
        const progressValue = totalVideos === 0 ? 0 : Math.round(progressEntries.reduce((sum, entry) => sum + entry.percent, 0) / totalVideos);
        const lastWatchedEntry = [...progressEntries].sort((left, right) => {
          const leftTime = left.lastWatchedAt?.getTime() ?? 0;
          const rightTime = right.lastWatchedAt?.getTime() ?? 0;
          return rightTime - leftTime;
        })[0];

        return {
          course: {
            id: enrollment.course.id,
            title: enrollment.course.title,
            thumbnail: enrollment.course.thumbnailUrl,
            progress: progressValue,
            totalVideos,
            completedVideos,
          },
          progress: totalVideos
            ? {
                progress: progressValue,
                completed: completedVideos,
                total: totalVideos,
                lastWatched: lastWatchedEntry?.video.title ?? null,
              }
            : null,
        };
      }),
    };
  }

  @Get('overview')
  async overview() {
    const users = await this.prisma.user.findMany({
      include: {
        enrollments: true,
        progress: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return users.map((user) => ({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        role: user.role,
        courses: user.enrollments.map((enrollment) => enrollment.courseId),
      },
      courses: user.enrollments.length,
      activeProgressEntries: user.progress.length,
    }));
  }
}