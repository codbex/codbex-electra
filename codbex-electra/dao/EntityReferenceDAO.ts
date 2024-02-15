import { EntityReferenceRepository, EntityReferenceEntityOptions, EntityReferenceCreateEntity } from "../gen/dao/Settings/EntityReferenceRepository";

import { getLogger } from "../util/LoggerUtil";

export class EntityReferenceDAO {

    private static readonly CURRENCY_ENTITY = "Currency";
    private static readonly COUNTRY_ENTITY = "Country";
    private static readonly CATEGORY_ENTITY = "Category";
    private static readonly LANGUAGE_ENTITY = "Language";
    private static readonly ATTRIBUTE_ENTITY = "Attribute";
    private static readonly ATTRIBUTE_GROUP_ENTITY = "AttributeGroup";
    private static readonly ATTRIBUTE_GROUP_TRANSLATION_ENTITY = "AttributeGroupTranslation";
    private static readonly MANUFACTURER_ENTITY = "Manufacturer";
    private static readonly PRODUCT_ENTITY = "Product";
    private static readonly PRODUCT_DESCRIPTION_ENTITY = "ProductDescription";

    private readonly logger = getLogger(import.meta.url);
    private readonly generatedDAO;

    constructor() {
        this.generatedDAO = new EntityReferenceRepository();
    }

    public create(entityReference: EntityReferenceCreateEntity) {
        return this.generatedDAO.create(entityReference);
    }

    public createAttributeReference(storeId: number, entityAttributeId: number, referenceAttributeId: number) {
        return this.createReference(storeId, EntityReferenceDAO.ATTRIBUTE_ENTITY, entityAttributeId, referenceAttributeId);
    }

    public createAttributeGroupReference(storeId: number, entityAttributeGroupId: number, referenceAttributeGroupId: number) {
        return this.createReference(storeId, EntityReferenceDAO.ATTRIBUTE_GROUP_ENTITY, entityAttributeGroupId, referenceAttributeGroupId);
    }

    public createAttributeGroupTranslationReference(storeId: number, entityAttributeGroupTranslationId: number, referenceAttributeGroupTranslationId: number) {
        return this.createReference(storeId, EntityReferenceDAO.ATTRIBUTE_GROUP_TRANSLATION_ENTITY, entityAttributeGroupTranslationId, referenceAttributeGroupTranslationId);
    }

    public createCurrencyReference(storeId: number, entityCurrencyId: number, referenceCurrencyId: number) {
        return this.createReference(storeId, EntityReferenceDAO.CURRENCY_ENTITY, entityCurrencyId, referenceCurrencyId);
    }

    public createCountryReference(storeId: number, entityCountryId: number, referenceCountryId: number) {
        return this.createReference(storeId, EntityReferenceDAO.COUNTRY_ENTITY, entityCountryId, referenceCountryId);
    }

    public createCategoryReference(storeId: number, entityCategoryId: number, referenceCategoryId: number) {
        return this.createReference(storeId, EntityReferenceDAO.CATEGORY_ENTITY, entityCategoryId, referenceCategoryId);
    }

    public createLanguageReference(storeId: number, entityLanguageId: number, referenceLanguageId: number) {
        return this.createReference(storeId, EntityReferenceDAO.LANGUAGE_ENTITY, entityLanguageId, referenceLanguageId);
    }

    public createProductDescriptionReference(storeId: number, entityProductDescriptionId: number, referenceProductDescriptionId: number) {
        return this.createReference(storeId, EntityReferenceDAO.PRODUCT_DESCRIPTION_ENTITY, entityProductDescriptionId, referenceProductDescriptionId);
    }

    public createProductReference(storeId: number, entityProductId: number, referenceProductId: number) {
        return this.createReference(storeId, EntityReferenceDAO.PRODUCT_ENTITY, entityProductId, referenceProductId);
    }

    public createManufacturerReference(storeId: number, entityManufacturerId: number, referenceManufacturerId: number) {
        return this.createReference(storeId, EntityReferenceDAO.MANUFACTURER_ENTITY, entityManufacturerId, referenceManufacturerId);
    }
    public createReference(scopeIntegerId: number, entityName: string, entityIntegerId: number, referenceIntegerId: number) {
        const entityReference: EntityReferenceCreateEntity = {
            EntityName: entityName,
            ScopeIntegerId: scopeIntegerId,
            EntityIntegerId: entityIntegerId,
            ReferenceIntegerId: referenceIntegerId
        }
        return this.generatedDAO.create(entityReference);
    }

