import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../user/user.schema';
import { EmailService } from '../mail/email.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RefreshTokenStrategy } from './strategy/jwt-refresh.strategy';
import { UserModule } from '../user/user.module';
import { JwtRefreshGuard } from '@/core/guards/jwt-refresh.guard';

@Module({
	imports: [
		PassportModule,
		ConfigModule,
		JwtModule,
		UserModule,
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
	],
	providers: [AuthService, EmailService, JwtStrategy, RefreshTokenStrategy, JwtRefreshGuard],
	controllers: [AuthController],
	exports: [JwtRefreshGuard],
})
export class AuthModule {}
