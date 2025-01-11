import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { EmailService } from '../mail/email.service';
import { User, UserDocument } from '../user/user.schema';
import { JwtService } from '@nestjs/jwt';
import { BusinessError } from '@/common/business-error';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		private mailService: EmailService,
		private jwtService: JwtService,
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

	async login(dto: LoginDto): Promise<{ accessToken: string }> {
		const { email, password } = dto;
		const user = await this.userModel.findOne({ email });
		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw new BusinessError('VALIDATION_ERROR', 'Incorrect password');
		}
		const payload = { email: user.email, sub: user._id };
		const accessToken = this.jwtService.sign(payload);
		return { accessToken };
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
