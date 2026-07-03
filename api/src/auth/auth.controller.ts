import { Body, Controller, Post } from '@nestjs/common';

interface LoginInput {
  email?: string;
  password?: string;
}

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() body: LoginInput) {
    const email = body.email?.trim().toLowerCase() ?? 'demo@example.com';
    const isAdmin = email.includes('admin');

    return {
      accessToken: `demo-${isAdmin ? 'admin' : 'student'}-token`,
      user: {
        id: isAdmin ? 4 : 1,
        email,
        role: isAdmin ? 'admin' : 'student',
      },
    };
  }
}