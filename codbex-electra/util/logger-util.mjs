import { logging } from "@dirigible/log";

export function getLogger(fileURL) {
	const loggerName = fileURL.slice(fileURL.indexOf('/public/') + 8).replaceAll('/', '.');
	return logging.getLogger(loggerName);
}; 