import { getLogger } from "/codbex-electra/util/logger-util.mjs";
import { OpenCartLanguageDAO } from "/codbex-electra-opencart/dao/OpenCartLanguageDAO.mjs";
import * as productDAO from "/codbex-electra/gen/dao/Products/Product";
import * as entityReferenceDAO from "/codbex-electra/dao/entity-reference-dao.mjs";

const logger = getLogger(import.meta.url);

export function onMessage(message) {
    const languageEntry = message.getBody();

    const language = languageEntry.language;
    const store = languageEntry.store;
    const languageReference = entityReferenceDAO.getStoreLanguageReference(store.id, language.Id);

    const ocLanguageDAO = new OpenCartLanguageDAO(store.dataSourceName);

    const ocLanguage = createOpenCartLanguage(language, languageReference);
    const ocLanguageId = ocLanguageDAO.upsert(ocLanguage);

    if (!languageReference) {
        entityReferenceDAO.createLanguageReference(store.id, language.Id, ocLanguageId);
    }

    return message;
}

function createOpenCartLanguage(language, languageReference) {
    const languageId = languageReference ? languageReference.ReferenceIntegerId : null;
    const image = "gb.png";
    const directory = "english";
    const sortOrder = 1;

    return {
        "languageId": languageId,
        "name": language.Name,
        "code": language.Code,
        "locale": language.Locale,
        "image": image,
        "directory": directory,
        "sortOrder": sortOrder,
        "status": language.Status
    };
}

function throwError(errorMessage) {
    logger.error(errorMessage);
    throw new Error(errorMessage);
}