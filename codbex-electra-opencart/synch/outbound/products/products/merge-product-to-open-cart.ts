import { getLogger } from "../../../../../codbex-electra/util/LoggerUtil";
import { oc_productRepository as OpenCartProductDAO, oc_productCreateEntity as OpenCartProductCreateEntity, oc_productUpdateEntity as OpenCartProductUpdateEntity } from "../../../../dao/oc_productRepository";
import { ProductRepository as ProductDAO, ProductEntity } from "../../../../../codbex-electra/gen/dao/Products/ProductRepository";
import { EntityReferenceDAO } from "../../../../../codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "../../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";

const logger = getLogger(import.meta.url);

export function onMessage(message: any) {
    const productEntry = message.getBody();
    const dataSourceName = productEntry.store.dataSourceName;
    const productId = productEntry.productId;
    const storeId = productEntry.store.id;

    const entityReferenceDAO = new EntityReferenceDAO();
    const ocProductDAO = new OpenCartProductDAO(dataSourceName);

    const product = getProduct(productId);
    const productReference = entityReferenceDAO.getStoreProduct(storeId, productId);

    const ocProduct = createOpenCartProduct(product, productReference, ocProductDAO, productEntry.store.id);
    const ocProductId = ocProductDAO.upsert(ocProduct);

    if (!productReference) {
        entityReferenceDAO.createProductReference(storeId, productId, ocProductId);
    }

    return message;
}

function getProduct(productId: number): ProductEntity {
    const productDAO = new ProductDAO();
    const product = productDAO.findById(productId);
    if (!product) {
        throwError(`Missing product with id [${productId}]`);
    }
    return product!;
}

function createOpenCartProduct(product: ProductEntity, productReference: EntityReferenceEntity | null, ocProductDAO: OpenCartProductDAO, storeId: number): OpenCartProductCreateEntity | OpenCartProductUpdateEntity {
    const manufacturerId = getOpenCartManufacturerId(storeId, product.Manufacturer);
    if (productReference) {
        const ocProduct = ocProductDAO.findById(productReference.ReferenceIntegerId!);
        const viewed = ocProduct ? ocProduct.viewed : 0;

        return {
            product_id: productReference.ReferenceIntegerId,
            model: product.Model,
            sku: product.SKU,
            upc: product.UPC,
            ean: product.EAN,
            jan: product.JAN,
            isbn: product.ISBN,
            mpn: product.MPN,
            location: product.Location,
            quantity: product.Quantity,
            stock_status_id: product.StockStatus,
            image: product.Image,
            manufacturer_id: manufacturerId,
            shipping: product.Shipping,
            price: product.Price,
            points: product.Points,
            tax_class_id: 1,
            date_available: product.DateAvailable,
            weight: product.Weight,
            weight_class_id: 1, // do we want to support different classes
            length: product.Length,
            width: product.Width,
            height: product.Height,
            length_class_id: 1, // do we want to support different classes
            subtract: product.Subtract,
            minimum: product.Minimum,
            sort_order: 0,
            status: product.Status,
            date_added: product.DateAdded,
            date_modified: product.DateModified,
            viewed: viewed
        };
    } else {
        return {
            viewed: 0,
            model: product.Model,
            sku: product.SKU,
            upc: product.UPC,
            ean: product.EAN,
            jan: product.JAN,
            isbn: product.ISBN,
            mpn: product.MPN,
            location: product.Location,
            quantity: product.Quantity,
            stock_status_id: product.StockStatus,
            image: product.Image,
            manufacturer_id: manufacturerId,
            shipping: product.Shipping,
            price: product.Price,
            points: product.Points,
            tax_class_id: 1,
            date_available: product.DateAvailable,
            weight: product.Weight,
            weight_class_id: 1, // do we want to support different classes
            length: product.Length,
            width: product.Width,
            height: product.Height,
            length_class_id: 1, // do we want to support different classes
            subtract: product.Subtract,
            minimum: product.Minimum,
            sort_order: 0,
            status: product.Status,
            date_added: product.DateAdded,
            date_modified: product.DateModified
        };
    }
}
function getOpenCartManufacturerId(storeId: number, manufacturerId: number): number {
    const entityReferenceDAO = new EntityReferenceDAO();
    const manufacturerRef = entityReferenceDAO.getStoreManufacturer(storeId, manufacturerId);
    if (!manufacturerRef || !manufacturerRef.ReferenceIntegerId) {
        throwError(`Missing reference for manufacturer with id [${manufacturerId}] for store [${storeId}]`);
    }
    return manufacturerRef!.ReferenceIntegerId!;
}

function throwError(errorMessage: string) {
    logger.error(errorMessage);
    throw new Error(errorMessage);
}
