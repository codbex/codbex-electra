import * as generatedEntityReferenceDAO from "/codbex-electra/gen/dao/Settings/EntityReference";

import { getLogger } from "/codbex-electra/util/logger-util.mjs";

const logger = getLogger(import.meta.url);

export function create(entityReference) {
    return generatedEntityReferenceDAO.create(entityReference);
};

export function getStoreProductReferences(storeId) {
    return getByScopeIntegerIdAndEntityName(storeId, "Product");
};

export function getStoreProductDescriptionReference(storeId, productDescriptionId) {
    const references = getByScopeIntegerIdEntityNameAndEntityIntegerId(storeId, "ProductDescription", productDescriptionId);
    if (references.length == 0) {
        return null;
    }

    if (references.length > 1) {
        throwError(`Found more than one product description references for product description ${productDescriptionId} and  store ${storeId}`);
    }
    return references[0];
};

export function getByScopeIntegerIdAndEntityName(scopeIntegerId, entityName) {
    const querySettings = {
        ScopeIntegerId: scopeIntegerId,
        EntityName: entityName
    };
    return generatedEntityReferenceDAO.list(querySettings);
};

export function getByScopeIntegerIdEntityNameAndEntityIntegerId(scopeIntegerId, entityName, entityIntegerId) {
    const querySettings = {
        ScopeIntegerId: scopeIntegerId,
        EntityName: entityName,
        EntityIntegerId: entityIntegerId
    };
    return generatedEntityReferenceDAO.list(querySettings);
};

function throwError(errorMessage) {
    logger.error(errorMessage);
    throw new Error(errorMessage);
}
