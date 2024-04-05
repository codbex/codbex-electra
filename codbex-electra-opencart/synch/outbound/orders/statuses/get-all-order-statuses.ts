import { OrderStatusRepository as OrderStatusDAO, OrderStatusEntityOptions } from "codbex-electra/gen/dao/Settings/OrderStatusRepository";
import { OpenCartStoreConfig } from "codbex-electra-opencart/dao/StoreConfigDAO";
import { BaseHandler } from "codbex-electra-opencart/synch/base-handler";

export function onMessage(message: any) {
    const store: OpenCartStoreConfig = message.getBody();

    const handler = new GetOrderStatusesHandler(store);
    const orderStatusEntries = handler.handle();

    message.setBody(orderStatusEntries);
    return message;
}

export interface OrderStatusEntry {
    readonly orderStatusId: number;
    readonly store: OpenCartStoreConfig;
}

class GetOrderStatusesHandler extends BaseHandler {
    private readonly store;
    private readonly orderStatusDAO;

    constructor(store: OpenCartStoreConfig) {
        super(import.meta.url);
        this.store = store;
        this.orderStatusDAO = new OrderStatusDAO();
    }

    handle() {
        const querySettings: OrderStatusEntityOptions = {
            $select: ["Id"]
        };
        const orderStatuses = this.orderStatusDAO.findAll(querySettings);
        this.logger.info("Found [{}] order statuses which must be replicated to store [{}]", orderStatuses.length, this.store.name);

        const entries: OrderStatusEntry[] = [];
        orderStatuses.forEach((orderStatus) => {
            const entry = {
                orderStatusId: orderStatus.Id,
                store: this.store
            }
            entries.push(entry);
        });
        return entries;
    }
}