import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';

@Module({
  imports: [
    UsersModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, UsersService],
})
export class AdminModule {}
