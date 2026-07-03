import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { createUser, getUserById, updateUser, USERS } from '../data/mock-data';

interface UserInput {
  name?: string;
  email?: string;
  status?: 'active' | 'inactive';
  role?: 'student' | 'admin';
  courses?: number[];
}

@Controller('users')
export class UsersController {
  @Get()
  findAll() {
    return USERS;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return getUserById(Number(id)) ?? { message: 'User not found' };
  }

  @Post()
  create(@Body() body: UserInput) {
    if (!body.name || !body.email) {
      return { message: 'name and email are required' };
    }

    return createUser({
      name: body.name,
      email: body.email,
      status: body.status,
      role: body.role,
      courses: body.courses,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UserInput) {
    return updateUser(Number(id), body) ?? { message: 'User not found' };
  }
}