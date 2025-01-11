import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { BusinessError } from '@/common/business-error';
import { UserService } from '@/features/user/user.service';
import { IJwtPayload } from '@/core/interfaces/jwt-user.payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('JWT_SECRET'),
		});
	}

	async validate(payload: IJwtPayload) {
		const user = await this.userService.getUserById(payload.sub);
		if (!user) {
			throw new BusinessError('UNAUTHORIZED', 'Not authenticated');
		}
		return user;
	}
}
