import { OpenCartAttributeGroupDAO } from "/codbex-electra-opencart/dao/OpenCartAttributeGroupDAO.mjs";
import { OpenCartAttributeGroupDescriptionDAO } from "/codbex-electra-opencart/dao/OpenCartAttributeGroupDescriptionDAO.mjs";
import { getLogger } from "/codbex-electra/util/logger-util.mjs";
import * as attributeGroupTranslationDAO from "/codbex-electra/gen/dao/Products/AttributeGroupTranslation";
import * as entityReferenceDAO from "/codbex-electra/dao/entity-reference-dao.mjs";

const logger = getLogger(import.meta.url);

export function onMessage(message) {
    const attributeGroupEntry = message.getBody();

    const attributeGroup = attributeGroupEntry.attributeGroup;
    const store = attributeGroupEntry.store;
    const attributeGroupReference = entityReferenceDAO.getStoreAttributeGroup(store.id, attributeGroup.Id);

    const ocAttributeGroupDAO = new OpenCartAttributeGroupDAO(store.dataSourceName);

    const ocAttributeGroup = createOpenCartAttributeGroup(attributeGroupReference);
    const ocAttributeGroupId = ocAttributeGroupDAO.upsert(ocAttributeGroup);

    if (!attributeGroupReference) {
        entityReferenceDAO.createAttributeGroupReference(store.id, attributeGroup.Id, ocAttributeGroupId);
    }
    const querySettings = {
        AttributeGroup: attributeGroup.Id
    };
    const translations = attributeGroupTranslationDAO.list(querySettings);

    const ocAttributeGroupDescriptionDAO = new OpenCartAttributeGroupDescriptionDAO(store.dataSourceName);
    translations.forEach(translation => {
        const ocAttributeGroupDescription = createOpenCartAttributeGroupDescription(store.id, translation, ocAttributeGroupId);
        ocAttributeGroupDescriptionDAO.upsert(ocAttributeGroupDescription);
    });

    return message;
}

function createOpenCartAttributeGroup(attributeGroupReference) {
    const id = attributeGroupReference ? attributeGroupReference.ReferenceIntegerId : null;
    return {
        "attributeGroupId": id,
        "sortOrder": 1
    };
}

function createOpenCartAttributeGroupDescription(storeId, attributeGroupTranslation, ocAttributeGroupId) {
    const languageReference = entityReferenceDAO.getStoreLanguageReference(storeId, attributeGroupTranslation.Language);
    if (!languageReference) {
        throwError(`Missing language reference for language with id ${attributeGroupTranslation.Language}`);
    }
    const languageId = languageReference.ReferenceIntegerId;

    return {
        attributeGroupId: ocAttributeGroupId,
        languageId: languageId,
        name: attributeGroupTranslation.Text
    };
}

function throwError(errorMessage) {
    logger.error(errorMessage);
    throw new Error(errorMessage);
}