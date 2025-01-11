import ErrorCodes from './error-codes.json';
import { HttpException } from '@nestjs/common';

export enum LogLevel {
	error = 'error',
	warn = 'warn',
	info = 'info',
	debug = 'debug',
	off = 'off',
}
export class BusinessError extends HttpException {
	message: string;
	httpStatusCode = 400;
	errorCode: TErrorCode;
	context: { [key: string]: unknown };
	logLevel: LogLevel = LogLevel.warn;
	constructor(
		errorCode: TErrorCode,
		message?: string,
		context?: { [key: string]: unknown },
		httpStatusCode?: number,
		logLevel?: LogLevel,
	) {
		super(
			{
				statusCode: httpStatusCode || ErrorCodes[errorCode].httpStatusCode,
				timestamp: new Date().toISOString(),
				errorCode,
				message,
				context,
			},
			httpStatusCode || ErrorCodes[errorCode].httpStatusCode,
		);
		this.message = message;
		this.name = `${BusinessError.name}: ${errorCode}`;
		this.errorCode = errorCode;
		this.httpStatusCode = httpStatusCode || ErrorCodes[errorCode].httpStatusCode;
		this.context = context;
		this.logLevel = logLevel || (ErrorCodes[errorCode].logLevel as LogLevel);
		Error.captureStackTrace(this, this.constructor);
	}
}

type TErrorCode = keyof typeof ErrorCodes;
