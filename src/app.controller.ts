import { Controller, Get, Req, Res, Render, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import { GoogleAuthGuard } from './auth/google-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('/signup')
  async renderSignup(@Res() res: Response) {
      console.log('Signup page is rendering');
      res.render('signup');
  }

  @Get('/login')
  async renderLogin(@Res() res: Response) {
      console.log('Login page is rendering');
      res.render('login');
  }
}
