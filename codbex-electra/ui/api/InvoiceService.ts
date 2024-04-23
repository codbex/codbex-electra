import { Controller, Get } from "sdk/http";

@Controller
class InvoiceService {


    constructor() {
    }

    @Get("/invoiceData")
    public invoiceData() {
        return {
            "UnpaidSalesInvoices": 2,
            "SalesInvoiceTotal": 3,
            "PurchaseInvoiceTotal": 5,
            "ReceivableCurrent": 1,
            'ReceivableOverdue': 2
        };
    }
}