import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { UserDocument } from '@/features/user/user.schema';
import { UserService } from '@/features/user/user.service';
import { IJwtPayload } from '../interfaces/jwt-user.payload';

@Injectable()
export class ParseJwtToUserPipe implements PipeTransform {
	constructor(private readonly userService: UserService) {}

	async transform(value: IJwtPayload, metadata: ArgumentMetadata): Promise<UserDocument | null> {
		if (!value) return null;
		if (!value.sub) return null;
		const user = await this.userService.getUserById(value.sub);
		if (!user) return null;
		const field = metadata.data;
		delete user?.password;
		return field ? user[field] : user;
	}
}
