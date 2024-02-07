import * as attributeGroupDAO from "/codbex-electra/gen/dao/Products/AttributeGroup";
import { getLogger } from "/codbex-electra/util/logger-util.mjs";

const logger = getLogger(import.meta.url);

export function onMessage(message) {
    const store = message.getBody();

    const attributeGroups = attributeGroupDAO.list();
    logger.info("Found [{}] attribute groups which must be replicated to store [{}]", attributeGroups.length, store.name);

    const attributeGroupEntries = [];
    attributeGroups.forEach((attributeGroup) => {
        const attributeGroupEntry = {
            attributeGroup: attributeGroup,
            store: store
        }
        attributeGroupEntries.push(attributeGroupEntry);
    });

    message.setBody(attributeGroupEntries);
    return message;
}
