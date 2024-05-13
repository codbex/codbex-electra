import { EntityReferenceDAO } from "codbex-electra/dao/EntityReferenceDAO";
import { SalesOrderRepository as SalesOrderDAO, SalesOrderCreateEntity } from "codbex-electra/gen/dao/sales-orders/SalesOrderRepository";
import { SalesOrderItemRepository as SalesOrderItemDAO, SalesOrderItemCreateEntity } from "codbex-electra/gen/dao/sales-orders/SalesOrderItemRepository";
import { SalesOrderShippingRepository as SalesOrderShippingDAO, SalesOrderShippingCreateEntity } from "codbex-electra/gen/dao/sales-orders/SalesOrderShippingRepository";
import { SalesOrderPaymentRepository as SalesOrderPaymentDAO, SalesOrderPaymentCreateEntity } from "codbex-electra/gen/dao/sales-orders/SalesOrderPaymentRepository";
import { oc_orderRepository as OpenCartOrderDAO, oc_orderEntity } from "codbex-electra-opencart/dao/oc_orderRepository";
import { oc_order_productRepository as OpenCartOrderProductDAO, oc_order_productEntity, oc_order_productEntityOptions } from "codbex-electra-opencart/dao/oc_order_productRepository";
import { oc_order_totalRepository as OpenCartOrderTotalDAO, oc_order_totalEntityOptions, oc_order_totalEntity } from "codbex-electra-opencart/dao/oc_order_totalRepository";

