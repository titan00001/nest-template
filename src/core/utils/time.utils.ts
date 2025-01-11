import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with the necessary plugins
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Converts a Unix timestamp to MongoDB-compatible ISO 8601 format with timezone.
 * @param unixTimestamp - The Unix timestamp to convert.
 * @param tz - The timezone (default is 'UTC').
 * @returns The ISO 8601 formatted string with timezone.
 */
export function unixToMongoDBISO(unixTimestamp: number, tz: string = 'UTC'): string {
	return dayjs.unix(unixTimestamp).tz(tz).toISOString();
}

/**
 * Converts a MongoDB ISO 8601 formatted string with timezone to a Unix timestamp.
 * @param isoString - The ISO 8601 string to convert.
 * @returns The Unix timestamp.
 */
export function mongoDBISOToUnix(isoString: string): number {
	return dayjs(isoString).unix();
}
