import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3UploadService } from './s3-upload.service';

interface PresignInput {
  fileName?: string;
  contentType?: string;
}

@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3UploadService: S3UploadService,
  ) {}

  @Post('presign')
  async presign(@Body() body: PresignInput) {
    const fileName = body.fileName?.trim() || 'video.mp4';
    const contentType = body.contentType ?? 'video/mp4';
    const presignedUpload = await this.s3UploadService.createPresignedUploadUrl({
      fileName,
      contentType,
    });

    await this.prisma.uploadAsset.create({
      data: {
        fileName,
        mimeType: contentType,
        objectKey: presignedUpload.objectKey,
        uploadStatus: 'pending',
      },
    });

    return presignedUpload;
  }
}