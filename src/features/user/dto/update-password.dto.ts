import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
	@ApiProperty({ example: 'user@example.com' })
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({ example: 'currentpassword123' })
	@IsString()
	@MinLength(6)
	@IsNotEmpty()
	currentPassword: string;

	@ApiProperty({ example: 'newpassword123' })
	@IsString()
	@MinLength(6)
	@IsNotEmpty()
	newPassword: string;
}
