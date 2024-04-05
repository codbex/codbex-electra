import { StockStatusRepository as StockStatusDAO, StockStatusEntityOptions } from "codbex-electra/gen/dao/Settings/StockStatusRepository";
import { BaseHandler } from "codbex-electra-opencart/synch/base-handler";
import { OpenCartStoreConfig } from "codbex-electra-opencart/dao/StoreConfigDAO";

export function onMessage(message: any) {
    const store: OpenCartStoreConfig = message.getBody();

    const handler = new GetStockStatusesHandler(store);
    const stockStatusEntries = handler.handle();

    message.setBody(stockStatusEntries);
    return message;
}

export interface StockStatusEntry {
    readonly stockStatusId: number;
    readonly store: OpenCartStoreConfig;
}

class GetStockStatusesHandler extends BaseHandler {
    private readonly store;
    private readonly stockStatusDAO;

    constructor(store: OpenCartStoreConfig) {
        super(import.meta.url);
        this.store = store;
        this.stockStatusDAO = new StockStatusDAO();
    }

    handle() {
        const querySettings: StockStatusEntityOptions = {
            $select: ["Id"]
        };
        const stockStatuses = this.stockStatusDAO.findAll(querySettings);
        this.logger.info("Found [{}] stock statuses which must be replicated to store [{}]", stockStatuses.length, this.store.name);

        const entries: StockStatusEntry[] = [];
        stockStatuses.forEach((stockStatus) => {
            const entry = {
                stockStatusId: stockStatus.Id,
                store: this.store
            }
            entries.push(entry);
        });
        return entries;
    }
}