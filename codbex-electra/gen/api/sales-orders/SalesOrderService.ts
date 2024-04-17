import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { SalesOrderRepository, SalesOrderEntityOptions } from "../../dao/sales-orders/SalesOrderRepository";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";
// custom imports
import { NumberGeneratorService } from "/codbex-number-generator/service/generator";

const validationModules = await Extensions.loadExtensionModules("codbex-electra-sales-orders-SalesOrder", ["validate"]);

@Controller
class SalesOrderService {

    private readonly repository = new SalesOrderRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            const options: SalesOrderEntityOptions = {
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
            response.setHeader("Content-Location", "/services/ts/codbex-electra/gen/api/sales-orders/SalesOrderService.ts/" + entity.Id);
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
                HttpUtils.sendResponseNotFound("SalesOrder not found");
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
                HttpUtils.sendResponseNotFound("SalesOrder not found");
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
        if (entity.Number?.length > 20) {
            throw new ValidationError(`The 'Number' exceeds the maximum length of [20] characters`);
        }
        if (entity.Store === null || entity.Store === undefined) {
            throw new ValidationError(`The 'Store' property is required, provide a valid value`);
        }
        if (entity.Status === null || entity.Status === undefined) {
            throw new ValidationError(`The 'Status' property is required, provide a valid value`);
        }
        if (entity.Total === null || entity.Total === undefined) {
            throw new ValidationError(`The 'Total' property is required, provide a valid value`);
        }
        if (entity.Currency === null || entity.Currency === undefined) {
            throw new ValidationError(`The 'Currency' property is required, provide a valid value`);
        }
        if (entity.Customer === null || entity.Customer === undefined) {
            throw new ValidationError(`The 'Customer' property is required, provide a valid value`);
        }
        if (entity.UpdatedBy?.length > 96) {
            throw new ValidationError(`The 'UpdatedBy' exceeds the maximum length of [96] characters`);
        }
        if (entity.Tracking?.length > 255) {
            throw new ValidationError(`The 'Tracking' exceeds the maximum length of [255] characters`);
        }
        if (entity.Comment?.length > 2000) {
            throw new ValidationError(`The 'Comment' exceeds the maximum length of [2000] characters`);
        }
        if (entity.InvoicePrefix?.length > 26) {
            throw new ValidationError(`The 'InvoicePrefix' exceeds the maximum length of [26] characters`);
        }
        if (entity.Language === null || entity.Language === undefined) {
            throw new ValidationError(`The 'Language' property is required, provide a valid value`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
