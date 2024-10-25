import { Exclude, Expose } from 'class-transformer'
import { Post } from '../entities/post.entity';

export class PostPictureDto {
    @Expose()
    @Exclude()
    id?: number;

    @Expose()
    pictureUrl: string;

    @Expose()
    post?: Post;
}