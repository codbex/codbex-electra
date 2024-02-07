import { getLogger } from "/codbex-electra/util/logger-util.mjs";
import { OpenCartProductAttributeDAO } from "/codbex-electra-opencart/dao/OpenCartProductAttributeDAO.mjs";
import * as productAttributeDAO from "/codbex-electra/gen/dao/Products/ProductAttribute";
import * as entityReferenceDAO from "/codbex-electra/dao/entity-reference-dao.mjs";

const logger = getLogger(import.meta.url);

export function onMessage(message) {
    const productEntry = message.getBody();

    const productId = productEntry.productId;
    const productAttributes = getProductAttributes(productId);

    const storeId = productEntry.store.id;
    productAttributes.forEach((productAttribute) => {
        const productReference = productEntry.reference;

        const ocProductAttribute = createOpenCartProductAttribute(storeId, productAttribute, productReference);

        const dataSourceName = productEntry.store.dataSourceName;
        const ocProductAttributeDAO = new OpenCartProductAttributeDAO(dataSourceName);
        ocProductAttributeDAO.upsert(ocProductAttribute);
    });
    return message;
}

function getProductAttributes(productId) {
    const querySettings = {
        Product: productId
    };
    return productAttributeDAO.list(querySettings);
}

function createOpenCartProductAttribute(storeId, productAttribute, productReference) {
    if (!productReference || !productReference.ReferenceIntegerId) {
        throwError(`Missing product reference id: ${productReference ? JSON.stringify(productReference) : null}`);
    }
    const id = productReference.ReferenceIntegerId;
    const languageId = getLanguageReference(storeId, productAttribute.Language);
    const attributeId = getAttributeReference(storeId, productAttribute.Attribute);

    return {
        "productId": id,
        "attributeId": attributeId,
        "languageId": languageId,
        "text": productAttribute.Text
    };
}

function getLanguageReference(storeId, languageId) {
    const languageReference = entityReferenceDAO.getStoreLanguageReference(storeId, languageId);
    if (!languageReference) {
        throwError(`Missing reference for language with id ${languageId}`);
    }
    return languageReference.ReferenceIntegerId;
}

function getAttributeReference(storeId, attributeId) {
    const attributeReference = entityReferenceDAO.getStoreAttribute(storeId, attributeId);
    if (!attributeReference) {
        throwError(`Missing reference for attribute with id ${attributeId}`);
    }
    return attributeReference.ReferenceIntegerId;
}

function throwError(errorMessage) {
    logger.error(errorMessage);
    throw new Error(errorMessage);
}
