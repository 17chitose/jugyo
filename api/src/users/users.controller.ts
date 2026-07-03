import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface UserInput {
  name?: string;
  email?: string;
  status?: 'active' | 'inactive';
  role?: 'student' | 'admin';
  courses?: number[];
}

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  private toUserResponse(user: {
    id: number;
    name: string;
    email: string;
    status: 'active' | 'inactive';
    role: 'student' | 'admin';
    enrollments?: { courseId: number }[];
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      role: user.role,
      courses: user.enrollments?.map((enrollment) => enrollment.courseId) ?? [],
    };
  }

  @Get()
  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        enrollments: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return users.map((user) => this.toUserResponse(user));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        enrollments: true,
      },
    });

    return user ? this.toUserResponse(user) : { message: 'User not found' };
  }

  @Post()
  async create(@Body() body: UserInput) {
    if (!body.name || !body.email) {
      return { message: 'name and email are required' };
    }

    const createdUser = await this.prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        status: body.status ?? 'active',
        role: body.role ?? 'student',
        enrollments: body.courses?.length
          ? {
              create: body.courses.map((courseId) => ({
                courseId,
              })),
            }
          : undefined,
      },
      include: {
        enrollments: true,
      },
    });

    return this.toUserResponse(createdUser);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UserInput) {
    const userId = Number(id);
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return { message: 'User not found' };
    }

    const updatedUser = await this.prisma.$transaction(async (transaction) => {
      if (body.courses) {
        await transaction.enrollment.deleteMany({
          where: { userId },
        });
      }

      return transaction.user.update({
        where: { id: userId },
        data: {
          name: body.name,
          email: body.email,
          status: body.status,
          role: body.role,
          enrollments: body.courses
            ? {
                create: body.courses.map((courseId) => ({
                  courseId,
                })),
              }
            : undefined,
        },
        include: {
          enrollments: true,
        },
      });
    });

    return this.toUserResponse(updatedUser);
  }
}