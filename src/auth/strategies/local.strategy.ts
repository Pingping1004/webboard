import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/users.entity';
import { UserPayload } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService,
    ) {
        super({
            usernameField: 'username',
            passwordField: 'password',
        });
    }

    async validate(username: string, password: string): Promise<UserPayload | null> {
        console.log('Validate in strategy for user:', username);
        const user = await this.authService.validateUser(username, password);

        if (!user) {
            console.log('Invalid credentials');
            throw new UnauthorizedException();
        }
        return user;
    }
}