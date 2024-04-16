import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { CategoryTranslationRepository, CategoryTranslationEntityOptions } from "../../dao/Product Categories/CategoryTranslationRepository";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-electra-Product Categories-CategoryTranslation", ["validate"]);

@Controller
class CategoryTranslationService {

    private readonly repository = new CategoryTranslationRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            let Language = parseInt(ctx.queryParameters.Language);
            Language = isNaN(Language) ? ctx.queryParameters.Language : Language;
            const options: CategoryTranslationEntityOptions = {
                $filter: {
                    equals: {
                        Language: Language
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
            response.setHeader("Content-Location", "/services/ts/codbex-electra/gen/api/Product Categories/CategoryTranslationService.ts/" + entity.Id);
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
                HttpUtils.sendResponseNotFound("CategoryTranslation not found");
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
                HttpUtils.sendResponseNotFound("CategoryTranslation not found");
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
        if (entity.Category === null || entity.Category === undefined) {
            throw new ValidationError(`The 'Category' property is required, provide a valid value`);
        }
        if (entity.Language === null || entity.Language === undefined) {
            throw new ValidationError(`The 'Language' property is required, provide a valid value`);
        }
        if (entity.Name === null || entity.Name === undefined) {
            throw new ValidationError(`The 'Name' property is required, provide a valid value`);
        }
        if (entity.Name?.length > 255) {
            throw new ValidationError(`The 'Name' exceeds the maximum length of [255] characters`);
        }
        if (entity.Description === null || entity.Description === undefined) {
            throw new ValidationError(`The 'Description' property is required, provide a valid value`);
        }
        if (entity.Description?.length > 2000) {
            throw new ValidationError(`The 'Description' exceeds the maximum length of [2000] characters`);
        }
        if (entity.MetaTitle === null || entity.MetaTitle === undefined) {
            throw new ValidationError(`The 'MetaTitle' property is required, provide a valid value`);
        }
        if (entity.MetaTitle?.length > 255) {
            throw new ValidationError(`The 'MetaTitle' exceeds the maximum length of [255] characters`);
        }
        if (entity.MetaDescription === null || entity.MetaDescription === undefined) {
            throw new ValidationError(`The 'MetaDescription' property is required, provide a valid value`);
        }
        if (entity.MetaDescription?.length > 255) {
            throw new ValidationError(`The 'MetaDescription' exceeds the maximum length of [255] characters`);
        }
        if (entity.MetaKeyword === null || entity.MetaKeyword === undefined) {
            throw new ValidationError(`The 'MetaKeyword' property is required, provide a valid value`);
        }
        if (entity.MetaKeyword?.length > 255) {
            throw new ValidationError(`The 'MetaKeyword' exceeds the maximum length of [255] characters`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
