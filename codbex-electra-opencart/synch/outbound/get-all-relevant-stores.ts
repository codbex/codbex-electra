import { StoreRepository } from "../../../codbex-electra/gen/dao/Stores/StoreRepository";
import { StoreTypeRepository } from "../../../codbex-electra/gen/dao/Stores/StoreTypeRepository";
import { StoreConfigurationRepository } from "../../../codbex-electra/gen/dao/Stores/StoreConfigurationRepository";
import { StoreConfigurationPropertyRepository } from "../../../codbex-electra/gen/dao/Stores/StoreConfigurationPropertyRepository";
import { getLogger } from "../../../codbex-electra/util/LoggerUtil";

const OPENCART_STORE_TYPE_NAME = "OpenCart";
const OPENCART_DATASOURCE_NAME_PROPERTY = "DATASOURCE_NAME";
const OPENCART_URL_PROPERTY = "URL";

const logger = getLogger(import.meta.url);

export function onMessage(message: any) {
    const storeTypeId = getOpenCartStoreTypeId();
    const storeEntities = getAllEnabledStores(storeTypeId);
    logger.info("Found [{}] OpenCart stores which are enabled", storeEntities.length);

    const dataSourcePropertyId = getStoreConfigPropertyId(OPENCART_DATASOURCE_NAME_PROPERTY);
    const urlPropertyId = getStoreConfigPropertyId(OPENCART_URL_PROPERTY);

    const stores: any[] = [];

    storeEntities.forEach((storeEntity) => {
        const dataSourceName = getStoreConfig(storeEntity.Id, dataSourcePropertyId);
        const url = getStoreConfig(storeEntity.Id, urlPropertyId);
        const store = {
            id: storeEntity.Id,
            name: storeEntity.Name,
            dataSourceName: dataSourceName,
            url: url
        };
        stores.push(store);
    });

    message.setBody(stores);
    return message;
}

function getOpenCartStoreTypeId() {
    const querySettings = {
        $filter: {
            equals: {
                Name: OPENCART_STORE_TYPE_NAME
            }
        }
    };
    const storeTypeDAO = new StoreTypeRepository();
    const storeTypes = storeTypeDAO.findAll(querySettings);

    if (storeTypes.length === 0) {
        throwError(`Missing store type with name [${OPENCART_STORE_TYPE_NAME}]`);
    }

    if (storeTypes.length > 1) {
        throwError(`There are [${storeTypes.length}] store types with name [${OPENCART_STORE_TYPE_NAME}]`);
    }

    return storeTypes[0].Id;
}


function getAllEnabledStores(storeTypeId: number) {
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

function getStoreConfigPropertyId(propertyName: string) {
    const querySettings = {
        $filter: {
            equals: {
                Name: propertyName
            }
        }
    };
    const storeConfigurationPropertyDAO = new StoreConfigurationPropertyRepository();
    const configProperties = storeConfigurationPropertyDAO.findAll(querySettings)
    if (configProperties.length === 0) {
        throwError(`Missing store configuration property name [${propertyName}]`);
    }

    if (configProperties.length > 1) {
        throwError(`There are [${configProperties.length}] store configuration properties [${propertyName}]`);
    }

    return configProperties[0].Id;
}

function getStoreConfig(storeId: number, propertyId: number) {
    const querySettings = {
        $filter: {
            equals: {
                Store: storeId,
                Property: propertyId
            }
        }
    };
    const storeConfigurationDAO = new StoreConfigurationRepository();
    const configs = storeConfigurationDAO.findAll(querySettings)
    if (configs.length === 0) {
        throwError(`Missing store configuration property with id [${propertyId}] for store [${storeId}]`);
    }

    if (configs.length > 1) {
        throwError(`There are [${configs.length}] store configuration properties with id [${propertyId}] for store [${storeId}]`);
    }

    return configs[0].Value;
}

function throwError(errorMessage: string) {
    logger.error(errorMessage);
    throw new Error(errorMessage);
} 
