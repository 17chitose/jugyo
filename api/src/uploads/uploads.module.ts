import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { S3UploadService } from './s3-upload.service';

@Module({
  controllers: [UploadsController],
  providers: [S3UploadService],
})
export class UploadsModule {}