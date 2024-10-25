import { IsNotEmpty, IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { PostPictureDto } from '../dto/picture.dto';
import { User } from '../../users/entities/users.entity'

export class CreatePostDto {
    @IsNotEmpty()
    @IsString()
    title: string;
  
    @IsOptional()
    @IsString()
    content?: string;
  
    @IsArray()
    @IsOptional()
    @Type(() => PostPictureDto)
    pictureContent?: PostPictureDto[];
}

export class UpdatePostDto {
    @IsOptional()
    @IsString()
    title?: string;
  
    @IsOptional()
    @IsString()
    content?: string;
  
    @IsArray()
    @IsOptional()
    @Type(() => PostPictureDto)
    pictureContent?: PostPictureDto[];
}
