import * as productToStoreDAO from "/codbex-electra/gen/dao/Products/ProductToStore";
import * as entityReferenceDAO from "/codbex-electra/gen/dao/Settings/EntityReference";
import { getLogger } from "/codbex-electra/util/logger-util.mjs";

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
    const querySettings = {
        ScopeIntegerId: storeId
    };
    const productReferences = entityReferenceDAO.list(querySettings);

    const mappings = new Map();

    productReferences.forEach((ref) => {
        mappings.set(ref.EntityIntegerId, ref);
    });

    return mappings;
}
