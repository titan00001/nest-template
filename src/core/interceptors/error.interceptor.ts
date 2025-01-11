import { CallHandler, ExecutionContext, Injectable, NestInterceptor, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Logger } from '@nestjs/common'; // or your custom logger
import { BusinessError, LogLevel } from '@/common/business-error';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
	private readonly logger = new Logger(ErrorInterceptor.name);

	intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
		return next.handle().pipe(
			catchError((error) =>
				throwError(() => {
					let businessError: BusinessError;

					if (error instanceof BusinessError) {
						businessError = error;
					} else if (error instanceof HttpException) {
						const errorResponse = error.getResponse() as Record<string, unknown>;
						businessError = new BusinessError(
							'HTTP_EXCEPTION',
							errorResponse.message as string,
							errorResponse,
							error.getStatus(),
							LogLevel.error,
						);
					} else {
						businessError = new BusinessError(
							'INTERNAL_SERVER_ERROR',
							error.message || 'Internal Server Error',
							error,
							500,
							LogLevel.error,
						);
					}

					const errorResponse = {
						statusCode: businessError.httpStatusCode,
						timestamp: new Date().toISOString(),
						errorCode: businessError.errorCode,
						message: businessError.message,
						context: businessError.context,
					};

					if (businessError.logLevel !== LogLevel.off) {
						this.logger[businessError.logLevel]({
							stack: businessError.stack,
							...errorResponse,
						});
					}

					return new HttpException(errorResponse, businessError.httpStatusCode);
				}),
			),
		);
	}
}
