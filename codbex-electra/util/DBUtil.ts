import { getLogger } from "./LoggerUtil";

const logger = getLogger(import.meta.url);

export function closeResources(resources: any[]) {
	resources.forEach(r => {
		if (r) {
			if (typeof r.close === 'function') {
				r.close();
			} else {
				logger.warn("[{}] doesn't have close and will NOT be closed] function", r);
			}
		}
	});
}
