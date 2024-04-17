import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { ProductAttributeRepository, ProductAttributeEntityOptions } from "../../dao/products/ProductAttributeRepository";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-electra-products-ProductAttribute", ["validate"]);

@Controller
class ProductAttributeService {

    private readonly repository = new ProductAttributeRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            let Product = parseInt(ctx.queryParameters.Product);
            Product = isNaN(Product) ? ctx.queryParameters.Product : Product;
            const options: ProductAttributeEntityOptions = {
                $filter: {
                    equals: {
                        Product: Product
                    }
                },
                $limit: ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
                $offset: ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
            };

            return this.repository.findAll(options);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/")
    public create(entity: any) {
        try {
            this.validateEntity(entity);
            entity.Id = this.repository.create(entity);
            response.setHeader("Content-Location", "/services/ts/codbex-electra/gen/api/products/ProductAttributeService.ts/" + entity.Id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/count")
    public count() {
        try {
            return this.repository.count();
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/count")
    public countWithFilter(filter: any) {
        try {
            return this.repository.count(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/search")
    public search(filter: any) {
        try {
            return this.repository.findAll(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/:id")
    public getById(_: any, ctx: any) {
        try {
            const id = parseInt(ctx.pathParameters.id);
            const entity = this.repository.findById(id);
            if (entity) {
                return entity;
            } else {
                HttpUtils.sendResponseNotFound("ProductAttribute not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Put("/:id")
    public update(entity: any, ctx: any) {
        try {
            entity.Id = ctx.pathParameters.id;
            this.validateEntity(entity);
            this.repository.update(entity);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Delete("/:id")
    public deleteById(_: any, ctx: any) {
        try {
            const id = ctx.pathParameters.id;
            const entity = this.repository.findById(id);
            if (entity) {
                this.repository.deleteById(id);
                HttpUtils.sendResponseNoContent();
            } else {
                HttpUtils.sendResponseNotFound("ProductAttribute not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleError(error: any) {
        if (error.name === "ForbiddenError") {
            HttpUtils.sendForbiddenRequest(error.message);
        } else if (error.name === "ValidationError") {
            HttpUtils.sendResponseBadRequest(error.message);
        } else {
            HttpUtils.sendInternalServerError(error.message);
        }
    }

    private validateEntity(entity: any): void {
        if (entity.Product === null || entity.Product === undefined) {
            throw new ValidationError(`The 'Product' property is required, provide a valid value`);
        }
        if (entity.Attribute === null || entity.Attribute === undefined) {
            throw new ValidationError(`The 'Attribute' property is required, provide a valid value`);
        }
        if (entity.Language === null || entity.Language === undefined) {
            throw new ValidationError(`The 'Language' property is required, provide a valid value`);
        }
        if (entity.Text === null || entity.Text === undefined) {
            throw new ValidationError(`The 'Text' property is required, provide a valid value`);
        }
        if (entity.Text?.length > 2000) {
            throw new ValidationError(`The 'Text' exceeds the maximum length of [2000] characters`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
