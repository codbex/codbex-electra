import { Controller, Get } from "sdk/http";

@Controller
class DashboardService {

    @Get("/test")
    public getOrders() {
        return {
            total: 20
        };
    }

}