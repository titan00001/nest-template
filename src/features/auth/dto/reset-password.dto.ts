import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
	@ApiProperty({ example: 'reset-token' })
	@IsString()
	@IsNotEmpty()
	token: string;

	@ApiProperty({ example: 'newpassword123' })
	@IsString()
	@IsNotEmpty()
	newPassword: string;
}
