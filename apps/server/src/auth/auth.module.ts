import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RegisterController } from './register/register.controller.js';
import { RegisterService } from './register/register.service.js';
import { LoginController } from './login/login.controller.js';
import { LoginService } from './login/login.service.js';
import { SessionGuard } from './session.guard.js';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController, RegisterController, LoginController],
  providers: [AuthService, RegisterService, LoginService, SessionGuard],
  exports: [AuthService, SessionGuard],
})
export class AuthModule {}
