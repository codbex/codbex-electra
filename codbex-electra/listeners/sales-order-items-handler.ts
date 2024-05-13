import { SalesOrderRepository as SalesOrderDAO } from "codbex-electra/gen/dao/sales-orders/SalesOrderRepository";
import { SalesOrderItemRepository as SalesOrderItemDAO, SalesOrderItemEntityOptions, SalesOrderItemEntityEvent } from "codbex-electra/gen/dao/sales-orders/SalesOrderItemRepository";
import { oc_order_totalRepository as OpenCartOrderTotalDAO } from "codbex-electra-opencart/dao/oc_order_totalRepository";
import { StoreConfigDAO } from "codbex-electra/dao/StoreConfigDAO";
import { EntityReferenceDAO } from "codbex-electra/dao/EntityReferenceDAO";
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
    protected readonly storeConfigDAO;
    protected readonly entityReferenceDAO;

    constructor() {
        super(import.meta.url);
        this.salesOrderItemDAO = new SalesOrderItemDAO();
        this.salesOrderDAO = new SalesOrderDAO();
        this.storeConfigDAO = new StoreConfigDAO();
        this.entityReferenceDAO = new EntityReferenceDAO();
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

        const dataSource = this.storeConfigDAO.getOpenCartDataSourceName(salesOrder.Store);
        if (!dataSource) {
            this.logger.debug("Sales order [{}] is not from OpenCart store. Update is not required.", salesOrderId);
            return;
        }
        const openCartOrderTotalDAO = new OpenCartOrderTotalDAO(dataSource!);

        const ocOrderId = this.entityReferenceDAO.getRequiredSalesOrderReferenceReferenceByEntityId(salesOrder.Store, salesOrder.Id).ReferenceIntegerId!;
        openCartOrderTotalDAO.updateOrderShipping(ocOrderId, shipping);
        openCartOrderTotalDAO.updateOrderSubTotal(ocOrderId, subTotal);
        openCartOrderTotalDAO.updateOrderTaxes(ocOrderId, orderTaxes);
        openCartOrderTotalDAO.updateOrderTotal(ocOrderId, salesOrder.Total);
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