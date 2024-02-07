import { OpenCartAttributeDAO } from "/codbex-electra-opencart/dao/OpenCartAttributeDAO.mjs";
import { OpenCartAttributeDescriptionDAO } from "/codbex-electra-opencart/dao/OpenCartAttributeDescriptionDAO.mjs";
import { getLogger } from "/codbex-electra/util/logger-util.mjs";
import * as attributeTranslationDAO from "/codbex-electra/gen/dao/Products/AttributeTranslation";
import * as entityReferenceDAO from "/codbex-electra/dao/entity-reference-dao.mjs";

const logger = getLogger(import.meta.url);

export function onMessage(message) {
    const attributeEntry = message.getBody();

    const attribute = attributeEntry.attribute;
    const store = attributeEntry.store;
    const attributeReference = entityReferenceDAO.getStoreAttribute(store.id, attribute.Id);

    const ocAttributeDAO = new OpenCartAttributeDAO(store.dataSourceName);

    const ocAttribute = createOpenCartAttribute(store.id, attribute, attributeReference);
    const ocAttributeId = ocAttributeDAO.upsert(ocAttribute);

    if (!attributeReference) {
        entityReferenceDAO.createAttributeReference(store.id, attribute.Id, ocAttributeId);
    }

    const querySettings = {
        Attribute: attribute.Id
    };
    const translations = attributeTranslationDAO.list(querySettings);

    const ocAttributeDescriptionDAO = new OpenCartAttributeDescriptionDAO(store.dataSourceName);
    translations.forEach(translation => {
        const ocAttributeDescription = createOpenCartAttributeDescription(store.id, translation, ocAttributeId);
        ocAttributeDescriptionDAO.upsert(ocAttributeDescription);
    });

    return message;
}

function createOpenCartAttribute(storeId, attribute, attributeReference) {
    const id = attributeReference ? attributeReference.ReferenceIntegerId : null;

    const attributeGroupReference = entityReferenceDAO.getStoreAttributeGroup(storeId, attribute.Group);
    if (!attributeGroupReference) {
        throwError(`Missing attribute group reference for attribute group with id  ${attribute.Group}`);
    }
    const ocAttributeGroupId = attributeGroupReference.ReferenceIntegerId;

    return {
        "attributeId": id,
        "attributeGroupId": ocAttributeGroupId,
        "sortOrder": 1
    };
}

function createOpenCartAttributeDescription(storeId, attributeTranslation, ocAttributeId) {
    const languageReference = entityReferenceDAO.getStoreLanguageReference(storeId, attributeTranslation.Language);
    if (!languageReference) {
        throwError(`Missing language reference for language with id ${attributeTranslation.Language}`);
    }
    const languageId = languageReference.ReferenceIntegerId;

    return {
        attributeId: ocAttributeId,
        languageId: languageId,
        name: attributeTranslation.Text
    };
}

function throwError(errorMessage) {
    logger.error(errorMessage);
    throw new Error(errorMessage);
}