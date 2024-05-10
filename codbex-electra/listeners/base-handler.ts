import { getLogger } from "codbex-electra/util/LoggerUtil";

export class BaseHandler {
    protected readonly logger;

    constructor(fileURL: string) {
        this.logger = getLogger(fileURL);
    }
    protected throwError(errorMessage: string) {
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
    }

}
