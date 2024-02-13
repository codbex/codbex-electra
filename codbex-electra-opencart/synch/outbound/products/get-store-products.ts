import { getLogger } from "../../../../codbex-electra/util/LoggerUtil";
import { ProductToStoreRepository as ProductToStoreDAO } from "../../../../codbex-electra/gen/dao/Products/ProductToStoreRepository";

const logger = getLogger(import.meta.url);

export function onMessage(message: any) {
    const store = message.getBody();

    const productIds = getStoreProductIds(store.id);
    logger.info("Found [{}] products which are linked for store [{}]", productIds.size, store.name);

    const productEntries: any[] = [];
    productIds.forEach((productId) => {
        const productEntry = {
            productId: productId,
            store: store,
        }
        productEntries.push(productEntry);
    });

    message.setBody(productEntries);
    return message;
}

function getStoreProductIds(storeId: number) {
    const productToStoreDAO = new ProductToStoreDAO();
    const querySettings = {
        $filter: {
            equals: {
                Store: storeId
            }
        }
    };

    const entries = productToStoreDAO.findAll(querySettings);

    const productIds = new Set<number>();
    entries.forEach(e => productIds.add(e.Product));

    return productIds;
}
