import { oc_attributeRepository as OpenCartAttributeDAO, oc_attributeCreateEntity as OpenCartAttributeCreateEntity, oc_attributeUpdateEntity as OpenCartAttributeUpdateEntity } from "../../../../dao/oc_attributeRepository";
import { oc_attribute_descriptionRepository as OpenCartAttributeDescriptionDAO, oc_attribute_descriptionUpdateEntity as OpenCartAttributeDescriptionUpdateEntity } from "../../../../dao/oc_attribute_descriptionRepository";
import { AttributeTranslationRepository as AttributeTranslationDAO, AttributeTranslationEntity } from "../../../../../codbex-electra/gen/dao/Products/AttributeTranslationRepository";
import { AttributeRepository as AttributeDAO, AttributeEntity } from "../../../../../codbex-electra/gen/dao/Products/AttributeRepository";
import { EntityReferenceDAO } from "../../../../../codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "../../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";
import { AttributeEntry } from "./get-all-attributes";
import { BaseHandler } from "../../base-handler";

export function onMessage(message: any) {
    const attributeEntry: AttributeEntry = message.getBody();

    const handler = new MergeAttributeToOpenCartHandler(attributeEntry);
    handler.handle();

    return message;
}

class MergeAttributeToOpenCartHandler extends BaseHandler {
    private readonly attributeEntry;
    private readonly entityReferenceDAO;
    private readonly attributeDAO;
    private readonly ocAttributeDAO;
    private readonly attributeTranslationDAO;
    private readonly ocAttributeDescriptionDAO;

    constructor(attributeEntry: AttributeEntry) {
        super(import.meta.url);
        this.attributeEntry = attributeEntry;

        const dataSourceName: string = attributeEntry.store.dataSourceName;
        this.entityReferenceDAO = new EntityReferenceDAO();
        this.attributeDAO = new AttributeDAO();
        this.ocAttributeDAO = new OpenCartAttributeDAO(dataSourceName);
        this.attributeTranslationDAO = new AttributeTranslationDAO();
        this.ocAttributeDescriptionDAO = new OpenCartAttributeDescriptionDAO(dataSourceName);
    }

    handle() {
        const storeId = this.attributeEntry.store.id;
        const attributeId = this.attributeEntry.attributeId;
        const attribute = this.attributeDAO.findById(attributeId);

        const attributeReference = this.entityReferenceDAO.getStoreAttribute(storeId, attribute!.Id);

        const ocAttribute = this.createOpenCartAttribute(attribute!, attributeReference);
        const ocAttributeId = this.ocAttributeDAO.upsert(ocAttribute);

        if (!attributeReference) {
            this.entityReferenceDAO.createAttributeReference(storeId, attribute!.Id, ocAttributeId);
        }

        const translations = this.getAttributeTranslations();

        translations.forEach(translation => {
            const ocAttributeDescription = this.createOpenCartAttributeDescription(translation, ocAttributeId);
            this.ocAttributeDescriptionDAO.upsert(ocAttributeDescription);
        });
    }

    private createOpenCartAttribute(attribute: AttributeEntity, attributeReference: EntityReferenceEntity | null): OpenCartAttributeCreateEntity | OpenCartAttributeUpdateEntity {
        const attributeGroup = attribute.Group;
        const attributeGroupReference = this.entityReferenceDAO.getStoreAttributeGroup(this.attributeEntry.store.id, attributeGroup);
        if (!attributeGroupReference) {
            this.throwError(`Missing attribute group reference for attribute group with id  ${attributeGroup}`);
        }
        const ocAttributeGroupId = attributeGroupReference!.ReferenceIntegerId;

        if (attributeReference) {
            return {
                attribute_id: attributeReference.ReferenceIntegerId,
                attribute_group_id: ocAttributeGroupId!,
                sort_order: 1
            };
        } else {
            return {
                attribute_group_id: ocAttributeGroupId!,
                sort_order: 1
            };
        }
    }

    private getAttributeTranslations() {
        const querySettings = {
            $filter: {
                equals: {
                    Attribute: this.attributeEntry.attributeId
                }
            }
        };
        return this.attributeTranslationDAO.findAll(querySettings);
    }

    private createOpenCartAttributeDescription(attributeTranslation: AttributeTranslationEntity, ocAttributeId: number): OpenCartAttributeDescriptionUpdateEntity {
        const languageReference = this.entityReferenceDAO.getStoreLanguageReference(this.attributeEntry.store.id, attributeTranslation.Language);
        if (!languageReference) {
            this.throwError(`Missing language reference for language with id ${attributeTranslation.Language}`);
        }
        const languageId = languageReference!.ReferenceIntegerId;

        return {
            attribute_id: ocAttributeId,
            language_id: languageId!,
            name: attributeTranslation.Text
        };
    }

}
