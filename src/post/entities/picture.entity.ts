import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Post } from '../entities/post.entity';
import { Exclude } from 'class-transformer';

@Entity('pictures')
export class Picture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, length: 300 })
  pictureUrl: string;

  @Exclude()
  @ManyToOne(() => Post, (post) => post.pictures, {
    onDelete: 'CASCADE',
  })

  @JoinColumn({ name: 'postId' })
  post: Post;
}
