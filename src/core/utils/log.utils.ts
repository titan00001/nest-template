import { Logger } from '@nestjs/common';
import { RequestNamespace } from '../middlewares/req-log.middleware';

export const createMonitor = (logger: Logger, serviceName: string, options: unknown = {}) => {
	const reqId = RequestNamespace.get('REQUEST_ID');
	let start: () => void;

	if (!logger) {
		start = () => console.log(`Logger for Service ${serviceName} not found`);
		const end = () => console.log(`Logger for Service ${serviceName} not found`);
		return { start, end };
	}

	if (typeof options === 'object') {
		start = () => logger.debug({ ...options, reqId }, `START:${serviceName}`);
	} else {
		start = () => logger.debug({ options, reqId }, `START:${serviceName}`);
	}
	const end = () => logger.debug({ reqId }, `END:${serviceName}`);

	return { start, end };
};