import { BaseHandler } from "codbex-electra-opencart/synch/base-handler";
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
    private readonly salesOrderItemDAO;
    private readonly salesOrderShippingDAO;
    private readonly salesOrderPaymentDAO;
    private readonly ocOrderDAO;
    private readonly ocOrderProductDAO;
    private readonly openCartOrderTotalDAO;

    constructor(orderEntry: OrderEntry) {
        super(import.meta.url);
        this.orderEntry = orderEntry;
        this.entityReferenceDAO = new EntityReferenceDAO();
        this.salesOrderDAO = new SalesOrderDAO();
        this.salesOrderItemDAO = new SalesOrderItemDAO();
        this.salesOrderShippingDAO = new SalesOrderShippingDAO();
        this.salesOrderPaymentDAO = new SalesOrderPaymentDAO();

        const dataSourceName = orderEntry.store.dataSourceName;
        this.ocOrderDAO = new OpenCartOrderDAO(dataSourceName);
        this.ocOrderProductDAO = new OpenCartOrderProductDAO(dataSourceName);
        this.openCartOrderTotalDAO = new OpenCartOrderTotalDAO(dataSourceName);
    }

    handle() {
        const ocOrderId = this.orderEntry.ocOrderId;
        const storeId = this.orderEntry.store.id;

        const orderReference = this.entityReferenceDAO.getOrderReferenceByReferenceId(storeId, ocOrderId);

        if (orderReference && this.salesOrderDAO.findById(orderReference.EntityIntegerId!)) {
            // not needed to be recreated - sync only once
            return;
        }

        const ocOrder = this.ocOrderDAO.findById(ocOrderId)!;

        const salesOrder = this.createSalesOrderEntity(ocOrder);
        const salesOrderId = this.salesOrderDAO.create(salesOrder);

        this.entityReferenceDAO.createSalesOrderReference(storeId, salesOrderId, ocOrderId);

        const salesOrderShipping = this.createSalesOrderShippingEntity(ocOrder, salesOrderId);
        this.salesOrderShippingDAO.create(salesOrderShipping);

        const salesOrderPayment = this.createSalesOrderPaymentEntity(ocOrder, salesOrderId);
        this.salesOrderPaymentDAO.create(salesOrderPayment);

        this.createSalesOrderItems(ocOrderId, salesOrderId);
    }

    private createSalesOrderEntity(ocOrder: oc_orderEntity): SalesOrderCreateEntity {
        const storeId = this.orderEntry.store.id;
        const currencyId = this.entityReferenceDAO.getRequiredCurrencyReferenceByReferenceId(storeId, ocOrder.currency_id).EntityIntegerId!;
        const languageId = this.entityReferenceDAO.getRequiredLanguageReferenceByReferenceId(storeId, ocOrder.language_id).EntityIntegerId!;
        const customerId = this.entityReferenceDAO.getRequiredCustomerReferenceByReferenceId(storeId, ocOrder.customer_id).EntityIntegerId!;
        const orderStatusId = this.entityReferenceDAO.getRequiredOrderStatusReferenceByReferenceId(storeId, ocOrder.order_status_id).EntityIntegerId!;

        const totals = this.getOpenCartOrderTotals(ocOrder.order_id);

        const tax = this.getTaxes(totals);
        const shipping = this.getShippings(totals);
        const subTotal = this.getSubTotal(totals);

        return {
            Total: ocOrder.total,
            Tax: tax,
            Shipping: shipping,
            SubTotal: subTotal,
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

    private getOpenCartOrderTotals(orderId: number) {
        const querySettings: oc_order_totalEntityOptions = {
            $select: ["code", "value"],
            $filter: {
                equals: {
                    order_id: orderId
                }
            }
        };
        return this.openCartOrderTotalDAO.findAll(querySettings);
    }

    private getSubTotal(totals: oc_order_totalEntity[]): number {
        return this.getTotalsSum(totals, OpenCartOrderTotalDAO.SUBTOTAL_CODE);
    }

    private getShippings(totals: oc_order_totalEntity[]): number {
        return this.getTotalsSum(totals, OpenCartOrderTotalDAO.SHIPPING_CODE);
    }

    private getTaxes(totals: oc_order_totalEntity[]): number {
        return this.getTotalsSum(totals, OpenCartOrderTotalDAO.TAX_CODE);
    }

    private getTotalsSum(totals: oc_order_totalEntity[], matchingCode: string): number {
        let total = 0;

        totals.forEach(totalEntity => {
            if (totalEntity.code === matchingCode) {
                total += totalEntity.value;
            }
        });
        return total;
    }

    private createSalesOrderShippingEntity(ocOrder: oc_orderEntity, salesOrderId: number): SalesOrderShippingCreateEntity {

        const countryId = this.entityReferenceDAO.getRequiredCountryReferenceByReferenceId(this.orderEntry.store.id, ocOrder.shipping_country_id).EntityIntegerId!;
        const zoneId = this.entityReferenceDAO.getRequiredZoneReferenceByReferenceId(this.orderEntry.store.id, ocOrder.shipping_zone_id).EntityIntegerId!;
        return {
            SalesOrder: salesOrderId,
            Address1: ocOrder.shipping_address_1,
            Address2: ocOrder.shipping_address_2,
            AddressFormat: ocOrder.shipping_address_format,
            City: ocOrder.shipping_city,
            Code: ocOrder.shipping_code,
            Company: ocOrder.shipping_company,
            Country: countryId,
            CustomField: ocOrder.shipping_custom_field,
            FirstName: ocOrder.shipping_firstname,
            LastName: ocOrder.shipping_lastname,
            Method: ocOrder.shipping_method,
            Postcode: ocOrder.shipping_postcode,
            Zone: zoneId
        }
    }

    private createSalesOrderPaymentEntity(ocOrder: oc_orderEntity, salesOrderId: number): SalesOrderPaymentCreateEntity {

        const countryId = this.entityReferenceDAO.getRequiredCountryReferenceByReferenceId(this.orderEntry.store.id, ocOrder.shipping_country_id).EntityIntegerId!;
        const zoneId = this.entityReferenceDAO.getRequiredZoneReferenceByReferenceId(this.orderEntry.store.id, ocOrder.shipping_zone_id).EntityIntegerId!;
        return {
            SalesOrder: salesOrderId,
            Address1: ocOrder.payment_address_1,
            Address2: ocOrder.payment_address_2,
            AddressFormat: ocOrder.payment_address_format,
            City: ocOrder.payment_city,
            Code: ocOrder.payment_code,
            Company: ocOrder.payment_company,
            Country: countryId,
            CustomField: ocOrder.payment_custom_field,
            FirstName: ocOrder.payment_firstname,
            LastName: ocOrder.payment_lastname,
            Method: ocOrder.payment_method,
            Postcode: ocOrder.payment_postcode,
            Zone: zoneId
        }
    }

    private getOpenCartOrderProducts(ocOrderId: number) {
        const querySettings: oc_order_productEntityOptions = {
            $filter: {
                equals: {
                    order_id: ocOrderId
                }
            }
        };
        return this.ocOrderProductDAO.findAll(querySettings);
    }

    private createSalesOrderItems(ocOrderId: number, salesOrderId: number) {
        const ocOrderProducts = this.getOpenCartOrderProducts(ocOrderId);

        ocOrderProducts.forEach(ocOrderProduct => {
            const salesOrderItem = this.createSalesOrderItem(ocOrderProduct, salesOrderId);
            const salesOrderItemId = this.salesOrderItemDAO.create(salesOrderItem);
            this.entityReferenceDAO.createSalesOrderItemReference(this.orderEntry.store.id, salesOrderItemId, ocOrderProduct.order_product_id);
        });
    }

    private createSalesOrderItem(ocOrderProduct: oc_order_productEntity, salesOrderId: number): SalesOrderItemCreateEntity {
        const productId = this.entityReferenceDAO.getRequiredProductReferenceReferenceByReferenceId(this.orderEntry.store.id, ocOrderProduct.product_id).EntityIntegerId!;
        return {
            Model: ocOrderProduct.model,
            Name: ocOrderProduct.name,
            Price: ocOrderProduct.price,
            Product: productId,
            Quantity: ocOrderProduct.quantity,
            Tax: ocOrderProduct.tax,
            Total: ocOrderProduct.total,
            SalesOrder: salesOrderId
        }
    }

}
