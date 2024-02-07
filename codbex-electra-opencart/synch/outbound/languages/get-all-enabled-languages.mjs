import * as languageDAO from "/codbex-electra/gen/dao/Settings/Language";
import { getLogger } from "/codbex-electra/util/logger-util.mjs";

const logger = getLogger(import.meta.url);

export function onMessage(message) {
    const store = message.getBody();

    const querySettings = {
        Status: 1
    };
    const languages = languageDAO.list(querySettings);
    logger.info("Found [{}] ENABLED languages which must be replicated to store [{}]", languages.length, store.name);

    const languageEntries = [];
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
