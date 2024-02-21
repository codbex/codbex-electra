import { CountryRepository as CountryDAO, CountryEntityOptions } from "../../../../codbex-electra/gen/dao/Settings/CountryRepository";
import { OpenCartStoreConfig } from "../../../dao/StoreConfigDAO";
import { BaseHandler } from "../../base-handler";

export function onMessage(message: any) {
    const store: OpenCartStoreConfig = message.getBody();

    const handler = new GetStoreCountriesHandler(store);
    const currencyEntries = handler.handle();

    message.setBody(currencyEntries);
    return message;
}

export interface CountryEntry {
    readonly countryId: number;
    readonly store: OpenCartStoreConfig;
}

class GetStoreCountriesHandler extends BaseHandler {
    private readonly store;
    private readonly countryDAO;

    constructor(store: OpenCartStoreConfig) {
        super(import.meta.url);
        this.store = store;
        this.countryDAO = new CountryDAO();
    }

    handle() {
        const querySettings: CountryEntityOptions = {
            $select: ["Id"]
        };
        const countries = this.countryDAO.findAll(querySettings);
        this.logger.info("Found [{}] countries which must be replicated to store [{}]", countries.length, this.store.name);

        const entries: CountryEntry[] = [];
        countries.forEach((country) => {
            const entry = {
                countryId: country.Id,
                store: this.store
            }
            entries.push(entry);
        });
        return entries;
    }
}