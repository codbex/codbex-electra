import { StoreRepository as StoreDAO } from "../../codbex-electra/gen/dao/Stores/StoreRepository";
import { StoreTypeRepository as StoreTypeDAO } from "../../codbex-electra/gen/dao/Stores/StoreTypeRepository";
import { StoreConfigurationRepository as StoreConfigurationDAO } from "../../codbex-electra/gen/dao/Stores/StoreConfigurationRepository";
import { StoreConfigurationPropertyRepository as StoreConfigurationPropertyDAO } from "../../codbex-electra/gen/dao/Stores/StoreConfigurationPropertyRepository";
import { getLogger } from "../../codbex-electra/util/LoggerUtil";

export interface OpenCartStoreConfig {
    readonly id: number;
    readonly name: string;
    readonly dataSourceName: string;
    readonly url: string;
}

export class StoreConfigDAO {

    private static readonly OPENCART_STORE_TYPE_NAME = "OpenCart";
    private static readonly OPENCART_DATASOURCE_NAME_PROPERTY = "DATASOURCE_NAME";
    private static readonly OPENCART_URL_PROPERTY = "URL";

    private readonly logger;
    private readonly storeDAO;
    private readonly storeConfigurationDAO;
    private readonly storeConfigurationPropertyDAO;
    private readonly storeTypeDAO;

    constructor() {
        this.logger = getLogger(import.meta.url);
        this.storeDAO = new StoreDAO();
        this.storeConfigurationDAO = new StoreConfigurationDAO();
        this.storeConfigurationPropertyDAO = new StoreConfigurationPropertyDAO();
        this.storeTypeDAO = new StoreTypeDAO();
    }

    public getEnabledOpenCartStoresConfig() {
        const storeEntities = this.getAllEnabledOpenCartStores();
        this.logger.info("Found [{}] OpenCart stores which are enabled", storeEntities.length);

        const dataSourcePropertyId = this.getStoreConfigPropertyId(StoreConfigDAO.OPENCART_DATASOURCE_NAME_PROPERTY);
        const urlPropertyId = this.getStoreConfigPropertyId(StoreConfigDAO.OPENCART_URL_PROPERTY);

        const configs: OpenCartStoreConfig[] = [];

        storeEntities.forEach((storeEntity) => {
            const dataSourceName = this.getStoreConfig(storeEntity.Id, dataSourcePropertyId);
            const url = this.getStoreConfig(storeEntity.Id, urlPropertyId);

            const cfg = {
                id: storeEntity.Id,
                name: storeEntity.Name,
                dataSourceName: dataSourceName,
                url: url
            };
            configs.push(cfg);
        });

        return configs;
    }

    private getAllEnabledOpenCartStores() {
        const storeTypeId = this.getOpenCartStoreTypeId();

        const querySettings = {
            $filter: {
                equals: {
                    Type: storeTypeId,
                    Enabled: true
                }
            }
        };
        return this.storeDAO.findAll(querySettings);
    }

    private getOpenCartStoreTypeId() {
        const querySettings = {
            $filter: {
                equals: {
                    Name: StoreConfigDAO.OPENCART_STORE_TYPE_NAME
                }
            }
        };
        const storeTypes = this.storeTypeDAO.findAll(querySettings);

        if (storeTypes.length === 0) {
            this.throwError(`Missing store type with name [${StoreConfigDAO.OPENCART_STORE_TYPE_NAME}]`);
        }

        if (storeTypes.length > 1) {
            this.throwError(`There are [${storeTypes.length}] store types with name [${StoreConfigDAO.OPENCART_STORE_TYPE_NAME}]`);
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

    private throwError(errorMessage: string) {
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
    }

}