import { EntityReferenceDAO } from "codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "codbex-electra/gen/dao/entity-references/EntityReferenceRepository";
import { SalesOrderRepository as SalesOrderDAO, SalesOrderEntity } from "codbex-electra/gen/dao/sales-orders/SalesOrderRepository";
import { SalesOrderItemRepository as SalesOrderItemDAO, SalesOrderItemEntity, SalesOrderItemEntityOptions } from "codbex-electra/gen/dao/sales-orders/SalesOrderItemRepository";
import { SalesOrderShippingRepository as SalesOrderShippingDAO, SalesOrderShippingEntity, SalesOrderShippingEntityOptions } from "codbex-electra/gen/dao/sales-orders/SalesOrderShippingRepository";
import { SalesOrderPaymentRepository as SalesOrderPaymentDAO, SalesOrderPaymentEntity, SalesOrderPaymentEntityOptions } from "codbex-electra/gen/dao/sales-orders/SalesOrderPaymentRepository";
import { oc_orderRepository as OpenCartOrderDAO, oc_orderUpdateEntity } from "codbex-electra-opencart/dao/oc_orderRepository";
import { oc_order_productRepository as OpenCartOrderProductDAO, oc_order_productCreateEntity, oc_order_productUpdateEntity } from "codbex-electra-opencart/dao/oc_order_productRepository";
import { BaseHandler } from "codbex-electra-opencart/synch/base-handler";
import { OrderEntry } from "./get-all-orders";

export function onMessage(message: any) {
    const orderEntry: OrderEntry = message.getBody();

    const handler = new MergeLanguageToOpenCart(orderEntry);
    handler.handle();

    return message;
}

