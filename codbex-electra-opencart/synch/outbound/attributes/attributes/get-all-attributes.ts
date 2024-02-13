import { AttributeRepository as AttributeDAO } from "../../../../../codbex-electra/gen/dao/Products/AttributeRepository";
import { getLogger } from "../../../../../codbex-electra/util/LoggerUtil";

const logger = getLogger(import.meta.url);

export function onMessage(message: any) {
    const store = message.getBody();

    const attributeDAO = new AttributeDAO();

    const attributes = attributeDAO.findAll();
    logger.info("Found [{}] attributes which must be replicated to store [{}]", attributes.length, store.name);

    const attributeEntries: any[] = [];
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
