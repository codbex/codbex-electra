import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { SalesOrderShippingRepository, SalesOrderShippingEntityOptions } from "../../dao/SalesOrders/SalesOrderShippingRepository";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-electra-SalesOrders-SalesOrderShipping", ["validate"]);

@Controller
class SalesOrderShippingService {

    private readonly repository = new SalesOrderShippingRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            let SalesOrder = parseInt(ctx.queryParameters.SalesOrder);
            SalesOrder = isNaN(SalesOrder) ? ctx.queryParameters.SalesOrder : SalesOrder;
            const options: SalesOrderShippingEntityOptions = {
                $filter: {
                    equals: {
                        SalesOrder: SalesOrder
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
            response.setHeader("Content-Location", "/services/ts/codbex-electra/gen/api/SalesOrders/SalesOrderShippingService.ts/" + entity.Id);
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
                HttpUtils.sendResponseNotFound("SalesOrderShipping not found");
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
                HttpUtils.sendResponseNotFound("SalesOrderShipping not found");
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
        if (entity.Zone === null || entity.Zone === undefined) {
            throw new ValidationError(`The 'Zone' property is required, provide a valid value`);
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
        if (entity.Company?.length > 40) {
            throw new ValidationError(`The 'Company' exceeds the maximum length of [40] characters`);
        }
        if (entity.Address1?.length > 128) {
            throw new ValidationError(`The 'Address1' exceeds the maximum length of [128] characters`);
        }
        if (entity.Address2?.length > 128) {
            throw new ValidationError(`The 'Address2' exceeds the maximum length of [128] characters`);
        }
        if (entity.Country === null || entity.Country === undefined) {
            throw new ValidationError(`The 'Country' property is required, provide a valid value`);
        }
        if (entity.City?.length > 128) {
            throw new ValidationError(`The 'City' exceeds the maximum length of [128] characters`);
        }
        if (entity.Postcode?.length > 10) {
            throw new ValidationError(`The 'Postcode' exceeds the maximum length of [10] characters`);
        }
        if (entity.Method?.length > 128) {
            throw new ValidationError(`The 'Method' exceeds the maximum length of [128] characters`);
        }
        if (entity.Code?.length > 128) {
            throw new ValidationError(`The 'Code' exceeds the maximum length of [128] characters`);
        }
        if (entity.UpdatedBy?.length > 96) {
            throw new ValidationError(`The 'UpdatedBy' exceeds the maximum length of [96] characters`);
        }
        if (entity.AddressFormat?.length > 2000) {
            throw new ValidationError(`The 'AddressFormat' exceeds the maximum length of [2000] characters`);
        }
        if (entity.CustomField?.length > 2000) {
            throw new ValidationError(`The 'CustomField' exceeds the maximum length of [2000] characters`);
        }
        if (entity.SalesOrder === null || entity.SalesOrder === undefined) {
            throw new ValidationError(`The 'SalesOrder' property is required, provide a valid value`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
