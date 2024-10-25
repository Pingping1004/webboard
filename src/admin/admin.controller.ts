import { Controller, Get, Body, Patch, Param, Delete, Req, Res, UseGuards, InternalServerErrorException, ParseIntPipe } from '@nestjs/common';
import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { UpdatedUserDto } from '../users/dto/users.dto';
import { UsersService } from '../users/users.service';
import { Roles } from '../auth/role.decorator';
import { Role } from '../users/entities/users.entity';
import { RolesGuard } from '../auth/role-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Get('dashboard')
  async getAllUsersForAdmin(@Req() req, @Res() res: Response) {
    try {
      const users = await this.usersService.getAllUsers();
      const userId = req.user.userId;
      const role = req.user.role;

      if (!userId || role !== Role.admin) {
        return res.status(402).send('Forbidden: You do not have an access to this page');
      }

      res.render('dashboard', { userId, role, users });
      // res.json({ userId, role, users });
      // return res.status(200).json({ userId, role, users });
    } catch (error) {
      console.error('Failed to render all user for admin page:', error.message);
      res.status(500).send('Internal Server Error');
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Get('/dashboard/users') // Different endpoint for fetching JSON data
  async getAllUsersJson(@Req() req, @Res() res: Response) {
    try {
      const users = await this.usersService.getAllUsers();
      const userId = req.user.userId;
      const role = req.user.role;

    // Send user data as JSON
      return res.status(200).json({ userId, role, users });
    } catch (error) {
    console.error('Failed to fetch all users:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Patch('update/:userId')
  async updateUser(@Param('userId', ParseIntPipe) userId: number, @Body() updatedUserDto: UpdatedUserDto, @Req() req, @Res() res) {
    try {

      const adminName = req.user.name;
      const updatedUser = await this.usersService.updateUser(
        userId,
        adminName,
        updatedUserDto,
      )

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('Updated user detail', updatedUser);
      return res.status(200).json({ message: 'User update successfully' });
    } catch (error) {
      console.error('Failed to update user in controller', error.message);
      return res.status(500).json({ message: 'Failed to update user' });
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Delete('delete/:userId')
  async deleteUser(@Param('userId') userId: number, @Req() req, @Res() res) {
    try {
      const adminName = req.user?.name;
      const deletedUser = await this.usersService.findByUserId(userId);

      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      await this.usersService.deleteUser(adminName, userId);
      return res.status(200).json({ message: 'Delete user ID ' + userId + ' successfully'});
      // return res.redirect('/admin/dashboard');
    } catch (error) {
      console.error('Failed to delete user in controller', error.message);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
