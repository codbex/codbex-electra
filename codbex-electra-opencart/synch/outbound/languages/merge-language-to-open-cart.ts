import { EntityReferenceDAO } from "../../../../codbex-electra/dao/EntityReferenceDAO";
import { oc_languageRepository as OpenCartLanguageDAO, oc_languageCreateEntity, oc_languageUpdateEntity } from "../../../dao/oc_languageRepository";
import { EntityReferenceEntity } from "../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";
import { BaseHandler } from "../base-handler";
import { LanguageEntry } from "./get-all-enabled-languages";

export function onMessage(message: any) {
    const languageEntry: LanguageEntry = message.getBody();

    const handler = new MergeLanguageToOpenCart(languageEntry);
    handler.handle();

    return message;
}

class MergeLanguageToOpenCart extends BaseHandler {
    private readonly languageEntry;
    private readonly entityReferenceDAO;
    private readonly ocLanguageDAO;

    constructor(languageEntry: LanguageEntry) {
        super(import.meta.url);
        this.languageEntry = languageEntry;
        this.entityReferenceDAO = new EntityReferenceDAO();
        this.ocLanguageDAO = new OpenCartLanguageDAO(languageEntry.store.dataSourceName);
    }

    handle() {
        const language = this.languageEntry.language;
        const storeId: number = this.languageEntry.store.id;

        const languageReference = this.entityReferenceDAO.getStoreLanguageReference(storeId, language.Id);

        const ocLanguage = this.createOpenCartLanguage(languageReference);
        const ocLanguageId = this.ocLanguageDAO.upsert(ocLanguage);

        if (!languageReference) {
            this.entityReferenceDAO.createLanguageReference(storeId, language.Id, ocLanguageId);
        }
    }


    private createOpenCartLanguage(languageReference: EntityReferenceEntity | null): oc_languageCreateEntity | oc_languageUpdateEntity {
        const language = this.languageEntry.language;

        const image = "gb.png";
        const directory = "english";
        const sortOrder = 1;
        const status = language.Status === 1;

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
}