class MergeLanguageToOpenCart extends BaseHandler {
    private readonly orderEntry;
    private readonly entityReferenceDAO;
    private readonly salesOrderDAO;
    private readonly salesOrderItemDAO;
    private readonly salesOrderShippingDAO;
    private readonly salesOrderPaymentDAO;
    private readonly ocOrderDAO;
    private readonly ocOrderProductDAO;

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
    }

    handle() {
        const orderId = this.orderEntry.orderId;
        const storeId = this.orderEntry.store.id;

        const orderReference = this.entityReferenceDAO.getRequiredSalesOrderReferenceReferenceByEntityId(storeId, orderId);

        const salesOrder = this.salesOrderDAO.findById(orderId)!;

        const shipping = this.getSalesOrderShipping(orderId);
        const payment = this.getSalesOrderPayment(orderId);
        const ocOrder = this.createOpenCartOrder(salesOrder, shipping, payment, orderReference);

        this.ocOrderDAO.update(ocOrder);

        this.createOpenCartOrderProducts(orderId, ocOrder);
    }

    private createOpenCartOrder(salesOrder: SalesOrderEntity, shipping: SalesOrderShippingEntity, payment: SalesOrderPaymentEntity, orderReference: EntityReferenceEntity): oc_orderUpdateEntity {
        const ocOrderId = orderReference.ReferenceIntegerId!;

        // workaround for https://github.com/eclipse/dirigible/issues/3480
        // delete it, once the issue is resolved
        const ocOrder = this.ocOrderDAO.findById(ocOrderId)!;
        if (!ocOrder) {
            this.throwError(`Missing OpenCart order with id ${ocOrderId} in store ${this.orderEntry.store.name}`)
        }

        const storeId = this.orderEntry.store.id;

        const ocCurrencyId = this.entityReferenceDAO.getRequiredCurrencyReferenceByEntityId(storeId, salesOrder.Currency).ReferenceIntegerId!;
        const ocCustomerId = this.entityReferenceDAO.getRequiredCustomerReferenceByEntityId(storeId, salesOrder.Customer).ReferenceIntegerId!;

        const ocLanguageId = this.entityReferenceDAO.getRequiredLanguageReferenceByEntityId(storeId, salesOrder.Language).ReferenceIntegerId!;

        const ocOrderStatusId = this.entityReferenceDAO.getRequiredOrderStatusReferenceByEntityId(storeId, salesOrder.Status).ReferenceIntegerId!;

        const shippingCountryId = this.entityReferenceDAO.getRequiredCountryReferenceByEntityId(storeId, shipping.Country).ReferenceIntegerId!;
        const shippingZoneId = this.entityReferenceDAO.getRequiredZoneReferenceByEntityId(storeId, shipping.Zone).ReferenceIntegerId!;

        const paymentCountryId = this.entityReferenceDAO.getRequiredCountryReferenceByEntityId(storeId, payment.Country).ReferenceIntegerId!;
        const paymentZoneId = this.entityReferenceDAO.getRequiredZoneReferenceByEntityId(storeId, payment.Zone).ReferenceIntegerId!;

        return {
            store_name: ocOrder.store_name,
            store_url: ocOrder.store_url,
            firstname: ocOrder.firstname,
            lastname: ocOrder.lastname,
            email: ocOrder.email,
            telephone: ocOrder.telephone,
            fax: ocOrder.fax,
            ip: ocOrder.ip,
            forwarded_ip: ocOrder.forwarded_ip,
            user_agent: ocOrder.user_agent,
            accept_language: ocOrder.accept_language,
            custom_field: ocOrder.custom_field,
            currency_code: ocOrder.currency_code,
            currency_value: ocOrder.currency_value,
            affiliate_id: ocOrder.affiliate_id,
            commission: ocOrder.commission,
            marketing_id: ocOrder.marketing_id,
            customer_group_id: ocOrder.customer_group_id,
            store_id: ocOrder.store_id,
            payment_country: ocOrder.payment_country,
            payment_zone: ocOrder.payment_zone,
            shipping_country: ocOrder.shipping_country,
            shipping_zone: ocOrder.shipping_zone,

            order_id: ocOrderId,
            invoice_no: this.getZeroIfMissing(salesOrder.InvoiceNumber),
            invoice_prefix: this.getEmptyStringIfMissing(salesOrder.InvoicePrefix),
            customer_id: ocCustomerId,
            comment: this.getEmptyStringIfMissing(salesOrder.Comment),
            total: salesOrder.Total,
            order_status_id: ocOrderStatusId,
            tracking: this.getEmptyStringIfMissing(salesOrder.Tracking),
            language_id: ocLanguageId,
            currency_id: ocCurrencyId,
            date_added: salesOrder.DateAdded!,
            date_modified: salesOrder.DateModified,

            payment_firstname: payment && payment.FirstName ? payment.FirstName : "",
            payment_lastname: payment && payment.LastName ? payment.LastName : "",
            payment_company: payment && payment.Company ? payment.Company : "",
            payment_address_1: payment && payment.Address1 ? payment.Address1 : "",
            payment_address_2: payment && payment.Address2 ? payment.Address2 : "",
            payment_address_format: payment && payment.AddressFormat ? payment.AddressFormat : "",
            payment_city: payment && payment.City ? payment.City : "",
            payment_postcode: payment && payment.Postcode ? payment.Postcode : "",
            payment_country_id: paymentCountryId,
            payment_zone_id: paymentZoneId,
            payment_custom_field: payment && payment.CustomField ? payment.CustomField : "",
            payment_method: payment && payment.Method ? payment.Method : "",
            payment_code: payment && payment.Code ? payment.Code : "",

            shipping_firstname: shipping && shipping.FirstName ? shipping.FirstName : "",
            shipping_lastname: shipping && shipping.LastName ? shipping.LastName : "",
            shipping_company: shipping && shipping.Company ? shipping.Company : "",
            shipping_address_1: shipping && shipping.Address1 ? shipping.Address1 : "",
            shipping_address_2: shipping && shipping.Address2 ? shipping.Address2 : "",
            shipping_address_format: shipping && shipping.AddressFormat ? shipping.AddressFormat : "",
            shipping_city: shipping && shipping.City ? shipping.City : "",
            shipping_postcode: shipping && shipping.Postcode ? shipping.Postcode : "",
            shipping_country_id: shippingCountryId,
            shipping_zone_id: shippingZoneId,
            shipping_custom_field: shipping && shipping.CustomField ? shipping.CustomField : "",
            shipping_method: shipping && shipping.Method ? shipping.Method : "",
            shipping_code: shipping && shipping.Code ? shipping.Code : "",

        };
    }

    private getSalesOrderShipping(salesOrderId: number) {
        const querySettings: SalesOrderShippingEntityOptions = {
            $filter: {
                equals: {
                    SalesOrder: salesOrderId
                }
            }
        };
        const shipments = this.salesOrderShippingDAO.findAll(querySettings);
        if (shipments.length === 0) {
            this.throwError(`Shipment for sales order with id [${salesOrderId}] was not found. The order will not be replicated to OpenCart`);
        }

        if (shipments.length > 1) {
            this.throwError(`Found [${shipments.length}] shippments which are more than one for sales order with id [{}].  The order will not be replicated to OpenCart.`);
        }
        return shipments[0];
    }

    private getSalesOrderPayment(salesOrderId: number) {
        const querySettings: SalesOrderPaymentEntityOptions = {
            $filter: {
                equals: {
                    SalesOrder: salesOrderId
                }
            }
        };
        const payments = this.salesOrderPaymentDAO.findAll(querySettings);
        if (payments.length === 0) {
            this.throwError(`Payment for sales order with id [${salesOrderId}] was not found. The order will not be replicated to OpenCart`);
        }

        if (payments.length > 1) {
            this.throwError(`Found [${payments.length}] payments which are more than one for sales order with id [{}].  The order will not be replicated to OpenCart.`);
        }
        return payments[0];
    }

    private createOpenCartOrderProducts(salesOrderId: number, ocOrder: oc_orderUpdateEntity) {
        const orderItems = this.getSalesOrderItems(salesOrderId);

        orderItems.forEach(orderItem => {
            this.upsertOpenCartOrderProduct(orderItem, ocOrder.order_id);
        });
    }

    private getSalesOrderItems(salesOrderId: number) {
        const querySettings: SalesOrderItemEntityOptions = {
            $filter: {
                equals: {
                    SalesOrder: salesOrderId
                }
            }
        };
        return this.salesOrderItemDAO.findAll(querySettings);
    }
    private upsertOpenCartOrderProduct(salesOrderItem: SalesOrderItemEntity, ocOrderId: number) {
        const storeId = this.orderEntry.store.id;

        const salesOrderItemRef = this.entityReferenceDAO.getSalesOrderItemReferenceByEntityId(storeId, salesOrderItem.Id);
        const ocOrderProduct = this.createOpenCartOrderProduct(salesOrderItem, salesOrderItemRef, ocOrderId);
        const ocOrderProductId = this.ocOrderProductDAO.upsert(ocOrderProduct);

        if (!salesOrderItemRef) {
            this.entityReferenceDAO.createSalesOrderItemReference(storeId, salesOrderItem.Id, ocOrderProductId);
        }
    }

    private createOpenCartOrderProduct(salesOrderItem: SalesOrderItemEntity, orderItemRef: EntityReferenceEntity | null, ocOrderId: number): oc_order_productCreateEntity | oc_order_productUpdateEntity {
        const ocProductId = this.entityReferenceDAO.getRequiredProductReferenceReferenceByEntityId(this.orderEntry.store.id, salesOrderItem.Product).ReferenceIntegerId!;
        return {
            order_product_id: orderItemRef ? orderItemRef.ReferenceIntegerId! : 0,
            model: salesOrderItem.Model,
            name: salesOrderItem.Name,
            price: salesOrderItem.Price,
            quantity: salesOrderItem.Quantity,
            tax: salesOrderItem.Tax,
            total: salesOrderItem.Total,
            product_id: ocProductId,
            order_id: ocOrderId,
            reward: 0
        };
    }

}
