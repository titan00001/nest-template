import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { ParseJwtToUserPipe } from '../pipes/parse-jwt-to-user.pipe';

export const jwtFromRequest = (req: Request) => {
	return req?.query?.access_token || ExtractJwt.fromAuthHeaderAsBearerToken()(req) || req?.cookies?.access_token;
};

const GetJwtPayload = createParamDecorator((data: unknown, ctx: ExecutionContext): { sub: string } | null => {
	const req = ctx.switchToHttp().getRequest();
	if (req.user) return req.user;
	return jwtFromRequest(req);
});

export const CurrentUser = (options?: any) => {
	const result = GetJwtPayload(options, ParseJwtToUserPipe);
	return result;
};
