import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { HealthModule } from './health/health.module';
import { ProgressModule } from './progress/progress.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [HealthModule, AuthModule, UsersModule, CoursesModule, ProgressModule, UploadsModule],
})
export class AppModule {}