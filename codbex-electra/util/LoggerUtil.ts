import { logging } from "sdk/log";

export function getLogger(fileURL: string) {
	const loggerName = fileURL.slice(fileURL.indexOf('/public/') + 8).replaceAll('/', '.');
	return logging.getLogger(loggerName);
} 