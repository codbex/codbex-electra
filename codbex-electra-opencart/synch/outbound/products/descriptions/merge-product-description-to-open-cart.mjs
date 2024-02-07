import { getLogger } from "/codbex-electra/util/logger-util.mjs";
import { OpenCartProductDescriptionDAO } from "/codbex-electra-opencart/dao/OpenCartProductDescriptionDAO.mjs";
import * as productDescriptionDAO from "/codbex-electra/gen/dao/Products/ProductDescription";
import * as entityReferenceDAO from "/codbex-electra/dao/entity-reference-dao.mjs";

const logger = getLogger(import.meta.url);

export function onMessage(message) {
    const productEntry = message.getBody();

    const productId = productEntry.productId;
    const productDescriptions = getProductDescriptions(productId);

    const storeId = productEntry.store.id;
    productDescriptions.forEach((productDescription) => {
        const productReference = productEntry.reference;

        const ocProductDescription = createOpenCartProductDescription(storeId, productDescription, productReference);

        const dataSourceName = productEntry.store.dataSourceName;
        const ocProductDescriptionDAO = new OpenCartProductDescriptionDAO(dataSourceName);
        ocProductDescriptionDAO.upsert(ocProductDescription);
    });
    return message;
}

function getProductDescriptions(productId) {
    const querySettings = {
        Product: productId
    };
    return productDescriptionDAO.list(querySettings);
}

function createOpenCartProductDescription(storeId, productDescription, productReference) {
    if (!productReference || !productReference.ReferenceIntegerId) {
        throwError(`Missing product reference id: ${productReference ? JSON.stringify(productReference) : null}`);
    }
    const id = productReference.ReferenceIntegerId;

    const languageReference = entityReferenceDAO.getStoreLanguageReference(storeId, productDescription.Language);
    if (!languageReference) {
        throwError(`Missing language reference for language with id ${productDescription.Language}`);
    }
    const languageId = languageReference.ReferenceIntegerId;


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
