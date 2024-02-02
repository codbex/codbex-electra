import * as productToStoreDAO from "/codbex-electra/gen/dao/Products/ProductToStore";
import * as entityReferenceDAO from "/codbex-electra/gen/dao/Settings/EntityReference";

export function onMessage(message) {
    const store = message.getBody();
    const productToStoreEntries = getProductToStoreEntries(store.id);
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
