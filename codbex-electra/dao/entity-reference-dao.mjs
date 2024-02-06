import * as generatedEntityReferenceDAO from "/codbex-electra/gen/dao/Settings/EntityReference";
import { getLogger } from "/codbex-electra/util/logger-util.mjs";

const logger = getLogger(import.meta.url);

const LANGUAGE_ENTITY = "Language";
const PRODUCT_ENTITY = "Product";
const PRODUCT_DESCRIPTION_ENTITY = "ProductDescription";

export function create(entityReference) {
    return generatedEntityReferenceDAO.create(entityReference);
};

export function createLanguageReference(storeId, entityLanguageId, referenceLanguageId) {
    return createReference(storeId, LANGUAGE_ENTITY, entityLanguageId, referenceLanguageId);
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

