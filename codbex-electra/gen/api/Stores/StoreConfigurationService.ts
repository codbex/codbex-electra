import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { StoreConfigurationRepository, StoreConfigurationEntityOptions } from "../../dao/Stores/StoreConfigurationRepository";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-electra-Stores-StoreConfiguration", ["validate"]);

@Controller
class StoreConfigurationService {

    private readonly repository = new StoreConfigurationRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            let Store = parseInt(ctx.queryParameters.Store);
            Store = isNaN(Store) ? ctx.queryParameters.Store : Store;
            const options: StoreConfigurationEntityOptions = {
                $filter: {
                    equals: {
                        Store: Store
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
            response.setHeader("Content-Location", "/services/ts/codbex-electra/gen/api/Stores/StoreConfigurationService.ts/" + entity.Id);
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
                HttpUtils.sendResponseNotFound("StoreConfiguration not found");
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
                HttpUtils.sendResponseNotFound("StoreConfiguration not found");
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
        if (entity.Store === null || entity.Store === undefined) {
            throw new ValidationError(`The 'Store' property is required, provide a valid value`);
        }
        if (entity.Property === null || entity.Property === undefined) {
            throw new ValidationError(`The 'Property' property is required, provide a valid value`);
        }
        if (entity.Value === null || entity.Value === undefined) {
            throw new ValidationError(`The 'Value' property is required, provide a valid value`);
        }
        if (entity.Value?.length > 64) {
            throw new ValidationError(`The 'Value' exceeds the maximum length of [64] characters`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
