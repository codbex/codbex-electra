import { Controller, Get } from "sdk/http";

@Controller
class DashboardService {


    constructor() {
    }

    @Get("/ordersData/newOrders")
    public getNewOrders() {

        return {
            newOrders: 987
        };
    }

    @Get("/ordersData/orderStatuses")
    public getOrdersData() {
        const orderStatuses = new Array();
        orderStatuses.push({
            name: "Pending",
            count: 22
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
}