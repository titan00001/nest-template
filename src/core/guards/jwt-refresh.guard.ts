import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@/features/user/user.service';
import { BusinessError } from '@/common/business-error';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtRefreshGuard implements CanActivate {
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const refreshToken = request.body?.refreshToken;

		if (!refreshToken) {
			throw new BusinessError('UNAUTHORIZED', 'Refresh token is required');
		}

		try {
			// Verify the refresh token is valid
			const decoded = this.jwtService.verify(refreshToken, {
				secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
			});

			const user = await this.userService.getUserById(decoded.sub);

			if (!user) {
				throw new BusinessError('UNAUTHORIZED', 'Invalid refresh token');
			}

			const allowMultipleTokens = this.configService.get<boolean>('ALLOW_MULTIPLE_REFRESH_TOKENS');

			if (allowMultipleTokens) {
				// Multiple tokens mode
				if (!user.refreshTokens || user.refreshTokens.length === 0) {
					throw new BusinessError('UNAUTHORIZED', 'Invalid refresh token');
				}

				// Find the matching refresh token
				const tokenInfo = user.refreshTokens.find((tokenInfo) =>
					bcrypt.compareSync(refreshToken, tokenInfo.token),
				);

				if (!tokenInfo) {
					throw new BusinessError('UNAUTHORIZED', 'Invalid refresh token');
				}
			} else {
				// Single token mode
				if (!user.refreshToken) {
					throw new BusinessError('UNAUTHORIZED', 'Invalid refresh token');
				}

				const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
				if (!refreshTokenMatches) {
					throw new BusinessError('UNAUTHORIZED', 'Invalid refresh token');
				}
			}

			// Attach user to request
			request.user = user;
			request.refreshToken = refreshToken;

			return true;
		} catch (error) {
			throw new BusinessError('UNAUTHORIZED', 'Invalid refresh token');
		}
	}
}
