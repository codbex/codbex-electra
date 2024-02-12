import { oc_attributeRepository as OpenCartAttributeDAO, oc_attributeCreateEntity as OpenCartAttributeCreateEntity, oc_attributeUpdateEntity as OpenCartAttributeUpdateEntity } from "../../../../dao/oc_attributeRepository";
import { oc_attribute_descriptionRepository as OpenCartAttributeDescriptionDAO, oc_attribute_descriptionCreateEntity as OpenCartAttributeDescriptionCreateEntity, oc_attribute_descriptionUpdateEntity as OpenCartAttributeDescriptionUpdateEntity } from "../../../../dao/oc_attribute_descriptionRepository";
import { getLogger } from "../../../../../codbex-electra/util/LoggerUtil";
import { AttributeTranslationRepository as AttributeTranslationDAO, AttributeTranslationEntity } from "../../../../../codbex-electra/gen/dao/Products/AttributeTranslationRepository";
import { AttributeEntity } from "../../../../../codbex-electra/gen/dao/Products/AttributeRepository";
import { EntityReferenceDAO } from "../../../../../codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "../../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";

const logger = getLogger(import.meta.url);

export function onMessage(message: any) {
    const attributeEntry = message.getBody();

    const attribute: AttributeEntity = attributeEntry.attribute;
    const store = attributeEntry.store;
    const entityReferenceDAO = new EntityReferenceDAO();
    const attributeReference = entityReferenceDAO.getStoreAttribute(store.id, attribute.Id);

    const ocAttributeDAO = new OpenCartAttributeDAO(store.dataSourceName);

    const ocAttribute = createOpenCartAttribute(store.id, attribute, attributeReference);
    const ocAttributeId = ocAttributeDAO.upsert(ocAttribute);

    if (!attributeReference) {
        entityReferenceDAO.createAttributeReference(store.id, attribute.Id, ocAttributeId);
    }

    const querySettings = {
        $filter: {
            equals: {
                Attribute: attribute.Id
            };
        }
    };
    const attributeTranslationDAO = new AttributeTranslationDAO();
    const translations = attributeTranslationDAO.findAll(querySettings);

    const ocAttributeDescriptionDAO = new OpenCartAttributeDescriptionDAO(store.dataSourceName);
    translations.forEach(translation => {
        const ocAttributeDescription = createOpenCartAttributeDescription(store.id, translation, ocAttributeId);
        ocAttributeDescriptionDAO.upsert(ocAttributeDescription);
    });

    return message;
}

function createOpenCartAttribute(storeId: number, attribute: AttributeEntity, attributeReference: EntityReferenceEntity | null): OpenCartAttributeCreateEntity | OpenCartAttributeUpdateEntity {
    const entityReferenceDAO = new EntityReferenceDAO();
    const attributeGroupReference = entityReferenceDAO.getStoreAttributeGroup(storeId, attribute.Group);
    if (!attributeGroupReference) {
        throwError(`Missing attribute group reference for attribute group with id  ${attribute.Group}`);
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

function createOpenCartAttributeDescription(storeId: number, attributeTranslation: AttributeTranslationEntity, ocAttributeId: number): OpenCartAttributeDescriptionUpdateEntity {
    const entityReferenceDAO = new EntityReferenceDAO();
    const languageReference = entityReferenceDAO.getStoreLanguageReference(storeId, attributeTranslation.Language);
    if (!languageReference) {
        throwError(`Missing language reference for language with id ${attributeTranslation.Language}`);
    }
    const languageId = languageReference!.ReferenceIntegerId;

    return {
        attribute_id: ocAttributeId,
        language_id: languageId!,
        name: attributeTranslation.Text
    };
}

function throwError(errorMessage: string) {
    logger.error(errorMessage);
    throw new Error(errorMessage);
}