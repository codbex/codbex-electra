import { getLogger } from "../../../../../codbex-electra/util/LoggerUtil";
import { ProductToStoreRepository as ProductToStoreDAO, ProductToStoreEntityOptions } from "../../../../../codbex-electra/gen/dao/Products/ProductToStoreRepository";
import { ProductRepository as ProductDAO, ProductEntityOptions } from "../../../../../codbex-electra/gen/dao/Products/ProductRepository";
const logger = getLogger(import.meta.url);

export function onMessage(message: any) {
    const store = message.getBody();

    const storeProductIds = getStoreProductIds(store.id);
    const manufacturerIds = getManufacturerIds(storeProductIds);
    logger.info("Found [{}] manufacturer IDs which must be replicated to store [{}]", manufacturerIds.length, store.name);

    const storeManufacturerEntries: any[] = [];
    manufacturerIds.forEach((manufacturerId) => {
        const productEntry = {
            manufacturerId: manufacturerId,
            store: store,
        }
        storeManufacturerEntries.push(productEntry);
    });

    message.setBody(storeManufacturerEntries);
    return message;
}

function getStoreProductIds(storeId: number) {
    const productToStoreDAO = new ProductToStoreDAO();
    const querySettings: ProductToStoreEntityOptions = {
        $filter: {
            equals: {
                Store: storeId
            }
        },
        $select: ["Product"]
    }

    const entries = productToStoreDAO.findAll(querySettings);

    const productIds = new Set<number>();
    entries.forEach(e => productIds.add(e.Product));

    return Array.from(productIds);
}


function getManufacturerIds(productIds: number[]) {
    const productDAO = new ProductDAO();

    const querySettings: ProductEntityOptions = {
        $filter: {

            equals: {
                Id: productIds
            }
        },
        $select: ["Manufacturer"]
    }

    const entries = productDAO.findAll(querySettings);

    const manufacturerIds = new Set<number>();
    entries.forEach(e => manufacturerIds.add(e.Manufacturer));

    return Array.from(manufacturerIds);
}
