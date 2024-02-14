import { LanguageRepository, LanguageEntity } from "../../../../codbex-electra/gen/dao/Settings/LanguageRepository";
import { StoreEntry } from "../get-all-relevant-stores";
import { BaseHandler } from "../base-handler";

export function onMessage(message: any) {
    const store: StoreEntry = message.getBody();

    const handler = new GetStoreProductsHandler(store);
    const languageEntries = handler.handle();

    message.setBody(languageEntries);
    return message;
}

export interface LanguageEntry {
    readonly language: LanguageEntity;
    readonly store: StoreEntry;
}

class GetStoreProductsHandler extends BaseHandler {
    private readonly store;
    private readonly languageDAO;

    constructor(store: StoreEntry) {
        super(import.meta.url);
        this.store = store;
        this.languageDAO = new LanguageRepository();
    }

    handle() {
        const querySettings = {
            $filter: {
                equals: {
                    Status: 1
                }
            }
        };
        const languages = this.languageDAO.findAll(querySettings);
        this.logger.info("Found [{}] ENABLED languages which must be replicated to store [{}]", languages.length, this.store.name);

        const languageEntries: LanguageEntry[] = [];
        languages.forEach((language) => {
            const languageEntry = {
                language: language,
                store: this.store
            }
            languageEntries.push(languageEntry);
        });
        return languageEntries;
    }
}