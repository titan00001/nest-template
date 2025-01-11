import { RequestNamespace } from '@/core/middlewares/req-log.middleware';
import { Logger } from '@nestjs/common';

export class AppLogger extends Logger {
	getRequestId() {
		const reqId = RequestNamespace.get('REQUEST_ID');
		return reqId;
	}

	customLog(
		level: 'log' | 'debug' | 'info' | 'warn' | 'error' | 'verbose',
		message: unknown,
		stack?: string,
		context?: string,
	) {
		const reqId = this.getRequestId();
		if (typeof message === 'string') {
			return super[level]({ reqId }, message, stack, context);
		}
		if (typeof message === 'object') {
			return super[level]({ reqId, ...message }, stack, context);
		}
		return super[level](message, stack, context);
	}

	debug(message: unknown, stack?: string, context?: string) {
		return this.customLog('debug', message, stack, context);
	}

	log(message: unknown, stack?: string, context?: string) {
		return this.customLog('log', message, stack, context);
	}

	info(message: unknown, stack?: string, context?: string) {
		return this.customLog('info', message, stack, context);
	}

	warn(message: unknown, stack?: string, context?: string) {
		return this.customLog('warn', message, stack, context);
	}

	error(message: unknown, stack?: string, context?: string) {
		console.error(message, stack, context);
		return this.customLog('error', message, stack, context);
	}

	verbose(message: unknown, stack?: string, context?: string) {
		return this.customLog('verbose', message, stack, context);
	}
}
