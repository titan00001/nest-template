import { Types } from 'mongoose';

/**
 * Checks if a given string is a valid MongoDB ObjectId.
 *
 * @param id The string to check.
 * @returns True if the string is a valid ObjectId, otherwise false.
 */
function isMongoId(id: string): boolean {
	return Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id;
}

export default isMongoId;
