import { plainToInstance } from 'class-transformer';
import { UserDocument } from '../user.schema';
import { UserResponseDto } from '../dto/user-response.dto';
import { SessionResponseDto } from '../dto/session-response.dto';
import { SessionsResponseDto } from '../dto/sessions-response.dto';

export class UserMapper {
	static toResponseDto(user: UserDocument): UserResponseDto {
		const userObj = user.toObject ? user.toObject() : user;

		return plainToInstance(
			UserResponseDto,
			{
				id: userObj._id?.toString(),
				email: userObj.email,
				name: userObj.name,
				createdAt: userObj.createdAt,
				updatedAt: userObj.updatedAt,
				activeSessions: userObj.refreshTokens?.length || 0,
			},
			{ excludeExtraneousValues: true },
		);
	}

	static toSessionsResponseDto(user: UserDocument, multipleTokensEnabled: boolean): SessionsResponseDto {
		const userObj = user.toObject ? user.toObject() : user;

		const sessions =
			userObj.refreshTokens?.map((token) =>
				plainToInstance(
					SessionResponseDto,
					{
						deviceId: token.deviceId,
						userAgent: token.userAgent,
						ipAddress: token.ipAddress,
						createdAt: token.createdAt,
						lastUsedAt: token.lastUsedAt,
					},
					{ excludeExtraneousValues: true },
				),
			) || [];

		return plainToInstance(
			SessionsResponseDto,
			{
				activeSessions: sessions.length,
				sessions,
				multipleTokensEnabled,
			},
			{ excludeExtraneousValues: true },
		);
	}

	static toResponseDtoList(users: UserDocument[]): UserResponseDto[] {
		return users.map((user) => this.toResponseDto(user));
	}
}
