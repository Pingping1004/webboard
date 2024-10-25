import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtConstant } from '../constant';
import { AuthService } from "../auth.service";
import { UsersService } from "src/users/users.service";

interface JwtPayload {
    userId: number;
    username: string;
    role:  string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request) => {
                    return request?.cookies?.access_token;
                },
            ]),
            ignoreExpiration: false,
            secretOrkey: JwtConstant.secret,
        });
    }

    async validate(payload: JwtPayload): Promise<JwtPayload> {
        console.log('JWT Payload:', payload);
        const user = await this.authService.findUserById(payload.userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        console.log('JWT validation user:', user);
        return { userId: user.id, username: user.username, role: user.role };
    }
}