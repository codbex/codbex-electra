import { SalesOrderRepository as SalesOrderDAO } from "codbex-electra/gen/dao/sales-orders/SalesOrderRepository";
import { SalesOrderItemRepository as SalesOrderItemDAO, SalesOrderItemEntityOptions, SalesOrderItemEntityEvent } from "codbex-electra/gen/dao/sales-orders/SalesOrderItemRepository";
import { BaseHandler } from "codbex-electra/listeners/base-handler";

export function onMessage(message: string) {
    const event: SalesOrderItemEntityEvent = JSON.parse(message);

    const salesOrderUpdater = new SalesOrderUpdater();
    salesOrderUpdater.update(event);

}

export function onError(error: string) {
    // nothing to do here
}

class SalesOrderUpdater extends BaseHandler {
    protected readonly salesOrderItemDAO;
    protected readonly salesOrderDAO;

    constructor() {
        super(import.meta.url);
        this.salesOrderItemDAO = new SalesOrderItemDAO();
        this.salesOrderDAO = new SalesOrderDAO();
    }

    update(event: SalesOrderItemEntityEvent) {
        const salesOrderId = event.entity.SalesOrder;
        if (!salesOrderId) {
            this.throwError("Missing sales order id in event " + JSON.stringify(event));
        }
        const salesOrder = this.salesOrderDAO.findById(salesOrderId!)!;

        const orderItems = this.getOrderItems(salesOrder.Id);

        // TODO shipping needs to be recalculated if there is change
        // a call of order update or create to econt needs to be made to get the new shipping
        const shipping = salesOrder.Shipping;

        let subTotal = 0;
        let orderTaxes = 0;

        orderItems.forEach(orderItem => {
            subTotal += orderItem.Total;

            // in OpenCart taxes has value for only one item not for the total
            const itemsTaxes = orderItem.Quantity * orderItem.Tax;
            orderTaxes += itemsTaxes;
        });

        salesOrder.SubTotal = subTotal;
        salesOrder.Tax = orderTaxes;
        salesOrder.Shipping = shipping;
        salesOrder.Total = subTotal + orderTaxes + shipping;

        this.salesOrderDAO.update(salesOrder);

    }

    private getOrderItems(orderId: number) {
        const querySettings: SalesOrderItemEntityOptions = {
            $select: ["Quantity", "Tax", "Total"],
            $filter: {
                equals: {
                    SalesOrder: orderId
                }
            }
        };
        return this.salesOrderItemDAO.findAll(querySettings);
    }
}