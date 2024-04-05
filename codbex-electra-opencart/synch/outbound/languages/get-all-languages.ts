import { LanguageRepository as LanguageDAO, LanguageEntityOptions } from "codbex-electra/gen/dao/Settings/LanguageRepository";
import { OpenCartStoreConfig } from "codbex-electra-opencart/dao/StoreConfigDAO";
import { BaseHandler } from "codbex-electra-opencart/synch/base-handler";

export function onMessage(message: any) {
    const store: OpenCartStoreConfig = message.getBody();

    const handler = new GetLanguagesHandler(store);
    const languageEntries = handler.handle();

    message.setBody(languageEntries);
    return message;
}

export interface LanguageEntry {
    readonly languageId: number;
    readonly store: OpenCartStoreConfig;
}

class GetLanguagesHandler extends BaseHandler {
    private readonly store;
    private readonly languageDAO;

    constructor(store: OpenCartStoreConfig) {
        super(import.meta.url);
        this.store = store;
        this.languageDAO = new LanguageDAO();
    }

    handle() {
        const querySettings: LanguageEntityOptions = {
            $select: ["Id"]
        };
        const languages = this.languageDAO.findAll(querySettings);
        this.logger.info("Found [{}] languages which must be replicated to store [{}]", languages.length, this.store.name);

        const languageEntries: LanguageEntry[] = [];
        languages.forEach((language) => {
            const languageEntry = {
                languageId: language.Id,
                store: this.store
            }
            languageEntries.push(languageEntry);
        });
        return languageEntries;
    }
}