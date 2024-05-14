import { StoreRepository as StoreDAO } from "codbex-electra/gen/dao/stores/StoreRepository";
import { StoreTypeRepository as StoreTypeDAO } from "codbex-electra/gen/dao/store-types/StoreTypeRepository";
import { StoreConfigurationRepository as StoreConfigurationDAO, StoreConfigurationEntity } from "codbex-electra/gen/dao/stores/StoreConfigurationRepository";
import { StoreConfigurationPropertyRepository as StoreConfigurationPropertyDAO, StoreConfigurationPropertyEntity } from "codbex-electra/gen/dao/store-configurations/StoreConfigurationPropertyRepository";
import { getLogger } from "codbex-electra/util/LoggerUtil";

export interface OpenCartStoreConfig {
    readonly id: number;
    readonly name: string;
    readonly dataSourceName: string;
    readonly url: string;
}

export class StoreConfigDAO {

    private static readonly OPENCART_STORE_TYPE_NAME = "OpenCart";
    private static readonly OPENCART_DATASOURCE_NAME_PROPERTY = "DATASOURCE_NAME";
    private static readonly ECONT_SHOP_SECRET_PROPERTY = "ECONT_SHOP_SECRET";

    private static readonly PROCESSING_ORDER_STATUS_ID_PROPERTY = "PROCESSING_ORDER_STATUS_ID";
    private static readonly COMPLETE_ORDER_STATUS_ID_PROPERTY = "COMPLETE_ORDER_STATUS_ID";
    private static readonly FRAUD_ORDER_STATUS_ID_PROPERTY = "FRAUD_ORDER_STATUS_ID";
    private static readonly PENDING_ORDER_STATUS_ID_PROPERTY = "PENDING_ORDER_STATUS_ID";

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

    public getStoreEcontShopSecret(storeId: number): string {
        return this.getRequiredStoreConfigPropertyByName(storeId, StoreConfigDAO.ECONT_SHOP_SECRET_PROPERTY);
    }

    public getStoreProcessingOrderStatusId(storeId: number): number {
        const value = this.getRequiredStoreConfigPropertyByName(storeId, StoreConfigDAO.PROCESSING_ORDER_STATUS_ID_PROPERTY);
        return Number(value);
    }

    public getStoreCompleteOrderStatusId(storeId: number): number {
        const value = this.getRequiredStoreConfigPropertyByName(storeId, StoreConfigDAO.COMPLETE_ORDER_STATUS_ID_PROPERTY);
        return Number(value);
    }
    public getStoreFraudOrderStatusId(storeId: number): number {
        const value = this.getRequiredStoreConfigPropertyByName(storeId, StoreConfigDAO.FRAUD_ORDER_STATUS_ID_PROPERTY);
        return Number(value);
    }
    public getStorePendingOrderStatusId(storeId: number): number {
        const value = this.getRequiredStoreConfigPropertyByName(storeId, StoreConfigDAO.PENDING_ORDER_STATUS_ID_PROPERTY);
        return Number(value);
    }

    private getRequiredStoreConfigPropertyByName(storeId: number, propertyName: string): string {
        const cfg = this.getStoreConfigPropertyByName(storeId, propertyName);
        if (!cfg) {
            this.throwError(`Missing store configurations for property with name [${propertyName}] and store id [${storeId}].`);
        }
        return cfg!;
    }

    public getOpenCartDataSourceName(storeId: number): string | undefined {
        return this.getStoreConfigPropertyByName(storeId, StoreConfigDAO.OPENCART_DATASOURCE_NAME_PROPERTY);
    }

    private getStoreConfigPropertyByName(storeId: number, propertyName: string): string | undefined {
        const propertyId = this.getStoreConfigPropertyIdByName(propertyName);

        const querySettings = {
            $filter: {
                equals: {
                    Store: storeId,
                    Property: propertyId
                }
            }
        };
        const cfgs = this.storeConfigurationDAO.findAll(querySettings);
        if (cfgs.length === 0) {
            return undefined;
        }

        if (cfgs.length > 1) {
            this.throwError(`Found more than one store configurations for property with name [${propertyName}] and store id [${storeId}].`);
        }
        return cfgs[0].Value;
    }

    private getStoreConfigPropertyIdByName(propertyName: string) {
        const querySettings = {
            $filter: {
                equals: {
                    Name: propertyName
                }
            }
        };
        const cfgProps = this.storeConfigurationPropertyDAO.findAll(querySettings);

        if (cfgProps.length === 0) {
            this.throwError(`Missing store configuration property with name [${propertyName}].`);
        }

        if (cfgProps.length > 1) {
            this.throwError(`Found more than one store configuration properties with name [${propertyName}].`);
        }
        return cfgProps[0].Id;
    }

    public getEnabledOpenCartStoresConfig() {
        const storeEntities = this.getAllEnabledOpenCartStores();
        this.logger.info("Found [{}] OpenCart stores which are enabled", storeEntities.length);

        const cfgProps = this.storeConfigurationPropertyDAO.findAll();
        const dataSourcePropertyId = this.getStoreConfigPropertyId(StoreConfigDAO.OPENCART_DATASOURCE_NAME_PROPERTY, cfgProps);

        const configs: OpenCartStoreConfig[] = [];

        storeEntities.forEach((storeEntity) => {

            const storeConfigs = this.getStoreConfigs(storeEntity.Id);
            const dataSourceName = this.getStoreConfig(dataSourcePropertyId, storeConfigs);

            const cfg = {
                id: storeEntity.Id,
                name: storeEntity.Name,
                dataSourceName: dataSourceName
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

    private getStoreConfigPropertyId(propertyName: string, cfgProps: StoreConfigurationPropertyEntity[]) {
        const foundProperty = cfgProps.find(cfgProperty => propertyName === cfgProperty.Name);
        if (!foundProperty) {
            this.throwError(`Missing store configuration property name [${propertyName}] in props ${JSON.stringify(cfgProps)}`);
        }
        return foundProperty!.Id;
    }

    private getStoreConfigs(storeId: number) {
        const querySettings = {
            $filter: {
                equals: {
                    Store: storeId
                }
            }
        };
        return this.storeConfigurationDAO.findAll(querySettings);
    }

    private getStoreConfig(propertyId: number, storeConfigs: StoreConfigurationEntity[]) {
        const foundPropertyCfg = storeConfigs.find(cfg => propertyId === cfg.Property);
        if (!foundPropertyCfg) {
            this.throwError(`Missing store configuration property with id [${propertyId}] in [${JSON.stringify(storeConfigs)}]`);
        }
        return foundPropertyCfg!.Value;
    }

    private throwError(errorMessage: string) {
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
    }

}