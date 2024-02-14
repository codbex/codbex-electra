import { oc_attribute_groupRepository as OpenCartAttributeGroupDAO, oc_attribute_groupCreateEntity as OpenCartAttributeGroupCreateEntity, oc_attribute_groupUpdateEntity as OpenCartAttributeGroupUpdateEntity } from "../../../../dao/oc_attribute_groupRepository";
import { oc_attribute_group_descriptionRepository as OpenCartAttributeGroupDescriptionDAO, oc_attribute_group_descriptionCreateEntity as OpenCartAttributeGroupDescriptionCreateEntity, oc_attribute_group_descriptionUpdateEntity as OpenCartAttributeGroupDescriptionUpdateEntity } from "../../../../dao/oc_attribute_group_descriptionRepository";
import { AttributeGroupTranslationRepository as AttributeGroupTranslationDAO, AttributeGroupTranslationEntity } from "../../../../../codbex-electra/gen/dao/Products/AttributeGroupTranslationRepository";
import { EntityReferenceDAO } from "../../../../../codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "../../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";
import { AttributeGroupEntry } from "./get-all-attribute-groups";
import { BaseHandler } from "../../base-handler";

export function onMessage(message: any) {
    const attributeGroupEntry: AttributeGroupEntry = message.getBody();

    const handler = new MergeAttributeGroupToOpenCartHandler(attributeGroupEntry);
    handler.handle();

    return message;
}

class MergeAttributeGroupToOpenCartHandler extends BaseHandler {
    private readonly attributeGroupEntry;
    private readonly entityReferenceDAO;
    private readonly ocAttributeGroupDAO;
    private readonly attributeGroupTranslationDAO;
    private readonly ocAttributeGroupDescriptionDAO;

    constructor(attributeGroupEntry: AttributeGroupEntry) {
        super(import.meta.url);
        this.attributeGroupEntry = attributeGroupEntry;

        const dataSourceName: string = attributeGroupEntry.store.dataSourceName;
        this.entityReferenceDAO = new EntityReferenceDAO();
        this.ocAttributeGroupDAO = new OpenCartAttributeGroupDAO(dataSourceName);
        this.attributeGroupTranslationDAO = new AttributeGroupTranslationDAO();
        this.ocAttributeGroupDescriptionDAO = new OpenCartAttributeGroupDescriptionDAO(dataSourceName);
    }

    handle() {
        const attributeGroup = this.attributeGroupEntry.attributeGroup;
        const storeId = this.attributeGroupEntry.store.id;

        const attributeGroupReference = this.entityReferenceDAO.getStoreAttributeGroup(storeId, attributeGroup.Id);

        const ocAttributeGroup = this.createOpenCartAttributeGroup(attributeGroupReference);
        const ocAttributeGroupId = this.ocAttributeGroupDAO.upsert(ocAttributeGroup);

        if (!attributeGroupReference) {
            this.entityReferenceDAO.createAttributeGroupReference(storeId, attributeGroup.Id, ocAttributeGroupId);
        }

        const querySettings = {
            $filter: {
                equals: {
                    AttributeGroup: attributeGroup.Id
                }
            }
        };
        const translations = this.attributeGroupTranslationDAO.findAll(querySettings);

        translations.forEach(translation => {
            const ocAttributeGroupDescription = this.createOpenCartAttributeGroupDescription(translation, ocAttributeGroupId);
            this.ocAttributeGroupDescriptionDAO.upsert(ocAttributeGroupDescription);
        });
    }

    private createOpenCartAttributeGroup(attributeGroupReference: EntityReferenceEntity | null): OpenCartAttributeGroupCreateEntity | OpenCartAttributeGroupUpdateEntity {
        if (attributeGroupReference) {
            return {
                attribute_group_id: attributeGroupReference.ReferenceIntegerId,
                sort_order: 1
            };
        } else {
            return {
                sort_order: 1
            };

        }
    }

    private createOpenCartAttributeGroupDescription(attributeGroupTranslation: AttributeGroupTranslationEntity, ocAttributeGroupId: number): OpenCartAttributeGroupDescriptionCreateEntity | OpenCartAttributeGroupDescriptionUpdateEntity {
        const languageReference = this.entityReferenceDAO.getStoreLanguageReference(this.attributeGroupEntry.store.id, attributeGroupTranslation.Language);
        if (!languageReference) {
            this.throwError(`Missing language reference for language with id ${attributeGroupTranslation.Language}`);
        }
        const languageId = languageReference!.ReferenceIntegerId;

        return {
            attribute_group_id: ocAttributeGroupId,
            language_id: languageId,
            name: attributeGroupTranslation.Text
        };
    }

}
