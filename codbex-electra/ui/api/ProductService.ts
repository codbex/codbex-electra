import { Controller, Get } from "sdk/http";

@Controller
class ProductService {

    constructor() {
    }

    @Get("/productData")
    public productData() {
        return {
            "ActiveProducts": 3,
            "InactiveProducts": 2,
            "AllProducts": 5,
            "ActiveCategories": 4
        }
    }
}