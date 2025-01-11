import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../user/user.schema';
import { EmailService } from '../mail/email.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RefreshTokenStrategy } from './strategy/jwt-refresh.strategy';
import { UserModule } from '../user/user.module';

@Module({
	imports: [PassportModule, UserModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
	providers: [AuthService, EmailService, JwtStrategy, RefreshTokenStrategy],
	controllers: [AuthController],
})
export class AuthModule {}
