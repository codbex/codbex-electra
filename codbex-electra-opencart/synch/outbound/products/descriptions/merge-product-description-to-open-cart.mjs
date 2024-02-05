import { getLogger } from "/codbex-electra/util/logger-util.mjs";
import { OpenCartProductDescriptionDAO } from "/codbex-electra-opencart/dao/OpenCartProductDescriptionDAO.mjs";
import * as productDescriptionDAO from "/codbex-electra/gen/dao/Products/ProductDescription";
import * as entityReferenceDAO from "/codbex-electra/dao/entity-reference-dao.mjs";

const logger = getLogger(import.meta.url);

export function onMessage(message) {
    const productEntry = message.getBody();

    const productId = productEntry.productId;
    const productDescription = getProductDescription(productId);

    const productReference = productEntry.reference;
    const descriptionReference = entityReferenceDAO.getStoreProductDescriptionReference(productEntry.store.id, productDescription.Id);

    const ocProductDescription = createOpenCartProductDescription(productDescription, productReference, descriptionReference);

    const dataSourceName = productEntry.store.dataSourceName;
    const ocProductDescriptionDAO = new OpenCartProductDescriptionDAO(dataSourceName);
    ocProductDescriptionDAO.upsert(ocProductDescription);

    if (!descriptionReference) {
        const storeId = productEntry.store.id;
        const entityReference = {
            ScopeIntegerId: storeId,
            EntityName: "ProductDescription",
            EntityIntegerId: productDescription.Id,
            ReferenceIntegerId: ocProductDescription.productId
        }
        entityReferenceDAO.create(entityReference);
    }

    return message;
}

function getProductDescription(productId) {
    const querySettings = {
        Product: productId
    };
    const productDescriptions = productDescriptionDAO.list(querySettings);
    if (productDescriptions.length === 0) {
        throwError(`Missing product descriptions for product [${productId}]`);
    }
    if (productDescriptions.length > 1) {
        throwError(`Found more than one product descriptions for product [${productId}]`);
    }
    return productDescriptions[0];
}

function createOpenCartProductDescription(productDescription, productReference, descriptionReference) {
    // TODO get language Id from entity references once it is replicated 
    // entityReferenceDAO.getByScopeIntegerIdAndEntityType(scopeIntegerId, "Language")
    const languageId = 1;

    let productReferenceId;
    if (productReference && productReference.ReferenceIntegerId) {
        productReferenceId = productReference.ReferenceIntegerId;
    } else {
        throwError(`Missing product reference id: ${productReference ? JSON.stringify(productReference) : null}`);
    }
    const id = descriptionReference && descriptionReference.ReferenceIntegerId ? descriptionReference.ReferenceIntegerId : productReferenceId;

    return {
        "productId": id,
        "languageId": languageId,
        "name": productDescription.Name,
        "description": productDescription.Description,
        "tag": productDescription.Tag,
        "metaTitle": productDescription.MetaTitle,
        "metaDescription": productDescription.MetaDescription,
        "metaKeyword": productDescription.MetaKeyword
    };
}

function throwError(errorMessage) {
    logger.error(errorMessage);
    throw new Error(errorMessage);
}
