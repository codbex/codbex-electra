import { getLogger } from "../../../../codbex-electra/util/LoggerUtil";
import { EntityReferenceDAO } from "../../../../codbex-electra/dao/EntityReferenceDAO";
import { ProductToStoreRepository as ProductToStoreDAO } from "../../../../codbex-electra/gen/dao/Products/ProductToStoreRepository";

const logger = getLogger(import.meta.url);

export function onMessage(message: any) {
    const store = message.getBody();

    const productToStoreEntries = getProductToStoreEntries(store.id);
    logger.info("Found [{}] products which must be replicated to store [{}]", productToStoreEntries.length, store.name);

    const productReferences = getStoreProductReferences(store.id);

    const productEntries: any[] = [];
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

function getProductToStoreEntries(storeId: number) {
    const productToStoreDAO = new ProductToStoreDAO();
    const querySettings = {
        $filter: {
            equals: {
                Store: storeId
            }
        }
    };

    return productToStoreDAO.findAll(querySettings);
}

function getStoreProductReferences(storeId: number) {
    const entityReferenceDAO = new EntityReferenceDAO();
    const productReferences = entityReferenceDAO.getStoreProductReferences(storeId);

    const mappings = new Map();

    productReferences.forEach((ref) => {
        mappings.set(ref.EntityIntegerId, ref);
    });

    return mappings;
} 
