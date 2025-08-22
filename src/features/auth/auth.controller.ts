import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { JwtRefreshGuard } from '@/core/guards/jwt-refresh.guard';
import { JwtAuthGuard } from '@/core/guards/jwt-auth.guard';
import { AuthResponseDto } from './dto/auth-response.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('signup')
	@ApiOperation({ summary: 'Signup by email and password' })
	async signup(@Body() signupDto: SignupDto) {
		return this.authService.signup(signupDto);
	}

	@Post('login')
	@ApiOperation({ summary: 'login by email and password' })
	async login(@Body() loginDto: LoginDto, @Req() req): Promise<AuthResponseDto> {
		return this.authService.login(loginDto, req);
	}

	@UseGuards(JwtRefreshGuard)
	@Post('refresh')
	@ApiOperation({ summary: 'Refresh access token using refresh token' })
	async refresh(@Req() req, @Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
		const userId = req.user._id.toString();
		return this.authService.refreshToken(userId, refreshTokenDto.refreshToken, req);
	}

	@UseGuards(JwtAuthGuard)
	@Post('logout')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Logout user and invalidate refresh token' })
	@HttpCode(HttpStatus.NO_CONTENT)
	async logout(@Req() req, @Body() refreshTokenDto?: RefreshTokenDto) {
		const userId = req.user._id.toString();
		await this.authService.logout(userId, refreshTokenDto?.refreshToken);
	}

	@UseGuards(JwtAuthGuard)
	@Post('logout-all')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Logout user from all devices' })
	@HttpCode(HttpStatus.NO_CONTENT)
	async logoutAllDevices(@Req() req) {
		const userId = req.user._id.toString();
		await this.authService.logoutAllDevices(userId);
	}

	@Post('forgot-password')
	@ApiOperation({ summary: 'send email to send reset password token' })
	@HttpCode(HttpStatus.NO_CONTENT)
	async forgotPassword(@Body() payload: ForgotPasswordDto) {
		return this.authService.forgotPassword(payload.email);
	}

	@Post('reset-password')
	@ApiOperation({ summary: 'reset password' })
	@HttpCode(HttpStatus.NO_CONTENT)
	async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
		await this.authService.resetPassword(resetPasswordDto);
	}

	@Post('update-password')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'update password' })
	@HttpCode(HttpStatus.NO_CONTENT)
	async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
		await this.authService.updatePassword(updatePasswordDto);
	}
}
