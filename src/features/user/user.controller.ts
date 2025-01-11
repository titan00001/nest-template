import { Controller, Get, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from '@/core/guards/jwt-auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update user password' })
	@Get('profile')
	async getProfile(@Req() req) {
		const user = await this.userService.getUserById(req.user._id.toString());
		return user;
	}

	@UseGuards(JwtAuthGuard)
	@Get(':email')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get user by email' })
	async getUser(@Param('email') email: string) {
		return this.userService.getUser(email);
	}

	@UseGuards(JwtAuthGuard)
	@Put(':email')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update user information' })
	@ApiBody({ type: UpdateUserDto })
	async updateUser(@Param('email') email: string, @Body() updateUserDto: UpdateUserDto) {
		return this.userService.updateUser(email, updateUserDto);
	}

	@UseGuards(JwtAuthGuard)
	@Put(':email/password')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update user password' })
	@ApiBody({ type: UpdatePasswordDto })
	async updatePassword(@Param('email') email: string, @Body() updatePasswordDto: UpdatePasswordDto) {
		return this.userService.updatePassword(updatePasswordDto);
	}
}
