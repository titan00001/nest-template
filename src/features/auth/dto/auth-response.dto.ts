import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
	@Expose()
	@ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT access token' })
	accessToken: string;

	@Expose()
	@ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT refresh token' })
	refreshToken: string;

	@Expose()
	@ApiProperty({ example: '15m', description: 'Access token expiration time' })
	accessTokenExpiresIn: string;

	@Expose()
	@ApiProperty({ example: '7d', description: 'Refresh token expiration time' })
	refreshTokenExpiresIn: string;

	@Expose()
	@ApiProperty({ example: 'bearer', description: 'Token type' })
	tokenType: string = 'bearer';
}
