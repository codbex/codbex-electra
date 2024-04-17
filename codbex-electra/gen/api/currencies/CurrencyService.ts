import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { CurrencyRepository, CurrencyEntityOptions } from "../../dao/currencies/CurrencyRepository";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-electra-currencies-Currency", ["validate"]);

@Controller
class CurrencyService {

    private readonly repository = new CurrencyRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            const options: CurrencyEntityOptions = {
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
            response.setHeader("Content-Location", "/services/ts/codbex-electra/gen/api/currencies/CurrencyService.ts/" + entity.Id);
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
                HttpUtils.sendResponseNotFound("Currency not found");
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
                HttpUtils.sendResponseNotFound("Currency not found");
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
        if (entity.Title === null || entity.Title === undefined) {
            throw new ValidationError(`The 'Title' property is required, provide a valid value`);
        }
        if (entity.Title?.length > 32) {
            throw new ValidationError(`The 'Title' exceeds the maximum length of [32] characters`);
        }
        if (entity.Status === null || entity.Status === undefined) {
            throw new ValidationError(`The 'Status' property is required, provide a valid value`);
        }
        if (entity.Code === null || entity.Code === undefined) {
            throw new ValidationError(`The 'Code' property is required, provide a valid value`);
        }
        if (entity.Code?.length > 3) {
            throw new ValidationError(`The 'Code' exceeds the maximum length of [3] characters`);
        }
        if (entity.SymbolLeft?.length > 12) {
            throw new ValidationError(`The 'SymbolLeft' exceeds the maximum length of [12] characters`);
        }
        if (entity.SymbolRight?.length > 12) {
            throw new ValidationError(`The 'SymbolRight' exceeds the maximum length of [12] characters`);
        }
        if (entity.DecimalPlace === null || entity.DecimalPlace === undefined) {
            throw new ValidationError(`The 'DecimalPlace' property is required, provide a valid value`);
        }
        if (entity.DecimalPlace?.length > 1) {
            throw new ValidationError(`The 'DecimalPlace' exceeds the maximum length of [1] characters`);
        }
        if (entity.Value === null || entity.Value === undefined) {
            throw new ValidationError(`The 'Value' property is required, provide a valid value`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
