import { AttributeRepository as AttributeDAO, AttributeEntityOptions } from "codbex-electra/gen/dao/product-attributes/AttributeRepository";
import { BaseHandler } from "codbex-electra-opencart/synch/base-handler";
import { OpenCartStoreConfig } from "codbex-electra-opencart/dao/StoreConfigDAO";

export function onMessage(message: any) {
    const store: OpenCartStoreConfig = message.getBody();

    const handler = new GetAllAttributesHandler(store);
    const attributeEntries = handler.handle();

    message.setBody(attributeEntries);
    return message;
}

export interface AttributeEntry {
    readonly attributeId: number;
    readonly store: OpenCartStoreConfig;
}

class GetAllAttributesHandler extends BaseHandler {
    private readonly store;
    private readonly attributeDAO;

    constructor(store: OpenCartStoreConfig) {
        super(import.meta.url);
        this.store = store;
        this.attributeDAO = new AttributeDAO();
    }

    handle() {
        const querySettings: AttributeEntityOptions = {
            $select: ["Id"]
        };
        const attributes = this.attributeDAO.findAll(querySettings);
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
