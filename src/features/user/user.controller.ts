import { Controller, Get, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from '@/core/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('user')
@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService,
	) {}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get user profile' })
	@Get('profile')
	async getProfile(@Req() req) {
		const user = await this.userService.getUserById(req.user._id.toString());
		return user;
	}

	@UseGuards(JwtAuthGuard)
	@Get('sessions')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get active sessions (only when multiple refresh tokens enabled)' })
	async getActiveSessions(@Req() req) {
		const allowMultipleTokens = this.configService.get<boolean>('ALLOW_MULTIPLE_REFRESH_TOKENS');

		if (!allowMultipleTokens) {
			return { message: 'Multiple refresh tokens not enabled' };
		}

		const user = await this.userService.getUserById(req.user._id.toString());
		return {
			activeSessions: user.refreshTokens?.length || 0,
			sessions:
				user.refreshTokens?.map((token) => ({
					deviceId: token.deviceId,
					userAgent: token.userAgent,
					ipAddress: token.ipAddress,
					createdAt: token.createdAt,
					lastUsedAt: token.lastUsedAt,
				})) || [],
		};
	}

	@UseGuards(JwtAuthGuard)
	@Get(':id')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get user by ID' })
	async getUser(@Param('id') id: string) {
		return this.userService.getUserById(id);
	}

	@UseGuards(JwtAuthGuard)
	@Put(':id')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update user information' })
	@ApiBody({ type: UpdateUserDto })
	async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.userService.updateUserById(id, updateUserDto);
	}

	@UseGuards(JwtAuthGuard)
	@Put(':id/password')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update user password' })
	@ApiBody({ type: UpdatePasswordDto })
	async updatePassword(@Param('id') id: string, @Body() updatePasswordDto: UpdatePasswordDto) {
		return this.userService.updatePassword(id, updatePasswordDto);
	}
}
