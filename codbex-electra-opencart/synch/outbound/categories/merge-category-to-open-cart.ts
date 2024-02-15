import { EntityReferenceDAO } from "../../../../codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";
import { CategoryRepository as CategoryDAO } from "../../../../codbex-electra/gen/dao/Products/CategoryRepository";
import { oc_categoryRepository as OpenCartCategoryDAO, oc_categoryCreateEntity, oc_categoryUpdateEntity } from "../../../dao/oc_categoryRepository";
import { CategoryTranslationRepository as CategoryTranslationDAO, CategoryTranslationEntity } from "../../../../codbex-electra/gen/dao/Products/CategoryTranslationRepository";
import { oc_category_descriptionRepository as OpenCartCategoryDescriptionDAO, oc_category_descriptionUpdateEntity } from "../../../dao/oc_category_descriptionRepository";
import { oc_category_to_storeRepository as OpenCartCategoryToStoreDAO } from "../../../dao/oc_category_to_storeRepository";
import { oc_category_pathRepository as OpenCartCategoryPathDAO } from "../../../dao/oc_category_pathRepository";
import { BaseHandler } from "../base-handler";
import { CategoryEntry } from "./get-all-categories";

export function onMessage(message: any) {
    const categoryEntry: CategoryEntry = message.getBody();

    const handler = new MergeCategoryToOpenCart(categoryEntry);
    handler.handle();

    return message;
}

class MergeCategoryToOpenCart extends BaseHandler {
    private readonly categoryEntry;
    private readonly entityReferenceDAO;
    private readonly categoryDAO;
    private readonly ocCategoryDAO;
    private readonly categoryTranslationDAO;
    private readonly ocCategoryDescriptionDAO;
    private readonly ocCategoryToStoreDAO;
    private readonly ocCategoryPathDAO;

    constructor(categoryEntry: CategoryEntry) {
        super(import.meta.url);
        this.categoryEntry = categoryEntry;
        this.entityReferenceDAO = new EntityReferenceDAO();
        this.categoryDAO = new CategoryDAO();

        const dataSourceName = categoryEntry.store.dataSourceName;
        this.ocCategoryDAO = new OpenCartCategoryDAO(dataSourceName);
        this.categoryTranslationDAO = new CategoryTranslationDAO();
        this.ocCategoryDescriptionDAO = new OpenCartCategoryDescriptionDAO(dataSourceName);
        this.ocCategoryToStoreDAO = new OpenCartCategoryToStoreDAO(dataSourceName);
        this.ocCategoryPathDAO = new OpenCartCategoryPathDAO(dataSourceName);
    }

    handle() {
        const categoryId = this.categoryEntry.categoryId;
        const storeId = this.categoryEntry.store.id;

        const categoryReference = this.entityReferenceDAO.getStoreCategoryReference(storeId, categoryId);

        const ocCategory = this.createOpenCartCategory(categoryReference);
        const ocCategoryId = this.ocCategoryDAO.upsert(ocCategory);
        if (!categoryReference) {
            this.entityReferenceDAO.createCategoryReference(storeId, categoryId, ocCategoryId);
        }

        this.ocCategoryPathDAO.upsert({
            category_id: ocCategoryId,
            path_id: ocCategoryId,
            level: 0
        });

        const translations = this.getCategoryTranslations();

        translations.forEach(translation => {
            const ocCategoryDescription = this.createOpenCartCategoryDescription(translation, ocCategoryId);
            this.ocCategoryDescriptionDAO.upsert(ocCategoryDescription);

            this.ocCategoryToStoreDAO.upsert({
                category_id: ocCategoryId,
                store_id: 0
            })
        });
    }

    private createOpenCartCategory(categoryReference: EntityReferenceEntity | null): oc_categoryCreateEntity | oc_categoryUpdateEntity {
        const categoryId = this.categoryEntry.categoryId;
        const category = this.categoryDAO.findById(categoryId);

        if (categoryReference) {
            return {
                category_id: categoryReference.ReferenceIntegerId,
                image: category!.Image,
                top: true,
                column: 1,
                sort_order: 0,
                status: category!.Status,
                date_added: category!.DateAdded,
                date_modified: category!.DateModified!,
                parent_id: 0
            };
        } else {
            return {
                image: category!.Image,
                top: true,
                column: 1,
                sort_order: 0,
                status: category!.Status,
                date_added: category!.DateAdded,
                date_modified: category!.DateModified!,
                parent_id: 0
            };
        }
    }

    private getCategoryTranslations() {
        const querySettings = {
            $filter: {
                equals: {
                    Category: this.categoryEntry.categoryId
                }
            }
        };
        return this.categoryTranslationDAO.findAll(querySettings);
    }


    private createOpenCartCategoryDescription(categoryTranslation: CategoryTranslationEntity, ocCategoryId: number): oc_category_descriptionUpdateEntity {
        const languageId = this.getOpenCartLanguageId(categoryTranslation.Language);

        return {
            name: categoryTranslation.Name,
            description: categoryTranslation.Description!,
            meta_title: categoryTranslation.MetaTitle,
            meta_description: categoryTranslation.MetaDescription,
            meta_keyword: categoryTranslation.MetaKeyword,
            category_id: ocCategoryId,
            language_id: languageId!
        };
    }

    private getOpenCartLanguageId(languageId: number): number {
        const languageReference = this.entityReferenceDAO.getRequiredStoreLanguageReference(this.categoryEntry.store.id, languageId);
        return languageReference.ReferenceIntegerId!;
    }
}
