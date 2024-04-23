import { Controller, Get } from "sdk/http";

@Controller
class OrderService {


    constructor() {
    }

    @Get("/orderData")
    public orderData() {

        return {
            "UnpaidSalesOrders": 3,
            "SalesOrdersToday": 3,
            "SalesOrderTotal": 5,
            "PurchaseOrderTotal": 5,
            "ReceivableCurrent": 1,
            'ReceivableOverdue': 2,
            "PaidSalesOrders": 3,
            "NewSalesOrders": 2
        };
    }
}