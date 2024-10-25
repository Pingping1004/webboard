import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/users.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export interface UserPayload {
    userId: number;
    username: string;
    role: string;
    user: User;
}

export class AuthService {
  constructor (
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<UserPayload | null> {
    const user = await this.usersService.findByUserName(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      return {
        userId: user.userId,
        username: user.username,
        role: user.role,
        user,
      }
    }
    return null;
  }

  async login(user: Partial<User>) {
    console.log('User object received for login:', user);
    const foundUser = await this.userRepository.findOne({
      where: { username: user.username },
    });

    if (!foundUser) {
      throw new Error('User not found');
    }

    const payload = { username: foundUser.username, userId: foundUser.userId, role: foundUser.role };
    const accessToken = this.jwtService.sign(payload);
    console.log('Generate token payload:', payload);

    return {
      accessToken,
      message: 'Login successful',
      user: {
        userId: foundUser.userId,
        username: foundUser.username,
        role: foundUser.role,
        profilePicture: foundUser.profilePicture,
      },
    };
  }

  async googleLogin(req: any): Promise<any> {
    if (!req.user) {
      throw new Error('Google login failed: No user information received');
    }

    const { username, role, profilePicture, googleId } = req.user;
    let user = await this.usersService.findByUserName(username);

    if (!user) {
      user = this.userRepository.create({
        username,
        role,
        profilePicture,
        googleId,
      });

      await this.userRepository.save(user);
    }

    const payload = { username: user.username };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    }
  }

  async findUserById(userId: number): Promise<User> {
    const user = await this.usersService.findByUserId(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
