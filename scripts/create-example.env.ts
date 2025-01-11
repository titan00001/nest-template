import { ConfigurationSchema } from '../src/configuration';
import { promises as fs } from 'fs';

const environment = ConfigurationSchema.describe().keys;

let exampleEnv = '';
for (const key in environment) {
	const keyDefault = environment[key].flags?.default || '';
	const required = environment[key].flags?.presence || '';
	const description = environment[key].flags?.description || '';
	const keyType = environment[key].type;
	exampleEnv += `# ${keyType} ${required} ${description ? `[${description}]` : ''}\n`;
	exampleEnv += `${key}=${keyDefault}\n\n`;
}

fs.writeFile('example.env', exampleEnv, 'utf8');
