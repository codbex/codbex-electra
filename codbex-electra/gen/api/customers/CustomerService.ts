import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { CustomerRepository, CustomerEntityOptions } from "../../dao/customers/CustomerRepository";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-electra-customers-Customer", ["validate"]);

@Controller
class CustomerService {

    private readonly repository = new CustomerRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            const options: CustomerEntityOptions = {
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
            response.setHeader("Content-Location", "/services/ts/codbex-electra/gen/api/customers/CustomerService.ts/" + entity.Id);
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
                HttpUtils.sendResponseNotFound("Customer not found");
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
                HttpUtils.sendResponseNotFound("Customer not found");
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
        if (entity.Email === null || entity.Email === undefined) {
            throw new ValidationError(`The 'Email' property is required, provide a valid value`);
        }
        if (entity.Email?.length > 96) {
            throw new ValidationError(`The 'Email' exceeds the maximum length of [96] characters`);
        }
        if (entity.FirstName === null || entity.FirstName === undefined) {
            throw new ValidationError(`The 'FirstName' property is required, provide a valid value`);
        }
        if (entity.FirstName?.length > 32) {
            throw new ValidationError(`The 'FirstName' exceeds the maximum length of [32] characters`);
        }
        if (entity.LastName === null || entity.LastName === undefined) {
            throw new ValidationError(`The 'LastName' property is required, provide a valid value`);
        }
        if (entity.LastName?.length > 32) {
            throw new ValidationError(`The 'LastName' exceeds the maximum length of [32] characters`);
        }
        if (entity.Store === null || entity.Store === undefined) {
            throw new ValidationError(`The 'Store' property is required, provide a valid value`);
        }
        if (entity.Status === null || entity.Status === undefined) {
            throw new ValidationError(`The 'Status' property is required, provide a valid value`);
        }
        if (entity.Telephone?.length > 32) {
            throw new ValidationError(`The 'Telephone' exceeds the maximum length of [32] characters`);
        }
        if (entity.CustomField?.length > 2000) {
            throw new ValidationError(`The 'CustomField' exceeds the maximum length of [2000] characters`);
        }
        if (entity.Language === null || entity.Language === undefined) {
            throw new ValidationError(`The 'Language' property is required, provide a valid value`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
