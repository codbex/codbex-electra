import { AttributeGroupRepository as AttributeGroupDAO, AttributeGroupEntityOptions } from "../../../../../codbex-electra/gen/dao/Products/AttributeGroupRepository";
import { BaseHandler } from "../../../base-handler";
import { StoreEntry } from "../../../get-all-relevant-stores";

export function onMessage(message: any) {
    const store: StoreEntry = message.getBody();

    const handler = new GetAllAttributeGroupsHandler(store);
    const attributeGroupEntries = handler.handle();

    message.setBody(attributeGroupEntries);
    return message;
}

export interface AttributeGroupEntry {
    readonly attributeGroupId: number;
    readonly store: StoreEntry;
}

class GetAllAttributeGroupsHandler extends BaseHandler {
    private readonly store;
    private readonly attributeGroupDAO;

    constructor(store: StoreEntry) {
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
