import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

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
	async login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
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
