import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
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
