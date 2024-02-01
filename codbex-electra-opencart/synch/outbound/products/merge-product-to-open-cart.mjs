import { getLogger } from "/codbex-electra/util/logger-util.mjs";
import * as productDAO from "/codbex-electra/gen/dao/Products/Product";
import { OpenCartProductDAO } from "/codbex-electra-opencart/dao/OpenCartProductDAO.mjs";
const logger = getLogger(import.meta.url);

export function onMessage(message) {
    const productEntry = message.getBody();
    const productId = productEntry.productId;

    const product = getProduct(productId);
    logger.info("Received product entry [{}]", JSON.stringify(product));

    const dataSourceName = productEntry.store.dataSourceName;
    const ocProductDAO = new OpenCartProductDAO(dataSourceName);

    const ocProducts = ocProductDAO.list();
    logger.info("ocProducts: {}", ocProducts);


    const ocProduct = ocProductDAO.get(51);
    logger.info("ocProduct: {}", ocProduct);
    return message;
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
