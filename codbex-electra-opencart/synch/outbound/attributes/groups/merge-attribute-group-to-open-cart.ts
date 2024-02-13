import { oc_attribute_groupRepository as OpenCartAttributeGroupDAO, oc_attribute_groupCreateEntity as OpenCartAttributeGroupCreateEntity, oc_attribute_groupUpdateEntity as OpenCartAttributeGroupUpdateEntity } from "../../../../dao/oc_attribute_groupRepository";
import { oc_attribute_group_descriptionRepository as OpenCartAttributeGroupDescriptionDAO, oc_attribute_group_descriptionCreateEntity as OpenCartAttributeGroupDescriptionCreateEntity, oc_attribute_group_descriptionUpdateEntity as OpenCartAttributeGroupDescriptionUpdateEntity } from "../../../../dao/oc_attribute_group_descriptionRepository";
import { getLogger } from "../../../../../codbex-electra/util/LoggerUtil";
import { AttributeGroupTranslationRepository as AttributeGroupTranslationDAO, AttributeGroupTranslationEntity } from "../../../../../codbex-electra/gen/dao/Products/AttributeGroupTranslationRepository";
import { EntityReferenceDAO } from "../../../../../codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "../../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";

const logger = getLogger(import.meta.url);

export function onMessage(message: any) {
    const attributeGroupEntry = message.getBody();
    const attributeGroup = attributeGroupEntry.attributeGroup;
    const store = attributeGroupEntry.store;
    const storeId: number = store.id;
    const dataSourceName: string = store.dataSourceName;

    const entityReferenceDAO = new EntityReferenceDAO();
    const ocAttributeGroupDAO = new OpenCartAttributeGroupDAO(dataSourceName);
    const attributeGroupTranslationDAO = new AttributeGroupTranslationDAO();
    const ocAttributeGroupDescriptionDAO = new OpenCartAttributeGroupDescriptionDAO(store.dataSourceName);

    const attributeGroupReference = entityReferenceDAO.getStoreAttributeGroup(storeId, attributeGroup.Id);

    const ocAttributeGroup = createOpenCartAttributeGroup(attributeGroupReference);
    const ocAttributeGroupId = ocAttributeGroupDAO.upsert(ocAttributeGroup);

    if (!attributeGroupReference) {
        entityReferenceDAO.createAttributeGroupReference(storeId, attributeGroup.Id, ocAttributeGroupId);
    }

    const querySettings = {
        $filter: {
            equals: {
                AttributeGroup: attributeGroup.Id
            }
        }
    };
    const translations = attributeGroupTranslationDAO.findAll(querySettings);

    translations.forEach(translation => {
        const ocAttributeGroupDescription = createOpenCartAttributeGroupDescription(storeId, translation, ocAttributeGroupId);
        ocAttributeGroupDescriptionDAO.upsert(ocAttributeGroupDescription);
    });

    return message;
}

function createOpenCartAttributeGroup(attributeGroupReference: EntityReferenceEntity | null): OpenCartAttributeGroupCreateEntity | OpenCartAttributeGroupUpdateEntity {
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

function createOpenCartAttributeGroupDescription(storeId: number, attributeGroupTranslation: AttributeGroupTranslationEntity, ocAttributeGroupId: number): OpenCartAttributeGroupDescriptionCreateEntity | OpenCartAttributeGroupDescriptionUpdateEntity {
    const entityReferenceDAO = new EntityReferenceDAO();
    const languageReference = entityReferenceDAO.getStoreLanguageReference(storeId, attributeGroupTranslation.Language);
    if (!languageReference) {
        throwError(`Missing language reference for language with id ${attributeGroupTranslation.Language}`);
    }
    const languageId = languageReference!.ReferenceIntegerId;

    return {
        attribute_group_id: ocAttributeGroupId,
        language_id: languageId,
        name: attributeGroupTranslation.Text
    };
}

function throwError(errorMessage: string) {
    logger.error(errorMessage);
    throw new Error(errorMessage);
}