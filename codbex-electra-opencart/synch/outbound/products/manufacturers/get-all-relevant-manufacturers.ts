import { ProductToStoreRepository as ProductToStoreDAO, ProductToStoreEntityOptions } from "codbex-electra/gen/dao/products/ProductToStoreRepository";
import { ProductRepository as ProductDAO, ProductEntityOptions } from "codbex-electra/gen/dao/products/ProductRepository";
import { BaseHandler } from "codbex-electra-opencart/synch/base-handler";
import { OpenCartStoreConfig } from "codbex-electra-opencart/dao/StoreConfigDAO";

export function onMessage(message: any) {
    const store: OpenCartStoreConfig = message.getBody();

    const handler = new GetAllRelevantManufacturersHandler(store);
    const storeManufacturerEntries = handler.handle();

    message.setBody(storeManufacturerEntries);
    return message;
}

export interface ManufacturerEntry {
    readonly manufacturerId: number;
    readonly store: OpenCartStoreConfig;
}

class GetAllRelevantManufacturersHandler extends BaseHandler {
    private readonly store;
    private readonly productToStoreDAO;
    private readonly productDAO;

    constructor(store: OpenCartStoreConfig) {
        super(import.meta.url);
        this.store = store;
        this.productToStoreDAO = new ProductToStoreDAO();
        this.productDAO = new ProductDAO();
    }

    handle() {
        const storeProductIds = this.getStoreProductIds();
        const manufacturerIds = this.getManufacturerIds(storeProductIds);
        this.logger.info("Found [{}] manufacturer IDs which must be replicated to store [{}]", manufacturerIds.length, this.store.name);

        const storeManufacturerEntries: ManufacturerEntry[] = [];
        manufacturerIds.forEach((manufacturerId) => {
            const productEntry = {
                manufacturerId: manufacturerId,
                store: this.store,
            }
            storeManufacturerEntries.push(productEntry);
        });
        return storeManufacturerEntries;
    }


    private getStoreProductIds() {
        const querySettings: ProductToStoreEntityOptions = {
            $filter: {
                equals: {
                    Store: this.store.id
                }
            },
            $select: ["Product"]
        }

        const entries = this.productToStoreDAO.findAll(querySettings);

        const productIds = new Set<number>();
        entries.forEach(e => productIds.add(e.Product));

        return Array.from(productIds);
    }


    private getManufacturerIds(productIds: number[]) {
        const querySettings: ProductEntityOptions = {
            $filter: {

                equals: {
                    Id: productIds
                }
            },
            $select: ["Manufacturer"]
        }

        const entries = this.productDAO.findAll(querySettings);

        const manufacturerIds = new Set<number>();
        entries.forEach(e => manufacturerIds.add(e.Manufacturer));

        return Array.from(manufacturerIds);
    }

}

