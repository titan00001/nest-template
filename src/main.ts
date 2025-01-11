import { config } from 'dotenv';
config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { setupSwagger } from './swagger';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: ['debug'],
		bufferLogs: false,
		autoFlushLogs: true,
	});
	const globalPrefix = process.env.GLOBAL_PREFIX || 'api/v1';

	app.setGlobalPrefix(globalPrefix);
	const port = process.env.PORT || 3000;

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
		}),
	);

	app.useGlobalInterceptors(new ErrorInterceptor());
	app.enableCors();

	setupSwagger(app);
	await app.listen(port);
	console.log(`🚀 API is running on: http://localhost:${port}/${globalPrefix}`);
}
bootstrap();
