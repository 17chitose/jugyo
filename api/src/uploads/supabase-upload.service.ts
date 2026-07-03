import { Injectable } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

interface SignedUploadOptions {
  fileName: string;
  contentType: string;
}

@Injectable()
export class SupabaseUploadService {
  private readonly supabase: SupabaseClient;
  private readonly bucketName: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET;

    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL is required');
    }

    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
    }

    if (!bucketName) {
      throw new Error('SUPABASE_STORAGE_BUCKET is required');
    }

    this.bucketName = bucketName;
    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async createSignedUploadUrl({ fileName, contentType }: SignedUploadOptions) {
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]+/g, '-');
    const objectKey = `uploads/${randomUUID()}-${safeFileName}`;
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .createSignedUploadUrl(objectKey);

    if (error) {
      throw new Error(`Failed to create Supabase signed upload URL: ${error.message}`);
    }

    if (!data) {
      throw new Error('Supabase signed upload URL response was empty');
    }

    return {
      bucket: this.bucketName,
      contentType,
      objectKey,
      path: objectKey,
      token: data.token,
      uploadUrl: data.signedUrl,
    };
  }
}