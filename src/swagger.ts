import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { config } from 'dotenv';
config();

export const setupSwagger = (app: INestApplication) => {
	if (process.env.SWAGGER !== 'true') return;

	const config = new DocumentBuilder()
		.setTitle('KASI')
		.setDescription('Kasi Api docs')
		.setVersion('1.0')
		.addServer(`${process.env.API_URL}`)
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('docs', app, document, {
		swaggerOptions: {
			persistAuthorization: true,
		},
	});

	app.use('/swagger.json', (_req: Request, res: Response) => {
		res.setHeader('Content-Type', 'application/json');
		res.send(document);
	});

	const port = process.env.PORT;
	console.log(`🚀 Swagger json is on: http://localhost:${port}/swagger.json`);

	console.log(`🚀 Swagger is running on: http://localhost:${port}/docs`);
};
