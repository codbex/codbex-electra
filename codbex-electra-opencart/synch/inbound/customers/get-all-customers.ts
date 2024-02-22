import { OpenCartStoreConfig } from "../../../dao/StoreConfigDAO";
import { BaseHandler } from "../../base-handler";
import { oc_customerRepository as OpenCartCustomerDAO, oc_customerEntityOptions } from "../../../dao/oc_customerRepository";

export function onMessage(message: any) {
    const store: OpenCartStoreConfig = message.getBody();

    const handler = new GetCustomersHandler(store);
    const languageEntries = handler.handle();

    message.setBody(languageEntries);
    return message;
}

export interface CustomerEntry {
    readonly ocCustomerId: number;
    readonly store: OpenCartStoreConfig;
}

class GetCustomersHandler extends BaseHandler {
    private readonly store;
    private readonly ocCustomerDAO;

    constructor(store: OpenCartStoreConfig) {
        super(import.meta.url);
        this.store = store;
        this.ocCustomerDAO = new OpenCartCustomerDAO(store.dataSourceName);
    }

    handle() {
        const querySettings: oc_customerEntityOptions = {
            $select: ["customer_id"]
        };
        const customers = this.ocCustomerDAO.findAll(querySettings);
        this.logger.info("Found [{}] customer which must be replicated from store [{}]", customers.length, this.store.name);

        const customerEntries: CustomerEntry[] = [];
        customers.forEach((customer) => {
            const customerEntry = {
                ocCustomerId: customer.customer_id,
                store: this.store
            }
            customerEntries.push(customerEntry);
        });
        return customerEntries;
    }
}
