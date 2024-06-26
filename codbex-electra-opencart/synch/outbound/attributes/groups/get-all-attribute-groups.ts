import { AttributeGroupRepository as AttributeGroupDAO, AttributeGroupEntityOptions } from "codbex-electra/gen/dao/attribute-groups/AttributeGroupRepository";
import { BaseHandler } from "codbex-electra-opencart/synch/base-handler";
import { OpenCartStoreConfig } from "codbex-electra/dao/StoreConfigDAO";

export function onMessage(message: any) {
    const store: OpenCartStoreConfig = message.getBody();

    const handler = new GetAllAttributeGroupsHandler(store);
    const attributeGroupEntries = handler.handle();

    message.setBody(attributeGroupEntries);
    return message;
}

export interface AttributeGroupEntry {
    readonly attributeGroupId: number;
    readonly store: OpenCartStoreConfig;
}

class GetAllAttributeGroupsHandler extends BaseHandler {
    private readonly store;
    private readonly attributeGroupDAO;

    constructor(store: OpenCartStoreConfig) {
        super(import.meta.url);
        this.store = store;
        this.attributeGroupDAO = new AttributeGroupDAO();
    }

    handle() {
        const querySettings: AttributeGroupEntityOptions = {
            $select: ["Id"]
        };
        const attributeGroups = this.attributeGroupDAO.findAll(querySettings);
        this.logger.info("Found [{}] attribute groups which must be replicated to store [{}]", attributeGroups.length, this.store.name);

        const attributeGroupEntries: AttributeGroupEntry[] = [];
        attributeGroups.forEach((attributeGroup: any) => {
            const attributeGroupEntry = {
                attributeGroupId: attributeGroup.Id,
                store: this.store
            }
            attributeGroupEntries.push(attributeGroupEntry);
        });
        return attributeGroupEntries;
    }
}
