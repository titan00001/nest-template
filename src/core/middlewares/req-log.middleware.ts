import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { createNamespace } from 'cls-hooked';

import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

@Injectable()
export class ReqLogMiddleware implements NestMiddleware {
	private readonly logger = new Logger(ReqLogMiddleware.name);

	use(req: Request, res: Response, next: NextFunction): void {
		const { ip, method, path, body, query, params, headers, originalUrl } = req;
		const userAgent = req.get('user-agent') || '';

		let id = req.get('X-Request-Id');
		if (!id) {
			id = randomUUID();
			res.header('X-Request-Id', id);
		}
		const request = {
			id,
			ip,
			method,
			path,
			userAgent,
			body,
			query,
			params,
			headers,
			originalUrl,
		};

		this.logger.debug({ request, reqId: id }, 'request made');

		RequestNamespace.run(() => {
			RequestNamespace.set('REQUEST_ID', id);
			next();
		});
	}
}

export const RequestNamespace = createNamespace('REQUEST_NAMESPACE');
