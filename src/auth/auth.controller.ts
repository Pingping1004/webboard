import { Controller, Get, Param, Post, Render, HttpException, HttpStatus, UseGuards , Req, Res, SetMetadata } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { GoogleAuthGuard } from './google-auth.guard';
import { clearCookie } from 'cookie-parser'
import { User } from '../users/entities/users.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './role-auth.guard';
import { PostService } from '../post/post.service';
import { Role } from '../users/entities/users.entity';
import { Roles } from './role.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly postService: PostService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    try {
      console.log('Req user object from login controller', req.user);
      const { accessToken, user } = await this.authService.login(req.user);

      res.cookie('access_token', accessToken, {
        httpOnly: true,
      });

      console.log('userId from login', user.userId);
      res.json({ userId: user.userId, role: user.role, username: user.username, profilePicture: user.profilePicture });
    } catch (error) {
      console.error('Login failed', error.message);
      throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('index/:id')
  @UseGuards(JwtAuthGuard)
  async renderAuthIndex(@Param('userId') userId: string, @Req() req: any, @Res() res: Response) {
    console.log('ID from URL param before parsing:', userId);
    const userIdFromParam = parseInt(userId, 10);

    if (isNaN(userIdFromParam)) {
      console.error('Failed to parse userId from URL parameter:', userId);
      return res.status(400).send('Invalid userId');
    }

    const userID = req.user.userId;
    const role = req.user.role;
    const posts = await this.postService.getAllPosts();

    console.log('User ID from URL:', typeof userIdFromParam, userIdFromParam);
    console.log('Req user object:', req.user);
    console.log('Req user userID with userId:', typeof req.user.userId, req.user.userId);

    if (userIdFromParam !== userID) {
      return res.status(403).send('Forbidden');
    }

    res.render('index', { userId, role, posts });
  }

  @Get('admin/index/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  async renderAdminAuthIndex(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
      const userIdFromParam = parseInt(id, 10);

      // Check if parsing was successful
      if (isNaN(userIdFromParam)) {
          console.error('Failed to parse user ID for admin from URL parameter:', id);
          return res.status(400).send('Invalid user ID');
      }

      if (req.user.role !== 'admin') {
          return res.status(403).send('Forbidden: Admin access only');
      }

      const user = req.user;
      const userId = req.user.userId;
      const role = req.user.role;
      // console.log('Admin user ID from url:', userIdFromParam);
      // console.log('req admin user:', req.user);
      // console.log('Req admin user with userId:', req.user.userId);

      if (userIdFromParam !== req.user.userId) {
          return res.status(403).send('Forbidden');
      }
      res.render('admin', { userId, role, user });
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res({ passthrough: true }) res: Response) {
      const { accessToken } = await this.authService.googleLogin(req);
      res.cookie('access_token', accessToken, {
          httpOnly: true,
      });
      return {
          accessToken,
          message: 'Google authentication successful'
      }
  }

  @Get('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
      try {
          res.clearCookie('access_token', {
              httpOnly: true,
          });

          console.log('Logout function is activated');
          return res.status(HttpStatus.OK).json({ message: 'Logout successful' });
      } catch(error) {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Logout failed' });
      }
  }
}
