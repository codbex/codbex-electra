import * as productToStoreDAO from "/codbex-electra/gen/dao/Products/ProductToStore";
import { getLogger } from "/codbex-electra/util/logger-util.mjs";
import * as entityReferenceDAO from "/codbex-electra/dao/entity-reference-dao.mjs";

const logger = getLogger(import.meta.url);

export function onMessage(message) {
    const store = message.getBody();

    const productToStoreEntries = getProductToStoreEntries(store.id);
    logger.info("Found [{}] products which must be replicated to store [{}]", productToStoreEntries.length, store.name);

    const productReferences = getStoreProductReferences(store.id);

    const productEntries = [];
    productToStoreEntries.forEach((pts) => {
        const productId = pts.Product;
        const reference = productReferences.get(productId);
        const productEntry = {
            productId: pts.Product,
            store: store,
            reference: reference
        }
        productEntries.push(productEntry);
    });

    message.setBody(productEntries);
    return message;
}

function getProductToStoreEntries(storeId) {
    const querySettings = {
        EntityName: "Product",
        Store: storeId
    };
    return productToStoreDAO.list(querySettings);
}

function getStoreProductReferences(storeId) {
    const productReferences = entityReferenceDAO.getStoreProductReferences(storeId);

    const mappings = new Map();

    productReferences.forEach((ref) => {
        mappings.set(ref.EntityIntegerId, ref);
    });

    return mappings;
}
