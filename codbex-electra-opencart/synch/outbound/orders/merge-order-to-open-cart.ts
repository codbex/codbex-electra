import { EntityReferenceDAO } from "../../../../codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";
import { oc_orderRepository as OpenCartOrderDAO, oc_orderCreateEntity, oc_orderUpdateEntity } from "../../../dao/oc_orderRepository";
import { SalesOrderRepository as SalesOrderDAO } from "../../../../codbex-electra/gen/dao/SalesOrders/SalesOrderRepository";
import { CustomerRepository as CustomerDAO } from "../../../../codbex-electra/gen/dao/Customers/CustomerRepository";
import { BaseHandler } from "../../base-handler";
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
    private readonly ocOrderDAO;
    private readonly customerDAO;

    constructor(orderEntry: OrderEntry) {
        super(import.meta.url);
        this.orderEntry = orderEntry;
        this.entityReferenceDAO = new EntityReferenceDAO();
        this.salesOrderDAO = new SalesOrderDAO();
        this.ocOrderDAO = new OpenCartOrderDAO(orderEntry.store.dataSourceName);
        this.customerDAO = new CustomerDAO();
    }

    handle() {
        const orderId = this.orderEntry.orderId;
        const storeId = this.orderEntry.store.id;

        const orderReference = this.entityReferenceDAO.getSalesOrderReferenceByEntityId(storeId, orderId);
        this.logger.info("Skipping out sync for order [{}] until it is implemented", orderId);
        // TODO implement it
        // const ocOrder = this.createOpenCartOrder(orderReference);
        // const ocOrderId = this.ocOrderDAO.upsert(ocOrder);

        // if (!orderReference) {
        //     this.entityReferenceDAO.createSalesOrderReference(storeId, orderId, ocOrderId);
        // }
    }

    private createOpenCartOrder(orderReference: EntityReferenceEntity | null): oc_orderCreateEntity | oc_orderUpdateEntity {
        const orderId = this.orderEntry.orderId;
        const order = this.salesOrderDAO.findById(orderId)!;
        const customer = this.customerDAO.findById(order.Customer)!;

        const ocLanguageId = this.entityReferenceDAO.getRequiredLanguageReferenceByEntityId(this.orderEntry.store.id, order.Language).ReferenceIntegerId!;
        const ocCurrencyId = this.entityReferenceDAO.getRequiredCurrencyReferenceByEntityId(this.orderEntry.store.id, order.Currency).ReferenceIntegerId!;

        // TODO collect all data
        return {
            order_id: orderReference ? orderReference.ReferenceIntegerId! : 0,
            invoice_no: this.getZeroIfMissing(order.InvoiceNumber),
            invoice_prefix: this.getEmptyStringIfMissing(order.InvoicePrefix),
            store_id: 0,
            store_name: this.orderEntry.store.name,
            store_url: this.orderEntry.store.url,
            customer_id: order.Customer,
            customer_group_id: 1,
            firstname: customer.FirstName,
            lastname: customer.LastName,
            email: customer.Email,
            telephone: this.getEmptyStringIfMissing(customer.Telephone),
            fax: "",
            custom_field: "",
            payment_firstname: "",
            payment_lastname: "",
            payment_company: "",
            payment_address_1: "",
            payment_address_2: "",
            payment_city: "",
            payment_postcode: "",
            payment_country: "",
            payment_country_id: 1,
            payment_zone: "",
            payment_zone_id: 1,
            payment_address_format: "",
            payment_custom_field: "",
            payment_method: "",
            payment_code: "",
            shipping_firstname: "",
            shipping_lastname: "",
            shipping_company: "",
            shipping_address_1: "",
            shipping_address_2: "",
            shipping_city: "",
            shipping_postcode: "",
            shipping_country: "",
            shipping_country_id: 1,
            shipping_zone: "",
            shipping_zone_id: 1,
            shipping_address_format: "",
            shipping_custom_field: "",
            shipping_method: "",
            shipping_code: "",
            comment: this.getEmptyStringIfMissing(order.Comment),
            total: order.Total,
            order_status_id: 1,
            affiliate_id: 0,
            commission: 1,
            marketing_id: 1,
            tracking: this.getEmptyStringIfMissing(order.Tracking),
            language_id: ocLanguageId,
            currency_id: ocCurrencyId,
            currency_code: "",
            currency_value: 1,
            ip: "",
            forwarded_ip: "",
            user_agent: "",
            accept_language: "",
            date_added: order.DateAdded!,
            date_modified: order.DateModified!
        };
    }

}
