import { SalesOrderRepository as SalesOrderDAO, SalesOrderEntityOptions } from "../../../../codbex-electra/gen/dao/SalesOrders/SalesOrderRepository";
import { StoreEntry } from "../../get-all-relevant-stores";
import { BaseHandler } from "../../base-handler";

export function onMessage(message: any) {
    const store: StoreEntry = message.getBody();

    const handler = new GetSalesOrdersHandler(store);
    const orderEntries = handler.handle();

    message.setBody(orderEntries);
    return message;
}

export interface OrderEntry {
    readonly orderId: number;
    readonly store: StoreEntry;
}

class GetSalesOrdersHandler extends BaseHandler {
    private readonly store;
    private readonly orderDAO;

    constructor(store: StoreEntry) {
        super(import.meta.url);
        this.store = store;
        this.orderDAO = new SalesOrderDAO();
    }

    handle() {
        const querySettings: SalesOrderEntityOptions = {
            $filter: {
                equals: {
                    Store: this.store.id
                }
            },
            $select: ["Id"]
        };
        const orders = this.orderDAO.findAll(querySettings);
        this.logger.info("Found [{}] orders which must be replicated to store [{}]", orders.length, this.store.name);

        const entries: OrderEntry[] = [];
        orders.forEach((order) => {
            const entry = {
                orderId: order.Id,
                store: this.store
            }
            entries.push(entry);
        });
        return entries;
    }
}