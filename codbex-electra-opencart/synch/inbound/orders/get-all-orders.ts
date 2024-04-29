import { OpenCartStoreConfig } from "codbex-electra-opencart/dao/StoreConfigDAO";
import { BaseHandler } from "codbex-electra-opencart/synch/base-handler";
import { oc_orderRepository as OpenCartOrderDAO, oc_orderEntityOptions } from "codbex-electra-opencart/dao/oc_orderRepository";

export function onMessage(message: any) {
    const store: OpenCartStoreConfig = message.getBody();

    const handler = new GetOrdersHandler(store);
    const languageEntries = handler.handle();

    message.setBody(languageEntries);
    return message;
}

export interface OrderEntry {
    readonly ocOrderId: number;
    readonly store: OpenCartStoreConfig;
}

class GetOrdersHandler extends BaseHandler {
    private readonly store;
    private readonly ocOrderDAO;

    constructor(store: OpenCartStoreConfig) {
        super(import.meta.url);
        this.store = store;
        this.ocOrderDAO = new OpenCartOrderDAO(store.dataSourceName);
    }

    handle() {
        const querySettings: oc_orderEntityOptions = {
            $select: ["order_id"]
        };
        const orders = this.ocOrderDAO.findAll(querySettings);
        this.logger.info("Found [{}] orders which must be replicated from store [{}]", orders.length, this.store.name);

        const orderEntries: OrderEntry[] = [];
        orders.forEach((order) => {
            const orderEntry = {
                ocOrderId: order.order_id,
                store: this.store
            }
            orderEntries.push(orderEntry);
        });
        return orderEntries;
    }
}
