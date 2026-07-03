import { Controller, Get, Param } from '@nestjs/common';
import { COURSES, USERS, USER_PROGRESS, getUserById } from '../data/mock-data';

@Controller('progress')
export class ProgressController {
  @Get('users/:id')
  findByUser(@Param('id') id: string) {
    const userId = Number(id);
    const user = getUserById(userId);

    if (!user) {
      return { message: 'User not found' };
    }

    return {
      user,
      courses: user.courses.map((courseId) => ({
        course: COURSES.find((course) => course.id === courseId),
        progress: USER_PROGRESS[userId]?.[courseId] ?? null,
      })),
    };
  }

  @Get('overview')
  overview() {
    return USERS.map((user) => ({
      user,
      courses: user.courses.length,
      activeProgressEntries: Object.keys(USER_PROGRESS[user.id] ?? {}).length,
    }));
  }
}