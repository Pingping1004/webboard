import { isNotEmpty, IsNotEmpty, IsOptional, isString, IsString } from 'class-validator';

export  class SignupUserDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    role: string;
}

export class LoginUserDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}

export class UpdatedUserDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    role?: string;

    @IsString()
    displayName: string;

    @IsOptional()
    @IsString()
    profilePicture?: string;
}