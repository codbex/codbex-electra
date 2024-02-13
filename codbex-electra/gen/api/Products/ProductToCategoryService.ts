import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { ProductToCategoryRepository, ProductToCategoryEntityOptions } from "../../dao/Products/ProductToCategoryRepository";
import { HttpUtils } from "../utils/HttpUtils";

@Controller
class ProductToCategoryService {

    private readonly repository = new ProductToCategoryRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            const options: ProductToCategoryEntityOptions = {
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
            entity.Id = this.repository.create(entity);
            response.setHeader("Content-Location", "/services/ts/codbex-electra/gen/api/Products/ProductToCategoryService.ts/" + entity.Id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/count/:${masterEntityId}")
    public count(_: any, ctx: any) {
        try {
            let ${masterEntityId} = parseInt(ctx.pathParameters.${masterEntityId});
            ${masterEntityId} = isNaN(${masterEntityId}) ? ctx.pathParameters.${masterEntityId} : ${masterEntityId};
            return this.repository.count(${masterEntityId});
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
                return entity
            } else {
                HttpUtils.sendResponseNotFound("ProductToCategory not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Put("/:id")
    public update(entity: any, ctx: any) {
        try {
            entity.Id = ctx.pathParameters.id;
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
                HttpUtils.sendResponseNotFound("ProductToCategory not found");
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
}
