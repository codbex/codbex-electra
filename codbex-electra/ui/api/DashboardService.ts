import { Controller, Get } from "sdk/http";
import { query } from "sdk/db";

@Controller
class DashboardService {


    constructor() {
    }

    @Get("/ordersData/orders")
    public getOrders() {
        return {
            orders: this.getTodaysOrders()
        };
    }

    private getTodaysOrders(): number {
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
            orderStatuses: this.getTodaysOrderStatuses()
        };
    }


    private getTodaysOrderStatuses(): any[] {
        const sql = `
            SELECT s.ORDERSTATUS_NAME as STATUS_NAME, so.TOTAL_ORDERS as TOTAL_ORDERS
            FROM (
                SELECT so.SALESORDER_STATUS as STATUS_ID, COUNT(SALESORDER_ID) as TOTAL_ORDERS
                FROM CODBEX_SALESORDER as so
                WHERE so.SALESORDER_DATEADDED > CURRENT_DATE
                GROUP BY SALESORDER_STATUS
            ) as so
            INNER JOIN CODBEX_ORDERSTATUS as s
            ON so.STATUS_ID = s.ORDERSTATUS_ID

        `;
        const resulSet = query.execute(sql);

        const orderStatuses = new Array();

        resulSet.forEach(result => {
            orderStatuses.push({
                statusName: result.ORDERSTATUS_NAME,
                ordersCount: result.TOTAL_ORDERS
            });
        });

        return orderStatuses;
    }

    @Get("/ordersData/ordersByStore")
    public getOrdersByStore() {
        return {
            storeOrders: this.getTodaysOrdersByStore()
        };
    }

    private getTodaysOrdersByStore(): any[] {
        const sql = `
            SELECT s.STORE_NAME, o.TOTAL_ORDERS
            FROM CODBEX_STORE as s
            INNER JOIN ( 
                SELECT SALESORDER_STORE as STORE_ID, COUNT(*) as TOTAL_ORDERS
                FROM CODBEX_SALESORDER as so
                WHERE so.SALESORDER_DATEADDED > CURRENT_DATE
                GROUP BY SALESORDER_STORE
                ) as o
            on s.STORE_ID = o.STORE_ID
        `;
        const resulSet = query.execute(sql);

        const orders = new Array();

        resulSet.forEach(result => {
            orders.push({
                storeName: result.STORE_NAME,
                orders: result.TOTAL_ORDERS
            });
        });

        return orders;
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
            soldProducts: this.getTodaysSoldItems()
        };
    }

    private getTodaysSoldItems(): number {
        const sql = `
            SELECT SUM(i.ORDERITEM_QUANTITY) as SOLD_ITEMS
            FROM CODBEX_SALESORDER as so
            INNER JOIN CODBEX_SALESORDERITEM i
            ON so.SALESORDER_ID = i.ORDERITEM_SALESORDER
            WHERE so.SALESORDER_DATEADDED > CURRENT_DATE
        `;
        const resulSet = query.execute(sql);
        return resulSet[0].SOLD_ITEMS
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