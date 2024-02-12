import { LanguageRepository } from "../../../../codbex-electra/gen/dao/Settings/LanguageRepository";
import { getLogger } from "../../../../codbex-electra/util/LoggerUtil";

const logger = getLogger(import.meta.url);

export function onMessage(message: any) {
    const store = message.getBody();

    const querySettings = {
        $filter: {
            equals: {
                Status: 1
            }
        }
    };
    const languageDAO = new LanguageRepository();
    const languages = languageDAO.findAll(querySettings);
    logger.info("Found [{}] ENABLED languages which must be replicated to store [{}]", languages.length, store.name);

    const languageEntries: any[] = [];
    languages.forEach((language) => {
        const languageEntry = {
            language: language,
            store: store
        }
        languageEntries.push(languageEntry);
    });

    message.setBody(languageEntries);
    return message;
}
