import { SetMetadata } from "@nestjs/common";
import { Role } from "src/users/entities/users.entity";

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);