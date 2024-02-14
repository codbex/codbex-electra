import { oc_productRepository as OpenCartProductDAO, oc_productCreateEntity as OpenCartProductCreateEntity, oc_productUpdateEntity as OpenCartProductUpdateEntity } from "../../../../dao/oc_productRepository";
import { ProductRepository as ProductDAO, ProductEntity } from "../../../../../codbex-electra/gen/dao/Products/ProductRepository";
import { EntityReferenceDAO } from "../../../../../codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "../../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";
import { BaseHandler } from "../../base-handler";
import { ProductEntry } from "../get-store-products";

export function onMessage(message: any) {
    const productEntry: ProductEntry = message.getBody();

    const handler = new MergeProductToOpenCartHandler(productEntry);
    handler.handle();

    return message;
}

class MergeProductToOpenCartHandler extends BaseHandler {
    private readonly productEntry;
    private readonly entityReferenceDAO;
    private readonly ocProductDAO;

    constructor(productEntry: ProductEntry) {
        super(import.meta.url);
        this.productEntry = productEntry;

        this.entityReferenceDAO = new EntityReferenceDAO();
        this.ocProductDAO = new OpenCartProductDAO(productEntry.store.dataSourceName);
    }

    handle() {
        const productId = this.productEntry.productId;
        const storeId = this.productEntry.store.id;

        const product = this.getProduct(productId);
        const productReference = this.entityReferenceDAO.getStoreProduct(storeId, productId);

        const ocProduct = this.createOpenCartProduct(product, productReference);
        const ocProductId = this.ocProductDAO.upsert(ocProduct);

        if (!productReference) {
            this.entityReferenceDAO.createProductReference(storeId, productId, ocProductId);
        }
    }

    private getProduct(productId: number): ProductEntity {
        const productDAO = new ProductDAO();
        const product = productDAO.findById(productId);
        if (!product) {
            this.throwError(`Missing product with id [${productId}]`);
        }
        return product!;
    }

    private createOpenCartProduct(product: ProductEntity, productReference: EntityReferenceEntity | null): OpenCartProductCreateEntity | OpenCartProductUpdateEntity {
        const manufacturerId = this.getOpenCartManufacturerId(this.productEntry.store.id, product.Manufacturer);
        if (productReference) {
            const ocProduct = this.ocProductDAO.findById(productReference.ReferenceIntegerId!);
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

    private getOpenCartManufacturerId(storeId: number, manufacturerId: number): number {
        const entityReferenceDAO = new EntityReferenceDAO();
        const manufacturerRef = entityReferenceDAO.getStoreManufacturer(storeId, manufacturerId);
        if (!manufacturerRef || !manufacturerRef.ReferenceIntegerId) {
            this.throwError(`Missing reference for manufacturer with id [${manufacturerId}] for store [${storeId}]`);
        }
        return manufacturerRef!.ReferenceIntegerId!;
    }

}

