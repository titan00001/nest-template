import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
	@Expose()
	@ApiProperty({ example: '507f1f77bcf86cd799439011' })
	id: string;

	@Expose()
	@ApiProperty({ example: 'john.doe@example.com' })
	email: string;

	@Expose()
	@ApiProperty({ example: 'John Doe' })
	name: string;

	@Expose()
	@ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
	createdAt: Date;

	@Expose()
	@ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
	updatedAt: Date;

	@Expose()
	@ApiProperty({ example: 2, description: 'Number of active sessions' })
	activeSessions?: number;

	@Expose()
	@ApiProperty({ example: true, description: 'Whether user has active sessions' })
	get hasActiveSessions(): boolean {
		return this.activeSessions > 0;
	}
}
