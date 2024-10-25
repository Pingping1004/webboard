import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtConstant } from './constant';
import { GoogleStrategy } from './strategies/google.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'
import { UsersController } from '../users/users.controller';
import { PostModule } from '../post/post.module';
import { PostService } from '../post/post.service';

@Module({
  imports: [
    PassportModule,
    forwardRef(() => UsersModule),
    TypeOrmModule,
    ConfigModule,
    PostModule,
    JwtModule.registerAsync({
      useFactory: async() => ({
        secret: JwtConstant.secret,
        signOptions: { expiresIn: '60m'},
      }),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
  exports:[AuthService, JwtStrategy],
})
export class AuthModule {}
