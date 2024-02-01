import * as productToStoreDAO from "/codbex-electra/gen/dao/Products/ProductToStore";

export function onMessage(message) {
    const store = message.getBody();
    const productToStoreEntries = getProductToStoreEntries(store.id);

    const productEntries = [];
    productToStoreEntries.forEach((pts) => {
        const productEntry = {
            productId: pts.Product,
            store: store
        }
        productEntries.push(productEntry);
    });

    message.setBody(productEntries);
    return message;
}

function getProductToStoreEntries(storeId) {
    const querySettings = {
        Store: storeId
    };
    return productToStoreDAO.list(querySettings);
}

