import * as generatedEntityReferenceDAO from "/codbex-electra/gen/dao/Settings/EntityReference";
import { getLogger } from "/codbex-electra/util/logger-util.mjs";

const logger = getLogger(import.meta.url);

const LANGUAGE_ENTITY = "Language";
const ATTRIBUTE_ENTITY = "Attribute";
const ATTRIBUTE_GROUP_ENTITY = "AttributeGroup";
const ATTRIBUTE_GROUP_TRANSLATION_ENTITY = "AttributeGroupTranslation";
const PRODUCT_ENTITY = "Product";
const PRODUCT_DESCRIPTION_ENTITY = "ProductDescription";

export function create(entityReference) {
    return generatedEntityReferenceDAO.create(entityReference);
};

export function createAttributeReference(storeId, entityAttributeId, referenceAttributeId) {
    return createReference(storeId, ATTRIBUTE_ENTITY, entityAttributeId, referenceAttributeId);
};

export function createAttributeGroupReference(storeId, entityAttributeGroupId, referenceAttributeGroupId) {
    return createReference(storeId, ATTRIBUTE_GROUP_ENTITY, entityAttributeGroupId, referenceAttributeGroupId);
};

export function createAttributeGroupTranslationReference(storeId, entityAttributeGroupTranslationId, referenceAttributeGroupTranslationId) {
    return createReference(storeId, ATTRIBUTE_GROUP_TRANSLATION_ENTITY, entityAttributeGroupTranslationId, referenceAttributeGroupTranslationId);
};

export function createLanguageReference(storeId, entityLanguageId, referenceLanguageId) {
    return createReference(storeId, LANGUAGE_ENTITY, entityLanguageId, referenceLanguageId);
};

export function createProductDescriptionReference(storeId, entityProductDescriptionId, referenceProductDescriptionId) {
    return createReference(storeId, PRODUCT_DESCRIPTION_ENTITY, entityProductDescriptionId, referenceProductDescriptionId);
};

export function createProductReference(storeId, entityProductId, referenceProductId) {
    return createReference(storeId, PRODUCT_ENTITY, entityProductId, referenceProductId);
};

export function createReference(scopeIntegerId, entityName, entityIntegerId, referenceIntegerId) {
    const entityReference = {
        EntityName: entityName,
        ScopeIntegerId: scopeIntegerId,
        EntityIntegerId: entityIntegerId,
        ReferenceIntegerId: referenceIntegerId
    }
    return generatedEntityReferenceDAO.create(entityReference);
};

export function getStoreProductReferences(storeId) {
    return getByScopeIntegerIdAndEntityName(storeId, PRODUCT_ENTITY);
};

export function getByScopeIntegerIdAndEntityName(scopeIntegerId, entityName) {
    const querySettings = {
        ScopeIntegerId: scopeIntegerId,
        EntityName: entityName
    };
    return generatedEntityReferenceDAO.list(querySettings);
};

export function getStoreAttribute(storeId, attributeId) {
    return getSingleReferenceByScopeIntegerIdEntityNameAndEntityIntegerId(storeId, ATTRIBUTE_ENTITY, attributeId);
};

export function getStoreAttributeGroup(storeId, attributeGroupId) {
    return getSingleReferenceByScopeIntegerIdEntityNameAndEntityIntegerId(storeId, ATTRIBUTE_GROUP_ENTITY, attributeGroupId);
};

export function getStoreAttributeGroupDescription(storeId, attributeGroupTranslationId) {
    return getSingleReferenceByScopeIntegerIdEntityNameAndEntityIntegerId(storeId, ATTRIBUTE_GROUP_TRANSLATION_ENTITY, attributeGroupTranslationId);
};

export function getStoreLanguageReference(storeId, languageId) {
    return getSingleReferenceByScopeIntegerIdEntityNameAndEntityIntegerId(storeId, LANGUAGE_ENTITY, languageId);
};

export function getStoreProductDescriptionReference(storeId, productDescriptionId) {
    return getSingleReferenceByScopeIntegerIdEntityNameAndEntityIntegerId(storeId, PRODUCT_DESCRIPTION_ENTITY, productDescriptionId);
};


export function getSingleReferenceByScopeIntegerIdEntityNameAndEntityIntegerId(scopeIntegerId, entityName, entityIntegerId) {
    const references = getByScopeIntegerIdEntityNameAndEntityIntegerId(scopeIntegerId, entityName, entityIntegerId);
    if (references.length == 0) {
        return null;
    }

    if (references.length > 1) {
        throwError(`Found more than one references for scope integer id ${scopeIntegerId}, entity name ${entityName} and entity integer id ${entityIntegerId}`);
    }
    return references[0];
};

function throwError(errorMessage) {
    logger.error(errorMessage);
    throw new Error(errorMessage);
}

export function getByScopeIntegerIdEntityNameAndEntityIntegerId(scopeIntegerId, entityName, entityIntegerId) {
    const querySettings = {
        ScopeIntegerId: scopeIntegerId,
        EntityName: entityName,
        EntityIntegerId: entityIntegerId
    };
    return generatedEntityReferenceDAO.list(querySettings);
};

