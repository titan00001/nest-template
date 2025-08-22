import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@/features/user/user.service';
import { BusinessError } from '@/common/business-error';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
		});
	}

	async validate(payload: any) {
		const user = await this.userService.getUserById(payload.sub);
		if (!user) {
			throw new BusinessError('UNAUTHORIZED', 'Invalid token');
		}
		return user;
	}
}
