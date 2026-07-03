import { Controller, Get, Param } from '@nestjs/common';
import { CURRICULUM, COURSES, getCourseById, getCurriculumByCourseId } from '../data/mock-data';

@Controller('courses')
export class CoursesController {
  @Get()
  findAll() {
    return COURSES;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const courseId = Number(id);
    const course = getCourseById(courseId);

    if (!course) {
      return { message: 'Course not found' };
    }

    return {
      ...course,
      curriculum: getCurriculumByCourseId(courseId),
    };
  }

  @Get(':id/curriculum')
  findCurriculum(@Param('id') id: string) {
    return getCurriculumByCourseId(Number(id));
  }

  @Get(':id/chapters')
  findChapters(@Param('id') id: string) {
    return {
      courseId: Number(id),
      chapters: CURRICULUM,
    };
  }
}