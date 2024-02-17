import { EntityReferenceDAO } from "../../../../codbex-electra/dao/EntityReferenceDAO";
import { SalesOrderRepository as SalesOrderDAO, SalesOrderCreateEntity } from "../../../../codbex-electra/gen/dao/SalesOrders/SalesOrderRepository";
import { oc_orderRepository as OpenCartOrderDAO, oc_orderEntity } from "../../../dao/oc_orderRepository";

import { BaseHandler } from "../../base-handler";
import { OrderEntry } from "./get-all-orders";

export function onMessage(message: any) {
    const orderEntry: OrderEntry = message.getBody();

    const handler = new MergeCustomerFromOpenCart(orderEntry);
    handler.handle();

    return message;
}

class MergeCustomerFromOpenCart extends BaseHandler {
    private readonly orderEntry;
    private readonly entityReferenceDAO;
    private readonly salesOrderDAO;
    private readonly ocOrderDAO;

    constructor(orderEntry: OrderEntry) {
        super(import.meta.url);
        this.orderEntry = orderEntry;
        this.entityReferenceDAO = new EntityReferenceDAO();
        this.salesOrderDAO = new SalesOrderDAO();
        this.ocOrderDAO = new OpenCartOrderDAO(orderEntry.store.dataSourceName);
    }

    handle() {
        const ocOrderId = this.orderEntry.ocOrderId;
        const storeId = this.orderEntry.store.id;

        const ocOrder = this.ocOrderDAO.findById(ocOrderId)!;
        const orderReference = this.entityReferenceDAO.getOrderReferenceByReferenceId(storeId, ocOrderId);

        if (orderReference) {
            // not needed to be recreated
            return;
        }

        const salesOrder = this.createSalesOrderEntity(ocOrder);
        const salesOrderId = this.salesOrderDAO.create(salesOrder);

        this.entityReferenceDAO.createSalesOrderReference(storeId, salesOrderId, ocOrderId);

        //TODO create SalesOrderShipping, SalesOrderItems and SalesOrderPayment 
    }

    private createSalesOrderEntity(ocOrder: oc_orderEntity): SalesOrderCreateEntity {
        const storeId = this.orderEntry.store.id;
        const currencyId = this.entityReferenceDAO.getRequiredCurrencyReferenceByReferenceId(storeId, ocOrder.currency_id).EntityIntegerId!;
        const languageId = this.entityReferenceDAO.getRequiredLanguageReferenceByReferenceId(storeId, ocOrder.language_id).EntityIntegerId!;
        const customerId = this.entityReferenceDAO.getRequiredCustomerReferenceByReferenceId(storeId, ocOrder.customer_id).EntityIntegerId!;
        const orderStatusId = this.entityReferenceDAO.getRequiredOrderStatusReferenceByReferenceId(storeId, ocOrder.order_status_id).EntityIntegerId!;

        return {
            Total: ocOrder.total,
            Currency: currencyId,
            Status: orderStatusId,
            Store: storeId,
            Customer: customerId,
            Tracking: ocOrder.tracking,
            Comment: ocOrder.comment,
            InvoiceNumber: ocOrder.invoice_no,
            InvoicePrefix: ocOrder.invoice_prefix,
            Language: languageId

        };

    }
}
