import { SalesOrderRepository as SalesOrderDAO, SalesOrderEntity } from "codbex-electra/gen/dao/sales-orders/SalesOrderRepository";
import { SalesOrderItemRepository as SalesOrderItemDAO, SalesOrderItemEntityOptions, SalesOrderItemEntity, SalesOrderItemUpdateEntityEvent, SalesOrderItemEntityEvent } from "codbex-electra/gen/dao/sales-orders/SalesOrderItemRepository";
import { BaseHandler } from "codbex-electra/listeners/base-handler";
import { getLogger } from "codbex-electra/util/LoggerUtil";

const logger = getLogger(import.meta.url);

export function onMessage(message: string) {
    const event: SalesOrderItemEntityEvent = JSON.parse(message);

    const salesOrderUpdater = new SalesOrderUpdater();
    const operation = event.operation;

    switch (operation) {
        case "create":
            salesOrderUpdater.update(Operation.CREATE, event);
            break;
        case "delete":
            salesOrderUpdater.update(Operation.DELETE, event);
            break;
        case "update":
            salesOrderUpdater.update(Operation.UPDATE, event);
            break;
        default:
            logger.info("Event message [{}] is not applicable for this listener", message);
            break;
    }
}

export function onError(error: string) {
    // nothing to do here
}
enum Operation {
    CREATE,
    UPDATE,
    DELETE
}

class SalesOrderUpdater extends BaseHandler {
    protected readonly salesOrderItemDAO;
    protected readonly salesOrderDAO;

    constructor() {
        super(import.meta.url);
        this.salesOrderItemDAO = new SalesOrderItemDAO();
        this.salesOrderDAO = new SalesOrderDAO();
    }

    update(operation: Operation, event: SalesOrderItemEntityEvent) {
        const salesOrderId = event.entity.SalesOrder;
        if (!salesOrderId) {
            this.throwError("Missing sales order id in event " + JSON.stringify(event));
        }
        const salesOrder = this.salesOrderDAO.findById(salesOrderId!);
        this.updateOrderTotal(salesOrder!);

        // if (operation === Operation.CREATE) {
        //     logger.info("!!! This is a CREATE. Sales order: {}", salesOrder);
        // }

        // if (operation === Operation.DELETE) {
        //     logger.info("!!! This is a DELETE. Sales order: {}", salesOrder);
        // }

        // if (operation === Operation.UPDATE) {
        //     logger.info("!!! This is a UPDATE. Sales order: {}", salesOrder);
        // }
    }

    private updateOrderTotal(salesOrder: SalesOrderEntity) {
        const orderItems = this.getOrderItems(salesOrder.Id);

        let newTotal = 0;
        orderItems.forEach(orderItem => {
            const itemTotal = orderItem.Quantity * orderItem.Price;
            newTotal += itemTotal;
        });

        salesOrder.Total = newTotal;
        this.salesOrderDAO.update(salesOrder);
    }

    private getOrderItems(orderId: number) {
        const querySettings: SalesOrderItemEntityOptions = {
            $select: ["Quantity", "Price"],
            $filter: {
                equals: {
                    SalesOrder: orderId
                }
            }
        };
        return this.salesOrderItemDAO.findAll(querySettings);
    }
}