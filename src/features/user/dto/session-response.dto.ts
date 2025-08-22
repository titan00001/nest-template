import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SessionResponseDto {
	@Expose()
	@ApiProperty({ example: 'device-123', description: 'Device identifier' })
	deviceId?: string;

	@Expose()
	@ApiProperty({ example: 'Mozilla/5.0...', description: 'User agent string' })
	userAgent?: string;

	@Expose()
	@ApiProperty({ example: '192.168.1.1', description: 'IP address' })
	ipAddress?: string;

	@Expose()
	@ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Session creation time' })
	createdAt: Date;

	@Expose()
	@ApiProperty({ example: '2024-01-01T12:00:00.000Z', description: 'Last activity time' })
	lastUsedAt: Date;

	@Expose()
	@ApiProperty({ example: '12 hours ago', description: 'Human readable last activity' })
	get lastActivity(): string {
		const now = new Date();
		const diff = now.getTime() - this.lastUsedAt.getTime();
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

		if (hours > 0) {
			return `${hours} hour${hours > 1 ? 's' : ''} ago`;
		}
		return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
	}
}
