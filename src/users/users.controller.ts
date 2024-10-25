import { Controller, Post, Get, Patch, UseGuards, Body, Req, Res, Request, HttpException, HttpStatus, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { SignupUserDto, UpdatedUserDto } from './dto/users.dto';
import { User } from './entities/users.entity';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { UserPayload } from '../auth/auth.service';

@Controller('user')
export class UsersController {
    constructor(
        private readonly userService: UsersService,
        private readonly authService: AuthService,
    ) {}

    @Post('/signup')
    async signup(@Req() req, @Res({ passthrough: true }) res: Response) {
        try {
            const signupUserDto = req.body;

            if (!signupUserDto.username || !signupUserDto.password) {
                throw new HttpException('Missing username or password', HttpStatus.BAD_REQUEST);
            }
            
            const user = await this.userService.createUser(signupUserDto);
            console.log('User signup:', user);
            console.log('User signup ID:', user.userId);
            console.log('User signup role:', user.role);
            const { accessToken } = await this.authService.login({
                userId: user.userId,
                username: user.username,
                role: user.role,
            });

            res.cookie('access_token', accessToken, {
                httpOnly: true,
            });
            
            const userId = user.userId;
            const role = user.role;
            res.json({ userId, role });
        } catch (error) {
            throw new HttpException('Signup failed', HttpStatus.BAD_REQUEST);
        }
    }
}
