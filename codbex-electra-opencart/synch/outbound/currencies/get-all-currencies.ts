import { CurrencyRepository as CurrencyDAO, CurrencyEntityOptions } from "../../../../codbex-electra/gen/dao/Settings/CurrencyRepository";
import { StoreEntry } from "../get-all-relevant-stores";
import { BaseHandler } from "../base-handler";

export function onMessage(message: any) {
    const store: StoreEntry = message.getBody();

    const handler = new GetStoreCurrenciesHandler(store);
    const currencyEntries = handler.handle();

    message.setBody(currencyEntries);
    return message;
}

export interface CurrencyEntry {
    readonly currencyId: number;
    readonly store: StoreEntry;
}

class GetStoreCurrenciesHandler extends BaseHandler {
    private readonly store;
    private readonly currencyDAO;

    constructor(store: StoreEntry) {
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