import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');

      return {
        status: 'ok',
        service: 'learnflow-api',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'degraded',
        service: 'learnflow-api',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      };
    }
  }
}