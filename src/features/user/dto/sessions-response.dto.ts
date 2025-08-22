import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SessionResponseDto } from './session-response.dto';

export class SessionsResponseDto {
	@Expose()
	@ApiProperty({ example: 3, description: 'Total number of active sessions' })
	activeSessions: number;

	@Expose()
	@Type(() => SessionResponseDto)
	@ApiProperty({ type: [SessionResponseDto], description: 'List of active sessions' })
	sessions: SessionResponseDto[];

	@Expose()
	@ApiProperty({ example: true, description: 'Whether multiple tokens are enabled' })
	multipleTokensEnabled: boolean;
}
