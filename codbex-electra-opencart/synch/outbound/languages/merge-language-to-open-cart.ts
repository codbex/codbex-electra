import { EntityReferenceDAO } from "codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "codbex-electra/gen/dao/entity-references/EntityReferenceRepository";
import { oc_languageRepository as OpenCartLanguageDAO, oc_languageCreateEntity, oc_languageUpdateEntity } from "codbex-electra-opencart/dao/oc_languageRepository";
import { LanguageRepository as LanguageDAO } from "codbex-electra/gen/dao/languages/LanguageRepository";
import { BaseHandler } from "codbex-electra-opencart/synch/base-handler";
import { LanguageEntry } from "./get-all-languages";

export function onMessage(message: any) {
    const languageEntry: LanguageEntry = message.getBody();

    const handler = new MergeLanguageToOpenCart(languageEntry);
    handler.handle();

    return message;
}

class MergeLanguageToOpenCart extends BaseHandler {
    private readonly languageEntry;
    private readonly entityReferenceDAO;
    private readonly languageDAO;
    private readonly ocLanguageDAO;

    constructor(languageEntry: LanguageEntry) {
        super(import.meta.url);
        this.languageEntry = languageEntry;
        this.entityReferenceDAO = new EntityReferenceDAO();
        this.languageDAO = new LanguageDAO();
        this.ocLanguageDAO = new OpenCartLanguageDAO(languageEntry.store.dataSourceName);
    }

    handle() {
        const languageId = this.languageEntry.languageId;
        const storeId = this.languageEntry.store.id;

        const languageReference = this.entityReferenceDAO.getLanguageReferenceByEntityId(storeId, languageId);

        const ocLanguage = this.createOpenCartLanguage(languageReference);
        const ocLanguageId = this.ocLanguageDAO.upsert(ocLanguage);

        if (!languageReference) {
            this.entityReferenceDAO.createLanguageReference(storeId, languageId, ocLanguageId);
        }
    }

    private createOpenCartLanguage(languageReference: EntityReferenceEntity | null): oc_languageCreateEntity | oc_languageUpdateEntity {
        const languageId = this.languageEntry.languageId;
        const language = this.languageDAO.findById(languageId)!;

        const image = "gb.png";
        const directory = "english";
        const sortOrder = 1;
        const status = language!.Status === 1;

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
