import { LanguageRepository as LanguageDAO, LanguageEntityOptions } from "../../../../codbex-electra/gen/dao/Settings/LanguageRepository";
import { StoreEntry } from "../../get-all-relevant-stores";
import { BaseHandler } from "../../base-handler";

export function onMessage(message: any) {
    const store: StoreEntry = message.getBody();

    const handler = new GetLanguagesHandler(store);
    const languageEntries = handler.handle();

    message.setBody(languageEntries);
    return message;
}

export interface LanguageEntry {
    readonly languageId: number;
    readonly store: StoreEntry;
}

class GetLanguagesHandler extends BaseHandler {
    private readonly store;
    private readonly languageDAO;

    constructor(store: StoreEntry) {
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