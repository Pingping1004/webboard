import { Module, forwardRef } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Picture } from './entities/picture.entity';
import { UsersModule } from 'src/users/users.module';
import { Post } from './entities/post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Picture]),
    forwardRef(() => UsersModule),
  ],
  controllers: [PostController],
  providers: [PostService, UsersService],
  exports: [PostService],
})
export class PostModule {}
