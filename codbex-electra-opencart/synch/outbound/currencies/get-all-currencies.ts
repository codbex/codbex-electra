import { CurrencyRepository as CurrencyDAO, CurrencyEntityOptions } from "codbex-electra/gen/dao/Settings/CurrencyRepository";
import { OpenCartStoreConfig } from "codbex-electra-opencart/dao/StoreConfigDAO";
import { BaseHandler } from "codbex-electra-opencart/synch/base-handler";

export function onMessage(message: any) {
    const store: OpenCartStoreConfig = message.getBody();

    const handler = new GetStoreCurrenciesHandler(store);
    const currencyEntries = handler.handle();

    message.setBody(currencyEntries);
    return message;
}

export interface CurrencyEntry {
    readonly currencyId: number;
    readonly store: OpenCartStoreConfig;
}

class GetStoreCurrenciesHandler extends BaseHandler {
    private readonly store;
    private readonly currencyDAO;

    constructor(store: OpenCartStoreConfig) {
        super(import.meta.url);
        this.store = store;
        this.currencyDAO = new CurrencyDAO();
    }

    handle() {
        const querySettings: CurrencyEntityOptions = {
            $select: ["Id"]
        };
        const currencies = this.currencyDAO.findAll(querySettings);
        this.logger.info("Found [{}] currencies which must be replicated to store [{}]", currencies.length, this.store.name);

        const entries: CurrencyEntry[] = [];
        currencies.forEach((currency) => {
            const entry = {
                currencyId: currency.Id,
                store: this.store
            }
            entries.push(entry);
        });
        return entries;
    }
}