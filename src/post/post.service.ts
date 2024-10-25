import {
  NotFoundException,
  Injectable,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Picture } from './entities/picture.entity';
import { Post } from './entities/post.entity';
import { User } from 'src/users/entities/users.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Picture)
    private readonly picturesRepository: Repository<Picture>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    userId: number,
  ): Promise<Post> {
    try {
      const author = await this.userRepository.findOne({
        where: { userId },
      });

      const post = this.postRepository.create({
        ...createPostDto,
        author,
        pictures: [],
      });

      if (
        createPostDto.pictureContent &&
        createPostDto.pictureContent.length > 0
      ) {
        const pictures = createPostDto.pictureContent.map((pictureData) => {
          const picture = new Picture();
          picture.pictureUrl = pictureData.pictureUrl;
          picture.post = post;
          return picture;
        });
        post.pictures = pictures;
      }

      console.log('Author ID of owner:', post.author);
      const newPost = await this.postRepository.save(post);
      console.log('New created post:', newPost);
      return newPost;
    } catch (error) {
      console.error('Failed to create post', error.message);
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  async getAllPosts(): Promise<Post[]> {
    try {
      return await this.postRepository.find({
        relations: ['author', 'pictures'],
      });
    } catch (error) {
      console.error('Failed to render all posts', error.message);
      throw new InternalServerErrorException('Failed to retrieve posts');
    }
  }

  async getPostById(postId: number): Promise<Post | null> {
    try {
      const post = await this.postRepository.findOne({
        where: { postId },
        relations: ['author', 'pictures'],
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      console.log('Post that get by ID:', post);
      return post;
    } catch (error) {
      console.error('Failed to render post', error.message);
    }
  }

  async updatePost(
    postId: number,
    updatePostDto: UpdatePostDto,
    userId: number,
  ): Promise<Post | null> {
    try {
      const post = await this.getPostById(postId);
      console.log('Updated post detail:', post);
      console.log('Update DTO:', updatePostDto);

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      console.log('Author id of updating post:', post.author?.userId);
      console.log('User who update the post:', userId);

      if (post.author?.userId !== userId) {
        throw new ForbiddenException(
          'You do not have permission to edit this post',
        );
      }

      Object.assign(post, updatePostDto);
      return await this.postRepository.save(post);
    } catch (error) {
      console.error('Failed to update post', error.message);
      throw new InternalServerErrorException('Failed to update post');
    }
  }

  async deletePost(postId: number, userId: number): Promise<Post> {
    try {
      console.log('postId to delete:', postId);

      const post = await this.getPostById(postId);

      console.log('Deleted post detail:', post);

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      console.log('Author id of updating post:', post.author.userId);
      console.log('User who delete the post:', userId);

      return await this.postRepository.remove(post);
    } catch (error) {
      console.error('Failed to delete post', error.message);
    }
  }
}
