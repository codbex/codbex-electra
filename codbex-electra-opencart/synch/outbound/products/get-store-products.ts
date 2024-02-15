import { ProductToStoreRepository as ProductToStoreDAO, ProductDescriptionEntityOptions } from "../../../../codbex-electra/gen/dao/Products/ProductToStoreRepository";
import { StoreEntry } from "../get-all-relevant-stores";
import { BaseHandler } from "../base-handler";

export function onMessage(message: any) {
    const store: StoreEntry = message.getBody();

    const handler = new GetStoreProductsHandler(store);
    const productEntries = handler.handle();

    message.setBody(productEntries);
    return message;
}

export interface ProductEntry {
    readonly productId: number;
    readonly store: StoreEntry;
}

class GetStoreProductsHandler extends BaseHandler {
    private readonly store;
    private readonly productToStoreDAO;

    constructor(store: StoreEntry) {
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
        const querySettings: ProductDescriptionEntityOptions = {
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
