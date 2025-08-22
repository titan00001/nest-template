import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { BusinessError } from '@/common/business-error';
import { UserMapper } from './mappers/user.mapper';
import { UserResponseDto } from './dto/user-response.dto';
import { SessionsResponseDto } from './dto/sessions-response.dto';

@Injectable()
export class UserService {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		private readonly jwtService: JwtService,
	) {}

	async getUser(email: string): Promise<UserResponseDto> {
		const user = await this.userModel.findOne({ email }).exec();
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return UserMapper.toResponseDto(user);
	}

	async getUserById(id: string): Promise<UserResponseDto> {
		const user = await this.userModel.findById(new mongoose.Types.ObjectId(id)).exec();
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return UserMapper.toResponseDto(user);
	}

	async getUserEntityById(id: string): Promise<UserDocument> {
		const user = await this.userModel.findById(new mongoose.Types.ObjectId(id)).exec();
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	async updateUser(email: string, dto: UpdateUserDto): Promise<UserResponseDto> {
		const user = await this.userModel.findOneAndUpdate({ email }, dto, { new: true }).exec();
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return UserMapper.toResponseDto(user);
	}

	async updateUserById(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
		const user = await this.userModel.findByIdAndUpdate(new mongoose.Types.ObjectId(id), dto, { new: true }).exec();
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return UserMapper.toResponseDto(user);
	}

	async updatePassword(id: string, dto: UpdatePasswordDto): Promise<void> {
		const { currentPassword, newPassword } = dto;
		const user = await this.userModel.findById(new mongoose.Types.ObjectId(id)).exec();
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

	async getSessionsResponse(userId: string, multipleTokensEnabled: boolean): Promise<SessionsResponseDto> {
		const user = await this.userModel.findById(new mongoose.Types.ObjectId(userId)).exec();
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return UserMapper.toSessionsResponseDto(user, multipleTokensEnabled);
	}
}
