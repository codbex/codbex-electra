import { EntityReferenceDAO } from "../../../../codbex-electra/dao/EntityReferenceDAO";
import { oc_languageRepository as OpenCartLanguageDAO, oc_languageCreateEntity, oc_languageUpdateEntity } from "../../../dao/oc_languageRepository";
import { LanguageEntity } from "../../../../codbex-electra/gen/dao/Settings/LanguageRepository";
import { EntityReferenceEntity } from "../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";

export function onMessage(message: any) {
    const entityReferenceDAO = new EntityReferenceDAO();

    const languageEntry = message.getBody();

    const language: LanguageEntity = languageEntry.language;
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

function createOpenCartLanguage(language: LanguageEntity, languageReference: EntityReferenceEntity | null): oc_languageCreateEntity | oc_languageUpdateEntity {
    const image = "gb.png";
    const directory = "english";
    const sortOrder = 1;
    const status = language.Status === 1 ? true : false;

    if (languageReference) {
        return {
            language_id: languageReference.ReferenceIntegerId,
            "name": language.Name,
            "code": language.Code,
            "locale": language.Locale,
            "image": image,
            "directory": directory,
            "sort_order": sortOrder,
            "status": status
        };
    } else {
        return {
            "name": language.Name,
            "code": language.Code,
            "locale": language.Locale,
            "image": image,
            "directory": directory,
            "sort_order": sortOrder,
            "status": status
        };
    }
}
