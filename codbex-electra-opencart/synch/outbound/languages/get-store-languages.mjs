import * as languagesDAO from "/codbex-electra/gen/dao/Settings/Language";
import { getLogger } from "/codbex-electra/util/logger-util.mjs";

const logger = getLogger(import.meta.url);

export function onMessage(message) {
    const store = message.getBody();

    const languages = languagesDAO.list();
    logger.info("Found [{}] languages which must be replicated to store [{}]", languagesDAO.length, store.name);

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
