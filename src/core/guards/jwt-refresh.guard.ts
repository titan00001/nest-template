import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh-token') {
	getRequest(context: ExecutionContext) {
		const req = context.switchToHttp().getRequest();
		const res = context.switchToHttp().getResponse();
		if (req?.query?.refresh_token) {
			res.cookie('refresh_token', req.query.refresh_token, {});
		}
		return req;
	}
}
