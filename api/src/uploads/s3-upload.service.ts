import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3UploadService {
  private readonly s3Client = new S3Client({
    region: process.env.AWS_REGION,
  });

  async createPresignedUploadUrl(params: { fileName: string; contentType: string }) {
    const bucket = process.env.AWS_S3_BUCKET;

    if (!bucket) {
      throw new Error('AWS_S3_BUCKET is not configured');
    }

    const objectKey = `uploads/${Date.now()}-${params.fileName}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: params.contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 60 * 10,
    });

    return {
      uploadUrl,
      objectKey,
      contentType: params.contentType,
    };
  }
}