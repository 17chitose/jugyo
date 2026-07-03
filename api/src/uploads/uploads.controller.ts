import { Body, Controller, Post } from '@nestjs/common';

interface PresignInput {
  fileName?: string;
  contentType?: string;
}

@Controller('uploads')
export class UploadsController {
  @Post('presign')
  presign(@Body() body: PresignInput) {
    const fileName = body.fileName?.trim() || 'video.mp4';
    const objectKey = `uploads/${Date.now()}-${fileName}`;

    return {
      uploadUrl: `https://s3.amazonaws.com/demo-bucket/${encodeURIComponent(objectKey)}?signature=demo`,
      objectKey,
      contentType: body.contentType ?? 'video/mp4',
    };
  }
}