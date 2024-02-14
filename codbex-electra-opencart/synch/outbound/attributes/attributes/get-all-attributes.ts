import { AttributeRepository as AttributeDAO } from "../../../../../codbex-electra/gen/dao/Products/AttributeRepository";
import { BaseHandler } from "../../base-handler";
import { StoreEntry } from "../../get-all-relevant-stores";

export function onMessage(message: any) {
    const store: StoreEntry = message.getBody();

    const handler = new GetAllAttributesHandler(store);
    const attributeEntries = handler.handle();

    message.setBody(attributeEntries);
    return message;
}

export interface AttributeEntry {
    readonly attributeId: number;
    readonly store: StoreEntry;
}

class GetAllAttributesHandler extends BaseHandler {
    private readonly store;
    private readonly attributeDAO;

    constructor(store: StoreEntry) {
        super(import.meta.url);
        this.store = store;
        this.attributeDAO = new AttributeDAO();
    }

    handle() {
        const attributes = this.attributeDAO.findAll();
        this.logger.info("Found [{}] attributes which must be replicated to store [{}]", attributes.length, this.store.name);

        const attributeEntries: AttributeEntry[] = [];
        attributes.forEach((attribute) => {
            const attributeGroupEntry = {
                attributeId: attribute.Id,
                store: this.store
            }
            attributeEntries.push(attributeGroupEntry);
        });
        return attributeEntries;
    }
}