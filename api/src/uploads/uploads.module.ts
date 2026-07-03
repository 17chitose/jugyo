import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { SupabaseUploadService } from './supabase-upload.service';

@Module({
  controllers: [UploadsController],
  providers: [SupabaseUploadService],
})
export class UploadsModule {}