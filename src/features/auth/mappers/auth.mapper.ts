import { plainToInstance } from 'class-transformer';
import { AuthResponseDto } from '../dto/auth-response.dto';

export class AuthMapper {
	static toAuthResponseDto(accessToken: string, refreshToken: string): AuthResponseDto {
		return plainToInstance(
			AuthResponseDto,
			{
				accessToken,
				refreshToken,
				accessTokenExpiresIn: '15m',
				refreshTokenExpiresIn: '7d',
				tokenType: 'bearer',
			},
			{ excludeExtraneousValues: true },
		);
	}
}
