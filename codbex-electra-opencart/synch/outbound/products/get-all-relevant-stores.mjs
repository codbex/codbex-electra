import { getLogger } from "/codbex-electra/util/logger-util.mjs";
import * as storeDAO from "/codbex-electra/gen/dao/Stores/Store";
import * as storeTypeDAO from "/codbex-electra/gen/dao/Stores/StoreType";
import * as storeConfigurationDAO from "/codbex-electra/gen/dao/Stores/StoreConfiguration";
import * as storeConfigurationPropertyDAO from "/codbex-electra/gen/dao/Stores/StoreConfigurationProperty";

const OPENCART_STORE_TYPE_NAME = "OpenCart";
const OPENCART_DATASOURCE_NAME_PROPERTY = "DATASOURCE_NAME";
const OPENCART_URL_PROPERTY = "URL";

const logger = getLogger(import.meta.url);

export function onMessage(message) {
    const storeTypeId = getOpenCartStoreTypeId();
    const storeEntities = getAllEnabledStores(storeTypeId);
    logger.info("Found [{}] OpenCart stores which are enabled", storeEntities.length);

    const dataSourcePropertyId = getStoreConfigPropertyId(OPENCART_DATASOURCE_NAME_PROPERTY);
    const urlPropertyId = getStoreConfigPropertyId(OPENCART_URL_PROPERTY);

    const stores = [];

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
        Name: OPENCART_STORE_TYPE_NAME
    };
    const storeTypes = storeTypeDAO.list(querySettings);

    if (storeTypes.length === 0) {
        throwError(`Missing store type with name [${OPENCART_STORE_TYPE_NAME}]`);
    }

    if (storeTypes.length > 1) {
        throwError(`There are [${storeTypes.length}] store types with name [${OPENCART_STORE_TYPE_NAME}]`);
    }

    return storeTypes[0].Id;
}


function getAllEnabledStores(storeTypeId) {
    const querySettings = {
        Type: storeTypeId,
        Enabled: true
    };

    return storeDAO.list(querySettings);
}

function getStoreConfigPropertyId(propertyName) {
    const querySettings = {
        Name: propertyName
    };
    const configProperties = storeConfigurationPropertyDAO.list(querySettings)
    if (configProperties.length === 0) {
        throwError(`Missing store configuration property name [${propertyName}]`);
    }

    if (configProperties.length > 1) {
        throwError(`There are [${configProperties.length}] store configuration properties [${propertyName}]`);
    }

    return configProperties[0].Id;
}

function getStoreConfig(storeId, propertyId) {
    const querySettings = {
        Store: storeId,
        Property: propertyId
    };
    const configs = storeConfigurationDAO.list(querySettings)
    if (configs.length === 0) {
        throwError(`Missing store configuration property with id [${propertyId}] for store [${storeId}]`);
    }

    if (configs.length > 1) {
        throwError(`There are [${configs.length}] store configuration properties with id [${propertyId}] for store [${storeId}]`);
    }

    return configs[0].Value;
}

function throwError(errorMessage) {
    logger.error(errorMessage);
    throw new Error(errorMessage);
}
