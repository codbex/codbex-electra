import { getLogger } from "/codbex-electra/util/logger-util.mjs";
import { OpenCartProductDAO } from "/codbex-electra-opencart/dao/OpenCartProductDAO.mjs";
import * as productDAO from "/codbex-electra/gen/dao/Products/Product";
import * as entityReferenceDAO from "/codbex-electra/dao/entity-reference-dao.mjs";

const logger = getLogger(import.meta.url);

export function onMessage(message) {
    const productEntry = message.getBody();

    const productId = productEntry.productId;
    const productReference = productEntry.reference;

    const product = getProduct(productId);

    const dataSourceName = productEntry.store.dataSourceName;
    const ocProductDAO = new OpenCartProductDAO(dataSourceName);

    const ocProduct = createOpenCartProduct(product, productReference);
    const ocProductId = ocProductDAO.upsert(ocProduct);

    if (!productReference) {
        const storeId = productEntry.store.id;
        const entityReference = {
            EntityName: "Product",
            ScopeIntegerId: storeId,
            EntityIntegerId: productId,
            ReferenceIntegerId: ocProductId
        }
        entityReferenceDAO.create(entityReference);
    }

    return message;
}

function getProduct(productId) {
    const product = productDAO.get(productId);
    if (!product) {
        throwError(`Missing product with id [${productId}]`);
    }
    return product;
}

function createOpenCartProduct(product, productReference) {
    const shipping = product.Shipping ? 1 : 0;
    const subtract = product.Subtract ? 1 : 0;
    const status = product.Status ? 1 : 0;
    const viewed = 0; // TODO get it from database

    const ocProduct = {
        "model": product.Model,
        "sku": product.SKU,
        "upc": product.UPC,
        "ean": product.EAN,
        "jan": product.JAN,
        "isbn": product.ISBN,
        "mpn": product.MPN,
        "location": product.Location,
        "quantity": product.Quantity,
        "stockStatusId": product.StockStatus,
        "image": product.Image,
        "manufacturerId": product.Manufacturer,
        "shipping": shipping,
        "price": product.Price,
        "points": product.Points,
        "taxClassId": 1,
        "dateAvailable": product.DateAvailable,
        "weight": product.Weight,
        "weightClassId": 1,
        "length": product.Length,
        "width": product.Width,
        "height": product.Height,
        "lengthClassId": 1,
        "subtract": subtract,
        "minimum": product.Minimum,
        "sortOrder": 0,
        "status": status,
        "dateAdded": product.DateAdded,
        "dateModified": product.DateModified,
        "viewed": viewed
    };

    if (productReference) {
        ocProduct.productId = productReference.ReferenceIntegerId;
    }

    return ocProduct;
}

function throwError(errorMessage) {
    logger.error(errorMessage);
    throw new Error(errorMessage);
}
