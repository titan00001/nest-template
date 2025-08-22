import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface RefreshTokenInfo {
	token: string;
	deviceId?: string;
	userAgent?: string;
	ipAddress?: string;
	createdAt: Date;
	lastUsedAt: Date;
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
	@Prop({ required: true, unique: true })
	email: string;

	@Prop({ required: true })
	name: string;

	@Prop({ required: true })
	password: string;

	@Prop()
	refreshToken?: string;

	@Prop({ type: [Object] })
	refreshTokens?: RefreshTokenInfo[];
}

export const UserSchema = SchemaFactory.createForClass(User);
