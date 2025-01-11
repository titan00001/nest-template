import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { BusinessError } from '@/common/business-error';

@Injectable()
export class UserService {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		private readonly jwtService: JwtService,
	) {}

	async getUser(email: string): Promise<User> {
		const user = await this.userModel.findOne({ email }).exec();
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}
	async getUserById(id: string): Promise<User> {
		const user = await this.userModel.findById(new mongoose.Types.ObjectId(id)).exec();
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	async updateUser(email: string, dto: UpdateUserDto): Promise<User> {
		const user = await this.userModel.findOneAndUpdate({ email }, dto, { new: true }).exec();
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	async updatePassword(dto: UpdatePasswordDto): Promise<void> {
		const { email, currentPassword, newPassword } = dto;
		const user = await this.userModel.findOne({ email }).exec();
		if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
			throw new NotFoundException('Invalid credentials');
		}
		user.password = await bcrypt.hash(newPassword, 10);
		await user.save();
	}

	async getUserFromJwt(token: string): Promise<User> {
		try {
			const decoded = this.jwtService.verify(token);
			const user = await this.userModel.findById(decoded.sub); // Adjust based on your user model and schema
			return user;
		} catch (error) {
			throw new BusinessError('INVALID_TOKEN');
		}
	}
}
