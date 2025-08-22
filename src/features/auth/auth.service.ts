import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { EmailService } from '../mail/email.service';
import { User, UserDocument, RefreshTokenInfo } from '../user/user.schema';
import { JwtService } from '@nestjs/jwt';
import { BusinessError } from '@/common/business-error';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		private mailService: EmailService,
		private jwtService: JwtService,
		private configService: ConfigService,
	) {}

	async signup(dto: SignupDto): Promise<UserDocument> {
		const { email, password, name } = dto;
		const existingUser = await this.userModel.findOne({ email }).exec();
		if (existingUser) {
			throw new BusinessError('CONFLICT', 'User already exists');
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new this.userModel({ email, password: hashedPassword, name });
		return user.save();
	}

	async login(dto: LoginDto, req?: Request): Promise<{ accessToken: string; refreshToken: string }> {
		const { email, password } = dto;
		const user = await this.userModel.findOne({ email });
		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw new BusinessError('VALIDATION_ERROR', 'Incorrect password');
		}

		const tokens = await this.generateTokens(user);
		await this.updateRefreshToken(user._id.toString(), tokens.refreshToken, req);

		return tokens;
	}

	async refreshToken(
		userId: string,
		refreshToken: string,
		req?: Request,
	): Promise<{ accessToken: string; refreshToken: string }> {
		const user = await this.userModel.findById(userId);
		if (!user) {
			throw new BusinessError('UNAUTHORIZED', 'Invalid refresh token');
		}

		const allowMultipleTokens = this.configService.get<boolean>('ALLOW_MULTIPLE_REFRESH_TOKENS');

		if (allowMultipleTokens) {
			// Multiple tokens mode
			if (!user.refreshTokens || user.refreshTokens.length === 0) {
				throw new BusinessError('UNAUTHORIZED', 'Invalid refresh token');
			}

			// Find the matching refresh token
			const tokenInfo = user.refreshTokens.find((tokenInfo) => bcrypt.compareSync(refreshToken, tokenInfo.token));

			if (!tokenInfo) {
				throw new BusinessError('UNAUTHORIZED', 'Invalid refresh token');
			}

			// Update last used timestamp
			tokenInfo.lastUsedAt = new Date();
		} else {
			// Single token mode
			if (!user.refreshToken) {
				throw new BusinessError('UNAUTHORIZED', 'Invalid refresh token');
			}

			const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
			if (!refreshTokenMatches) {
				throw new BusinessError('UNAUTHORIZED', 'Invalid refresh token');
			}
		}

		const tokens = await this.generateTokens(user);
		await this.updateRefreshToken(user._id.toString(), tokens.refreshToken, req);

		return tokens;
	}

	async logout(userId: string, refreshToken?: string): Promise<void> {
		const user = await this.userModel.findById(userId);
		if (!user) {
			return;
		}

		const allowMultipleTokens = this.configService.get<boolean>('ALLOW_MULTIPLE_REFRESH_TOKENS');

		if (allowMultipleTokens && refreshToken) {
			// Remove specific refresh token
			if (user.refreshTokens) {
				user.refreshTokens = user.refreshTokens.filter(
					(tokenInfo) => !bcrypt.compareSync(refreshToken, tokenInfo.token),
				);
				await user.save();
			}
		} else {
			// Clear all refresh tokens
			await this.userModel.findByIdAndUpdate(userId, {
				refreshToken: null,
				refreshTokens: [],
			});
		}
	}

	async logoutAllDevices(userId: string): Promise<void> {
		await this.userModel.findByIdAndUpdate(userId, {
			refreshToken: null,
			refreshTokens: [],
		});
	}

	private async generateTokens(user: UserDocument) {
		const payload = { email: user.email, sub: user._id };

		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(payload, {
				secret: this.configService.get<string>('JWT_SECRET'),
				expiresIn: '15m', // Short lived access token
			}),
			this.jwtService.signAsync(payload, {
				secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
				expiresIn: '7d', // Long lived refresh token
			}),
		]);

		return {
			accessToken,
			refreshToken,
		};
	}

	private async updateRefreshToken(userId: string, refreshToken: string, req?: Request): Promise<void> {
		const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
		const allowMultipleTokens = this.configService.get<boolean>('ALLOW_MULTIPLE_REFRESH_TOKENS');

		if (allowMultipleTokens) {
			// Multiple tokens mode
			const tokenInfo: RefreshTokenInfo = {
				token: hashedRefreshToken,
				deviceId: req?.headers['x-device-id'] as string,
				userAgent: req?.headers['user-agent'] as string,
				ipAddress: req?.ip || req?.connection?.remoteAddress,
				createdAt: new Date(),
				lastUsedAt: new Date(),
			};

			await this.userModel.findByIdAndUpdate(userId, {
				$push: { refreshTokens: tokenInfo },
				$set: { refreshToken: null }, // Clear single token field
			});
		} else {
			// Single token mode
			await this.userModel.findByIdAndUpdate(userId, {
				refreshToken: hashedRefreshToken,
				refreshTokens: [], // Clear multiple tokens array
			});
		}
	}

	async forgotPassword(email: string): Promise<void> {
		const user = await this.userModel.findOne({ email });
		if (!user) {
			throw new BusinessError('NOT_FOUND', 'User not found');
		}
		const token = this.jwtService.sign({ email: user.email }, { expiresIn: '1d' });
		console.log({ token });
		await this.mailService.sendPasswordResetEmail(user.email, token);
	}

	async resetPassword(dto: ResetPasswordDto): Promise<void> {
		const { token, newPassword } = dto;
		const payload: any = this.jwtService.verify(token);
		const user = await this.userModel.findOne({ email: payload.email });
		if (!user) {
			throw new BusinessError('NOT_FOUND', 'User not found');
		}
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		user.password = hashedPassword;
		await user.save();
	}

	async updatePassword(dto: UpdatePasswordDto): Promise<void> {
		const { email, currentPassword, newPassword } = dto;
		const user = await this.userModel.findOne({ email });
		if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
			throw new BusinessError('VALIDATION_ERROR', 'Incorrect password');
		}
		user.password = await bcrypt.hash(newPassword, 10);
		await user.save();
	}
}
