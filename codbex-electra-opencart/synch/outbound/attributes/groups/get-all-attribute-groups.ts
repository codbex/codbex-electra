import { AttributeGroupRepository as AttributeGroupDAO } from "../../../../../codbex-electra/gen/dao/Products/AttributeGroupRepository";
import { getLogger } from "../../../../../codbex-electra/util/LoggerUtil";

const logger = getLogger(import.meta.url);

export function onMessage(message: any) {
    const store = message.getBody();

    const attributeGroupDAO = new AttributeGroupDAO();

    const attributeGroups = attributeGroupDAO.findAll();
    logger.info("Found [{}] attribute groups which must be replicated to store [{}]", attributeGroups.length, store.name);

    const attributeGroupEntries: any = [];
    attributeGroups.forEach((attributeGroup: any) => {
        const attributeGroupEntry = {
            attributeGroup: attributeGroup,
            store: store
        }
        attributeGroupEntries.push(attributeGroupEntry);
    });

    message.setBody(attributeGroupEntries);
    return message;
}
