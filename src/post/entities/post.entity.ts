import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index, OneToMany } from "typeorm";
import { User } from '../../users/entities/users.entity';
import { Picture } from '../entities/picture.entity';

@Entity('post')
@Index('IDX_AUTHOR_ID', ["author"])
export class Post {
    @PrimaryGeneratedColumn()
    postId: number;

    @Column()
    title: string;

    @Column()
    content?: string;

    @OneToMany(() => Picture, (picture) => picture.post, {
        cascade: true,
        eager: true,
    })
    pictures: Picture[];

    @ManyToOne(() => User, (user) => user.posts, {
        onDelete: 'CASCADE',
        eager: true,
    })

    @JoinColumn({ name: 'authorId' })
    author: User;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date: Date;
}