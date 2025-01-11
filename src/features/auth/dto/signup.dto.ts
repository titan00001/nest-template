import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupDto {
	@ApiProperty({ example: 'user@example.com' })
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({ example: 'John Doe' })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({ example: 'password123' })
	@IsString()
	@MinLength(6)
	@IsNotEmpty()
	password: string;
}
