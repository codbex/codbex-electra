import * as attributeDAO from "/codbex-electra/gen/dao/Products/Attribute";
import { getLogger } from "/codbex-electra/util/logger-util.mjs";

const logger = getLogger(import.meta.url);

export function onMessage(message) {
    const store = message.getBody();

    const attributes = attributeDAO.list();
    logger.info("Found [{}] attributes which must be replicated to store [{}]", attributes.length, store.name);

    const attributeEntries = [];
    attributes.forEach((attribute) => {
        const attributeGroupEntry = {
            attribute: attribute,
            store: store
        }
        attributeEntries.push(attributeGroupEntry);
    });

    message.setBody(attributeEntries);
    return message;
}
