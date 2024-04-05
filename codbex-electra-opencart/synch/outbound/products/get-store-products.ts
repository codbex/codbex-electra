import { ProductToStoreRepository as ProductToStoreDAO, ProductToStoreEntityOptions } from "codbex-electra/gen/dao/Products/ProductToStoreRepository";
import { OpenCartStoreConfig } from "codbex-electra-opencart/dao/StoreConfigDAO";
import { BaseHandler } from "codbex-electra-opencart/synch/base-handler";

export function onMessage(message: any) {
    const store: OpenCartStoreConfig = message.getBody();

    const handler = new GetStoreProductsHandler(store);
    const productEntries = handler.handle();

    message.setBody(productEntries);
    return message;
}

export interface ProductEntry {
    readonly productId: number;
    readonly store: OpenCartStoreConfig;
}

class GetStoreProductsHandler extends BaseHandler {
    private readonly store;
    private readonly productToStoreDAO;

    constructor(store: OpenCartStoreConfig) {
        super(import.meta.url);
        this.store = store;
        this.productToStoreDAO = new ProductToStoreDAO();
    }

    handle() {
        const productIds = this.getStoreProductIds();
        this.logger.info("Found [{}] products which are linked for store [{}]", productIds.size, this.store.name);

        const productEntries: ProductEntry[] = [];
        productIds.forEach((productId) => {
            const productEntry = {
                productId: productId,
                store: this.store,
            }
            productEntries.push(productEntry);
        });
        return productEntries;
    }

    private getStoreProductIds() {
        const querySettings: ProductToStoreEntityOptions = {
            $filter: {
                equals: {
                    Store: this.store.id
                }
            },
            $select: ["Product"]
        };

        const entries = this.productToStoreDAO.findAll(querySettings);

        const productIds = new Set<number>();
        entries.forEach(e => productIds.add(e.Product));

        return productIds;
    }
}
