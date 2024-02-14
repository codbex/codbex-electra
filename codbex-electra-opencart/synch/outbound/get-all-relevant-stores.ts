import { StoreRepository } from "../../../codbex-electra/gen/dao/Stores/StoreRepository";
import { StoreTypeRepository as StoreTypeDAO } from "../../../codbex-electra/gen/dao/Stores/StoreTypeRepository";
import { StoreConfigurationRepository as StoreConfigurationDAO } from "../../../codbex-electra/gen/dao/Stores/StoreConfigurationRepository";
import { StoreConfigurationPropertyRepository as StoreConfigurationPropertyDAO } from "../../../codbex-electra/gen/dao/Stores/StoreConfigurationPropertyRepository";
import { BaseHandler } from "./base-handler";

export function onMessage(message: any) {
    const handler = new GetAllRelevantStoresHandler();
    const storeEntries = handler.handle();

    message.setBody(storeEntries);
    return message;
}

export interface StoreEntry {
    readonly id: number;
    readonly name: string;
    readonly dataSourceName: string;
    readonly url: string;
}

class GetAllRelevantStoresHandler extends BaseHandler {

    private static readonly OPENCART_STORE_TYPE_NAME = "OpenCart";
    private static readonly OPENCART_DATASOURCE_NAME_PROPERTY = "DATASOURCE_NAME";
    private static readonly OPENCART_URL_PROPERTY = "URL";

    private readonly storeConfigurationDAO;
    private readonly storeConfigurationPropertyDAO;
    private readonly storeTypeDAO;

    constructor() {
        super(import.meta.url);
        this.storeConfigurationDAO = new StoreConfigurationDAO();
        this.storeConfigurationPropertyDAO = new StoreConfigurationPropertyDAO();
        this.storeTypeDAO = new StoreTypeDAO();
    }

    handle() {
        const storeEntities = this.getAllEnabledStores();
        this.logger.info("Found [{}] OpenCart stores which are enabled", storeEntities.length);

        const dataSourcePropertyId = this.getStoreConfigPropertyId(GetAllRelevantStoresHandler.OPENCART_DATASOURCE_NAME_PROPERTY);
        const urlPropertyId = this.getStoreConfigPropertyId(GetAllRelevantStoresHandler.OPENCART_URL_PROPERTY);

        const stores: StoreEntry[] = [];

        storeEntities.forEach((storeEntity) => {
            const dataSourceName = this.getStoreConfig(storeEntity.Id, dataSourcePropertyId);
            const url = this.getStoreConfig(storeEntity.Id, urlPropertyId);
            const store = {
                id: storeEntity.Id,
                name: storeEntity.Name,
                dataSourceName: dataSourceName,
                url: url
            };
            stores.push(store);
        });
        return stores;
    }

    private getAllEnabledStores() {
        const storeTypeId = this.getOpenCartStoreTypeId();

        const querySettings = {
            $filter: {
                equals: {
                    Type: storeTypeId,
                    Enabled: true
                }
            }
        };
        const storeDAO = new StoreRepository();
        return storeDAO.findAll(querySettings);
    }

    private getOpenCartStoreTypeId() {
        const querySettings = {
            $filter: {
                equals: {
                    Name: GetAllRelevantStoresHandler.OPENCART_STORE_TYPE_NAME
                }
            }
        };
        const storeTypes = this.storeTypeDAO.findAll(querySettings);

        if (storeTypes.length === 0) {
            this.throwError(`Missing store type with name [${GetAllRelevantStoresHandler.OPENCART_STORE_TYPE_NAME}]`);
        }

        if (storeTypes.length > 1) {
            this.throwError(`There are [${storeTypes.length}] store types with name [${GetAllRelevantStoresHandler.OPENCART_STORE_TYPE_NAME}]`);
        }

        return storeTypes[0].Id;
    }


    private getStoreConfigPropertyId(propertyName: string) {
        const querySettings = {
            $filter: {
                equals: {
                    Name: propertyName
                }
            }
        };
        const configProperties = this.storeConfigurationPropertyDAO.findAll(querySettings)
        if (configProperties.length === 0) {
            this.throwError(`Missing store configuration property name [${propertyName}]`);
        }

        if (configProperties.length > 1) {
            this.throwError(`There are [${configProperties.length}] store configuration properties [${propertyName}]`);
        }

        return configProperties[0].Id;
    }

    private getStoreConfig(storeId: number, propertyId: number) {
        const querySettings = {
            $filter: {
                equals: {
                    Store: storeId,
                    Property: propertyId
                }
            }
        };
        const configs = this.storeConfigurationDAO.findAll(querySettings)
        if (configs.length === 0) {
            this.throwError(`Missing store configuration property with id [${propertyId}] for store [${storeId}]`);
        }

        if (configs.length > 1) {
            this.throwError(`There are [${configs.length}] store configuration properties with id [${propertyId}] for store [${storeId}]`);
        }

        return configs[0].Value;
    }

}
