import { Controller, Get } from "sdk/http";
import { query } from "sdk/db";

@Controller
class DashboardService {


    constructor() {
    }

    @Get("/ordersData/newOrders")
    public getNewOrders() {
        return {
            newOrders: this.getTodaysNewOrders()
        };
    }

    private getTodaysNewOrders(): number {
        const sql = `
            SELECT COUNT(SALESORDER_ID) as ORDERS_COUNT
            FROM CODBEX_SALESORDER
            WHERE SALESORDER_DATEADDED > CURRENT_DATE
        `;
        const resulSet = query.execute(sql);
        return resulSet[0].ORDERS_COUNT
    }

    @Get("/ordersData/orderStatuses")
    public getOrdersData() {
        const orderStatuses = new Array();
        orderStatuses.push({
            name: "Pending",
            count: 19
        });

        orderStatuses.push({
            name: "Complete",
            count: 125
        });

        orderStatuses.push({
            name: "Shipped",
            count: 50
        });

        return {
            orderStatuses: orderStatuses
        };
    }

    @Get("/ordersData/ordersByStore")
    public getOrdersByStore() {
        const storeOrders = new Array();
        storeOrders.push({
            storeName: "Store 1",
            ordersCount: 77
        });

        storeOrders.push({
            storeName: "Store 2",
            ordersCount: 123
        });

        storeOrders.push({
            storeName: "Store 3",
            ordersCount: 50
        });

        storeOrders.push({
            storeName: "Store 4",
            ordersCount: 151
        });

        return {
            storeOrders: storeOrders
        };
    }

    @Get("/productsData/outOfStockProducts")
    public getOutOfStockProducts() {

        return {
            outOfStockProducts: 37
        };
    }

    @Get("/productsData/soldProducts")
    public getSoldProducts() {

        return {
            soldProducts: 54
        };
    }


    @Get("/customersData/newCustomers")
    public getNewCustomers() {
        return {
            newCustomers: this.getTodaysNewCustomers()
        };
    }

    private getTodaysNewCustomers(): number {
        const sql = `
            SELECT COUNT(CUSTOMER_ID) as CUSTOMERS_COUNT
            FROM CODBEX_CUSTOMER
            WHERE CUSTOMER_DATE_ADDED > CURRENT_DATE
        `;
        const resulSet = query.execute(sql);
        return resulSet[0].CUSTOMERS_COUNT
    }
}