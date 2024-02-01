import { getLogger } from "/codbex-electra/util/logger-util.mjs";
import * as productDAO from "/codbex-electra/gen/dao/Products/Product";
import * as productToStoreDAO from "/codbex-electra/gen/dao/Products/ProductToStore";

const logger = getLogger(import.meta.url);

export function onMessage(message) {
    const store = message.getBody();
    const productToStoreEntries = getProductToStoreEntries(store.id);

    const products = [];
    productToStoreEntries.forEach((pts) => {
        const productId = pts.Product;
        const product = getProduct(productId);
        products.push(product);
    });

    message.setBody(products);
    return message;
}

function getProductToStoreEntries(storeId) {
    const querySettings = {
        Store: storeId
    };
    return productToStoreDAO.list(querySettings);
}

function getProduct(productId) {
    const product = productDAO.get(productId);
    if (!product) {
        throwError(`Missing product with id [${productId}]`);
    }
    return product;
}

function throwError(errorMessage) {
    logger.error(errorMessage);
    throw new Error(errorMessage);
}
