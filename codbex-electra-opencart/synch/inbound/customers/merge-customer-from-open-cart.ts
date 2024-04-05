import { EntityReferenceDAO } from "codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "codbex-electra/gen/dao/Settings/EntityReferenceRepository";
import { CustomerRepository as CustomerDAO, CustomerCreateEntity, CustomerUpdateEntity } from "codbex-electra/gen/dao/Customers/CustomerRepository";
import { oc_customerRepository as OpenCartCustomerDAO, oc_customerEntity } from "codbex-electra-opencart/dao/oc_customerRepository";
import { BaseHandler } from "codbex-electra-opencart/synch/base-handler";
import { CustomerEntry } from "./get-all-customers";

export function onMessage(message: any) {
    const customerEntry: CustomerEntry = message.getBody();

    const handler = new MergeCustomerFromOpenCart(customerEntry);
    handler.handle();

    return message;
}

class MergeCustomerFromOpenCart extends BaseHandler {
    private readonly customerEntry;
    private readonly entityReferenceDAO;
    private readonly customerDAO;
    private readonly ocCustomerDAO;

    constructor(customerEntry: CustomerEntry) {
        super(import.meta.url);
        this.customerEntry = customerEntry;
        this.entityReferenceDAO = new EntityReferenceDAO();
        this.customerDAO = new CustomerDAO();
        this.ocCustomerDAO = new OpenCartCustomerDAO(customerEntry.store.dataSourceName);
    }

    handle() {
        const ocCustomerId = this.customerEntry.ocCustomerId;
        const storeId = this.customerEntry.store.id;

        const customerReference = this.entityReferenceDAO.getCustomerReferenceByReferenceId(storeId, ocCustomerId);
        const ocCustomer = this.ocCustomerDAO.findById(ocCustomerId)!;

        const customer = this.createCustomerEntity(ocCustomer, customerReference);
        const customerId = this.customerDAO.upsert(customer);

        if (!customerReference) {
            this.entityReferenceDAO.createCustomerReference(storeId, customerId, ocCustomerId);
        }
    }

    private createCustomerEntity(ocCustomer: oc_customerEntity, customerReference: EntityReferenceEntity | null): CustomerCreateEntity | CustomerUpdateEntity {
        const language = this.entityReferenceDAO.getRequiredLanguageReferenceByReferenceId(this.customerEntry.store.id, ocCustomer.language_id);
        const store = this.customerEntry.store.id;
        const status = ocCustomer.status ? 1 : 0;

        if (customerReference) {
            return {
                Id: customerReference.EntityIntegerId!,
                Email: ocCustomer.email,
                FirstName: ocCustomer.firstname,
                LastName: ocCustomer.lastname,
                CustomField: ocCustomer.custom_field,
                Telephone: ocCustomer.telephone,
                Status: status,
                Language: language.EntityIntegerId!,
                Store: store
            };
        } else {
            return {
                Email: ocCustomer.email,
                FirstName: ocCustomer.firstname,
                LastName: ocCustomer.lastname,
                CustomField: ocCustomer.custom_field,
                Telephone: ocCustomer.telephone,
                Status: status,
                Language: language.EntityIntegerId!,
                Store: store
            }
        }

    }
}
