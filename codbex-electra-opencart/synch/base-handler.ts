import { getLogger } from "../../codbex-electra/util/LoggerUtil";

export class BaseHandler {
    protected readonly logger;

    constructor(fileURL: string) {
        this.logger = getLogger(fileURL);
    }
    protected throwError(errorMessage: string) {
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
    }

    protected getEmptyStringIfMissing(value: string | null | undefined) {
        return value ? value : "";
    }

    protected getZeroIfMissing(value: number | null | undefined) {
        return value ? value : 0;
    }
}
