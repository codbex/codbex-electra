import { configurations } from '@dirigible/core'

const IMAGE_PROPERTY_NAME = 'image';
const OPEN_CART_URL_CFG_NAME = 'ELECTRA_OPENCART_URL';

function getMandatoryCfg(configName) {
    const configValue = configurations.get(configName);
    if (configValue) {
        return configValue;
    }
    const errorMessage = `Missing mandatory configuration with name [${configName}] `;
    logger.error(errorMessage);
    throw new Error(errorMessage);
}

function modifyImage(body) {
    const imageValue = body.get(IMAGE_PROPERTY_NAME);
    if (imageValue) {
        const openCartURL = getMandatoryCfg(OPEN_CART_URL_CFG_NAME);
        const imageURL = `${openCartURL}/image/${imageValue}`;

        body.put(IMAGE_PROPERTY_NAME, imageURL);
    }
}

exports.onMessage = function (message) {
    const body = message.getCamelMessage().getBody();
    modifyImage(body);

    return message;
};