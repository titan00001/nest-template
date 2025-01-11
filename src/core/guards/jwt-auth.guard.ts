import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	getRequest(context: ExecutionContext) {
		const req = context.switchToHttp().getRequest<Request>();
		const res = context.switchToHttp().getResponse();

		// Extract token from query parameter if available
		const tokenFromQuery = req.query.access_token as string;
		if (tokenFromQuery) {
			res.cookie('access_token', tokenFromQuery, {});
		}

		return req;
	}
}
