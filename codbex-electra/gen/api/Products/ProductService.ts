import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { ProductRepository, ProductEntityOptions } from "../../dao/Products/ProductRepository";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-electra-Products-Product", ["validate"]);

@Controller
class ProductService {

    private readonly repository = new ProductRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            const options: ProductEntityOptions = {
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
            response.setHeader("Content-Location", "/services/ts/codbex-electra/gen/api/Products/ProductService.ts/" + entity.Id);
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
                HttpUtils.sendResponseNotFound("Product not found");
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
                HttpUtils.sendResponseNotFound("Product not found");
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
        if (entity.Model === null || entity.Model === undefined) {
            throw new ValidationError(`The 'Model' property is required, provide a valid value`);
        }
        if (entity.Model?.length > 64) {
            throw new ValidationError(`The 'Model' exceeds the maximum length of [64] characters`);
        }
        if (entity.Manufacturer === null || entity.Manufacturer === undefined) {
            throw new ValidationError(`The 'Manufacturer' property is required, provide a valid value`);
        }
        if (entity.Quantity === null || entity.Quantity === undefined) {
            throw new ValidationError(`The 'Quantity' property is required, provide a valid value`);
        }
        if (entity.Price === null || entity.Price === undefined) {
            throw new ValidationError(`The 'Price' property is required, provide a valid value`);
        }
        if (entity.Image?.length > 255) {
            throw new ValidationError(`The 'Image' exceeds the maximum length of [255] characters`);
        }
        if (entity.SKU?.length > 64) {
            throw new ValidationError(`The 'SKU' exceeds the maximum length of [64] characters`);
        }
        if (entity.UPC?.length > 12) {
            throw new ValidationError(`The 'UPC' exceeds the maximum length of [12] characters`);
        }
        if (entity.EAN?.length > 14) {
            throw new ValidationError(`The 'EAN' exceeds the maximum length of [14] characters`);
        }
        if (entity.JAN?.length > 13) {
            throw new ValidationError(`The 'JAN' exceeds the maximum length of [13] characters`);
        }
        if (entity.ISBN?.length > 17) {
            throw new ValidationError(`The 'ISBN' exceeds the maximum length of [17] characters`);
        }
        if (entity.MPN?.length > 64) {
            throw new ValidationError(`The 'MPN' exceeds the maximum length of [64] characters`);
        }
        if (entity.DateAvailable === null || entity.DateAvailable === undefined) {
            throw new ValidationError(`The 'DateAvailable' property is required, provide a valid value`);
        }
        if (entity.Weight === null || entity.Weight === undefined) {
            throw new ValidationError(`The 'Weight' property is required, provide a valid value`);
        }
        if (entity.Length === null || entity.Length === undefined) {
            throw new ValidationError(`The 'Length' property is required, provide a valid value`);
        }
        if (entity.Width === null || entity.Width === undefined) {
            throw new ValidationError(`The 'Width' property is required, provide a valid value`);
        }
        if (entity.Height === null || entity.Height === undefined) {
            throw new ValidationError(`The 'Height' property is required, provide a valid value`);
        }
        if (entity.UpdatedBy?.length > 96) {
            throw new ValidationError(`The 'UpdatedBy' exceeds the maximum length of [96] characters`);
        }
        if (entity.Points === null || entity.Points === undefined) {
            throw new ValidationError(`The 'Points' property is required, provide a valid value`);
        }
        if (entity.Location === null || entity.Location === undefined) {
            throw new ValidationError(`The 'Location' property is required, provide a valid value`);
        }
        if (entity.Location?.length > 128) {
            throw new ValidationError(`The 'Location' exceeds the maximum length of [128] characters`);
        }
        if (entity.Minimum === null || entity.Minimum === undefined) {
            throw new ValidationError(`The 'Minimum' property is required, provide a valid value`);
        }
        if (entity.StockStatus === null || entity.StockStatus === undefined) {
            throw new ValidationError(`The 'StockStatus' property is required, provide a valid value`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
