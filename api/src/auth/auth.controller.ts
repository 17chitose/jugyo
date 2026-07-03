import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface LoginInput {
  email?: string;
  password?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('login')
  async login(@Body() body: LoginInput) {
    const email = body.email?.trim().toLowerCase() ?? 'demo@example.com';
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    const isAdmin = user?.role === 'admin' || email.includes('admin');

    return {
      accessToken: `demo-${isAdmin ? 'admin' : 'student'}-token`,
      user: {
        id: user?.id ?? (isAdmin ? 4 : 1),
        email,
        role: isAdmin ? 'admin' : 'student',
      },
    };
  }
}