import { Controller, Post, Get, Patch, Delete, Param, Body, Req, Res, UseGuards, UseInterceptors, NotFoundException, InternalServerErrorException, UploadedFiles, UploadedFile } from '@nestjs/common';
import { Request, Response } from 'express';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { UsersService } from '../users/users.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { User } from '../users/entities/users.entity';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UsersService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async createPost(@Req() req, @Res() res, @Body() createPostDto: CreatePostDto, @UploadedFiles() files: File[]) {
    try {
      const userId = req.user.userId
      const user = await this.userService.findByUserId(userId);

      if (!user) {
        throw new Error('User not found');
      }

       if (!files || files.length > 0) {
        throw new Error('No file uploaded');
       }

       const post = await this.postService.createPost(createPostDto, userId);
       console.log('Created post in controller', post);
       return res.status(200).json({ message: 'Created post successfully', post });
    } catch (error) {
      console.error('Failed to get post in controller', error.message);
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  async getAllPost(@Req() req, @Res() res: Response) {
      try {
          const posts = await this.postService.getAllPosts();
          const userId = req.user.userId;
          const role = req.user.role;

          console.log('User ID before get all post and search post owner:', userId);
          return res.status(200).json({ posts, userId, role });
      } catch (error) {
          console.error('Failed to get post in controller', error.message);
          throw new InternalServerErrorException('Failed to retrieve posts');
      }
  }

  @Patch('update/:postId')
  @UseGuards(JwtAuthGuard)
  async updatePost(@Param('postId') postId: number, @Body() updatePostDto: UpdatePostDto, @Req() req, @Res() res) {
      try {
          console.log('User from request:', req.user);
          const userId = req.user.userId;
          console.log('User ID in update controller:', userId);
          const post = await this.postService.updatePost(
              postId,
              updatePostDto,
              userId,
          )

          if (!post) {
              return res.status(404).json({ message: 'Post not found or you do not have permission to edit' })
          }

          return res.status(200).json(post);
      } catch (error) {
          console.error('Failed to update post in controller', error.message);
          return res.status(500).json({ message: 'Failed to update post' });
      }
  }

  @Delete('delete/:postId')
  @UseGuards(JwtAuthGuard)
  async deletePost(@Param('postId') postId: number, @Req() req, @Res() res) {
      try {
          const userId = req.user?.userId;
          const post = await this.postService.getPostById(postId);
          const role = req.user.role;
          const authorId = post.author.userId;
          console.log('Author ID of the post:', authorId);

          if (!post) {
              return res.status(404).json({ message: 'Post not found' });
          }

          if (authorId !== req.user.userId && role !== 'admin') {
              return res.status(403).json({ message: 'You are not allowed to delete this post.' });
          }

          await this.postService.deletePost(postId, userId);
          return res.status(200).json({ message: 'Post deleted successfully', postId })
      } catch (error) {
          console.error('Failed to delete post in controller', error.message);
          throw new InternalServerErrorException('Failed to delete post');
      }
  }
}
