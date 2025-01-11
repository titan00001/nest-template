import _ from 'lodash';
import { createMonitor } from '../utils/log.utils';

export const MonitorClass = function (
	options: { logAll?: boolean; logArgs?: boolean } = {
		logAll: true,
		logArgs: true,
	},
) {
	return function (cls) {
		for (const property of Object.getOwnPropertyNames(cls.prototype)) {
			if (_.isFunction(cls.prototype[property])) {
				const originalFunc = cls.prototype[property];
				if (!options?.logAll && !originalFunc.log) continue;

				cls.prototype[property] = function (...args) {
					const monitor = createMonitor(
						this.logger,
						property,
						options?.logArgs || originalFunc.logArgs ? { args } : {},
					);
					monitor.start();
					let resp = originalFunc.apply(this, args);
					// check for returned promise
					if (_.isFunction(resp?.then)) {
						resp = resp.then((result: unknown) => {
							monitor.end();
							return result;
						});
					} else {
						monitor.end();
					}
					return resp;
				};
			}
		}
	};
};
export const MonitorFunction = function (options: { logArgs?: boolean } = { logArgs: true }) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		descriptor.value.log = true;
		descriptor.value.logArgs = options?.logArgs;
	};
};