    public getStoreProduct(storeId: number, productId: number) {
        return this.getSingleReferenceByScopeIntegerIdEntityNameAndEntityIntegerId(storeId, EntityReferenceDAO.PRODUCT_ENTITY, productId);
    }

    public getStoreCurrency(storeId: number, currencyId: number) {
        return this.getSingleReferenceByScopeIntegerIdEntityNameAndEntityIntegerId(storeId, EntityReferenceDAO.CURRENCY_ENTITY, currencyId);
    }

    public getStoreCountry(storeId: number, countryId: number) {
        return this.getSingleReferenceByScopeIntegerIdEntityNameAndEntityIntegerId(storeId, EntityReferenceDAO.COUNTRY_ENTITY, countryId);
    }

    public getStoreCategory(storeId: number, categoryId: number) {
        return this.getSingleReferenceByScopeIntegerIdEntityNameAndEntityIntegerId(storeId, EntityReferenceDAO.CATEGORY_ENTITY, categoryId);
    }

    public getStoreManufacturer(storeId: number, manufacturerId: number) {
        return this.getSingleReferenceByScopeIntegerIdEntityNameAndEntityIntegerId(storeId, EntityReferenceDAO.MANUFACTURER_ENTITY, manufacturerId);
    }

    public getStoreAttribute(storeId: number, attributeId: number) {
        return this.getSingleReferenceByScopeIntegerIdEntityNameAndEntityIntegerId(storeId, EntityReferenceDAO.ATTRIBUTE_ENTITY, attributeId);
    }

    public getStoreAttributeGroup(storeId: number, attributeGroupId: number) {
        return this.getSingleReferenceByScopeIntegerIdEntityNameAndEntityIntegerId(storeId, EntityReferenceDAO.ATTRIBUTE_GROUP_ENTITY, attributeGroupId);
    }

    public getStoreAttributeGroupDescription(storeId: number, attributeGroupTranslationId: number) {
        return this.getSingleReferenceByScopeIntegerIdEntityNameAndEntityIntegerId(storeId, EntityReferenceDAO.ATTRIBUTE_GROUP_TRANSLATION_ENTITY, attributeGroupTranslationId);
    }

    public getStoreCategoryReference(storeId: number, categoryId: number) {
        return this.getSingleReferenceByScopeIntegerIdEntityNameAndEntityIntegerId(storeId, EntityReferenceDAO.CATEGORY_ENTITY, categoryId);
    }

    public getStoreLanguageReference(storeId: number, languageId: number) {
        return this.getSingleReferenceByScopeIntegerIdEntityNameAndEntityIntegerId(storeId, EntityReferenceDAO.LANGUAGE_ENTITY, languageId);
    }

    public getStoreProductDescriptionReference(storeId: number, productDescriptionId: number) {
        return this.getSingleReferenceByScopeIntegerIdEntityNameAndEntityIntegerId(storeId, EntityReferenceDAO.PRODUCT_DESCRIPTION_ENTITY, productDescriptionId);
    }

    public getSingleReferenceByScopeIntegerIdEntityNameAndEntityIntegerId(scopeIntegerId: number, entityName: string, entityIntegerId: number) {
        const references = this.getByScopeIntegerIdEntityNameAndEntityIntegerId(scopeIntegerId, entityName, entityIntegerId);
        if (references.length == 0) {
            return null;
        }

        if (references.length > 1) {
            this.throwError(`Found more than one references for scope integer id ${scopeIntegerId}, entity name ${entityName} and entity integer id ${entityIntegerId}`);
        }
        return references[0];
    }

    private throwError(errorMessage: string) {
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
    }

    public getByScopeIntegerIdEntityNameAndEntityIntegerId(scopeIntegerId: number, entityName: string, entityIntegerId: number) {
        const querySettings: EntityReferenceEntityOptions = {
            $filter: {
                equals: {
                    ScopeIntegerId: scopeIntegerId,
                    EntityName: entityName,
                    EntityIntegerId: entityIntegerId
                }
            }
        };
        return this.generatedDAO.findAll(querySettings);
    }

}