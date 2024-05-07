import { EntityReferenceRepository, EntityReferenceEntityOptions, EntityReferenceCreateEntity } from "codbex-electra/gen/dao/entity-references/EntityReferenceRepository";
import { caches } from "sdk/cache";

import { getLogger } from "codbex-electra/util/LoggerUtil";

export class EntityReferenceDAO {

    private static readonly SALES_ORDER_ENTITY = "SalesOrder";
    private static readonly SALES_ORDER_ITEM_ENTITY = "SalesOrderItem";
    private static readonly ORDER_STATUS_ENTITY = "OrderStatus";
    private static readonly STOCK_STATUS_ENTITY = "StockStatus";
    private static readonly ZONE_ENTITY = "Zone";
    private static readonly CURRENCY_ENTITY = "Currency";
    private static readonly COUNTRY_ENTITY = "Country";
    private static readonly CATEGORY_ENTITY = "Category";
    private static readonly LANGUAGE_ENTITY = "Language";
    private static readonly ATTRIBUTE_ENTITY = "Attribute";
    private static readonly ATTRIBUTE_GROUP_ENTITY = "AttributeGroup";
    private static readonly ATTRIBUTE_GROUP_TRANSLATION_ENTITY = "AttributeGroupTranslation";
    private static readonly MANUFACTURER_ENTITY = "Manufacturer";
    private static readonly PRODUCT_ENTITY = "Product";
    private static readonly CUSTOMER_ENTITY = "Customer";

    private readonly logger = getLogger(import.meta.url);
    private readonly generatedDAO;

    constructor() {
        this.generatedDAO = new EntityReferenceRepository();
    }

    public createSalesOrderReference(storeId: number, salesOrderEntityId: number, salesOrderReferenceId: number) {
        return this.createReference(storeId, EntityReferenceDAO.SALES_ORDER_ENTITY, salesOrderEntityId, salesOrderReferenceId);
    }

    public createSalesOrderItemReference(storeId: number, salesOrderItemEntityId: number, salesOrderItemReferenceId: number) {
        return this.createReference(storeId, EntityReferenceDAO.SALES_ORDER_ITEM_ENTITY, salesOrderItemEntityId, salesOrderItemReferenceId);
    }

    public createCustomerReference(storeId: number, customerEntityId: number, customerReferenceId: number) {
        return this.createReference(storeId, EntityReferenceDAO.CUSTOMER_ENTITY, customerEntityId, customerReferenceId);
    }

    public createOrderStatusReference(storeId: number, orderStatusEntityId: number, orderStatusReferenceId: number) {
        return this.createReference(storeId, EntityReferenceDAO.ORDER_STATUS_ENTITY, orderStatusEntityId, orderStatusReferenceId);
    }

    public createAttributeReference(storeId: number, attributeEntityId: number, attributeReferenceId: number) {
        return this.createReference(storeId, EntityReferenceDAO.ATTRIBUTE_ENTITY, attributeEntityId, attributeReferenceId);
    }

    public createAttributeGroupReference(storeId: number, attributeGroupEntityId: number, attributeGroupReferenceId: number) {
        return this.createReference(storeId, EntityReferenceDAO.ATTRIBUTE_GROUP_ENTITY, attributeGroupEntityId, attributeGroupReferenceId);
    }

    public createAttributeGroupTranslationReference(storeId: number, attributeGroupTranslationEntityId: number, attributeGroupTranslationReferenceId: number) {
        return this.createReference(storeId, EntityReferenceDAO.ATTRIBUTE_GROUP_TRANSLATION_ENTITY, attributeGroupTranslationEntityId, attributeGroupTranslationReferenceId);
    }

    public createCurrencyReference(storeId: number, currencyEntityId: number, currencyReferenceId: number) {
        return this.createReference(storeId, EntityReferenceDAO.CURRENCY_ENTITY, currencyEntityId, currencyReferenceId);
    }

    public createCountryReference(storeId: number, countryEntityId: number, countryReferenceId: number) {
        return this.createReference(storeId, EntityReferenceDAO.COUNTRY_ENTITY, countryEntityId, countryReferenceId);
    }

    public createZoneReference(storeId: number, zoneEntityId: number, zoneReferenceId: number) {
        return this.createReference(storeId, EntityReferenceDAO.ZONE_ENTITY, zoneEntityId, zoneReferenceId);
    }

    public createCategoryReference(storeId: number, categoryEntityId: number, categoryReferenceId: number) {
        return this.createReference(storeId, EntityReferenceDAO.CATEGORY_ENTITY, categoryEntityId, categoryReferenceId);
    }
    public createStockStatusReference(storeId: number, stockStatusEntityId: number, stockStatusReferenceId: number) {
        return this.createReference(storeId, EntityReferenceDAO.STOCK_STATUS_ENTITY, stockStatusEntityId, stockStatusReferenceId);
    }

    public createLanguageReference(storeId: number, languageEntityId: number, languageReferenceId: number) {
        return this.createReference(storeId, EntityReferenceDAO.LANGUAGE_ENTITY, languageEntityId, languageReferenceId);
    }

    public createProductReference(storeId: number, productEntityId: number, productReferenceId: number) {
        return this.createReference(storeId, EntityReferenceDAO.PRODUCT_ENTITY, productEntityId, productReferenceId);
    }

    public createManufacturerReference(storeId: number, manufacturerEntityId: number, manufacturerReferenceId: number) {
        return this.createReference(storeId, EntityReferenceDAO.MANUFACTURER_ENTITY, manufacturerEntityId, manufacturerReferenceId);
    }

    private createReference(scopeIntegerId: number, entityName: string, entityIntegerId: number, referenceIntegerId: number) {
        const entityReference: EntityReferenceCreateEntity = {
            EntityName: entityName,
            ScopeIntegerId: scopeIntegerId,
            EntityIntegerId: entityIntegerId,
            ReferenceIntegerId: referenceIntegerId
        }
        return this.generatedDAO.create(entityReference);
    }

    public getProductReferenceByEntityId(storeId: number, productEntityId: number) {
        return this.getReferenceByScopeIdEntityNameAndEntityId(storeId, EntityReferenceDAO.PRODUCT_ENTITY, productEntityId);
    }

    public getOrderStatusReferenceByEntityId(storeId: number, orderStatusEntityId: number) {
        return this.getReferenceByScopeIdEntityNameAndEntityId(storeId, EntityReferenceDAO.ORDER_STATUS_ENTITY, orderStatusEntityId);
    }

    public getZoneReferenceByEntityId(storeId: number, zoneEntityId: number) {
        return this.getReferenceByScopeIdEntityNameAndEntityId(storeId, EntityReferenceDAO.ZONE_ENTITY, zoneEntityId);
    }

    public getCurrencyReferenceByEntityId(storeId: number, currencyEntityId: number) {
        return this.getReferenceByScopeIdEntityNameAndEntityId(storeId, EntityReferenceDAO.CURRENCY_ENTITY, currencyEntityId);
    }
    public getStockStatusReferenceByEntityId(storeId: number, stockStatusEntityId: number) {
        return this.getReferenceByScopeIdEntityNameAndEntityId(storeId, EntityReferenceDAO.STOCK_STATUS_ENTITY, stockStatusEntityId);
    }

    public getCountryReferenceByEntityId(storeId: number, countryEntityId: number) {
        return this.getReferenceByScopeIdEntityNameAndEntityId(storeId, EntityReferenceDAO.COUNTRY_ENTITY, countryEntityId);
    }

    public getCategoryReferenceByEntityId(storeId: number, categoryEntityId: number) {
        return this.getReferenceByScopeIdEntityNameAndEntityId(storeId, EntityReferenceDAO.CATEGORY_ENTITY, categoryEntityId);
    }

    public getManufacturerReferenceByEntityId(storeId: number, manufactureEntityId: number) {
        return this.getReferenceByScopeIdEntityNameAndEntityId(storeId, EntityReferenceDAO.MANUFACTURER_ENTITY, manufactureEntityId);
    }

    public getAttributeReferenceByEntityId(storeId: number, attributeEntityId: number) {
        return this.getReferenceByScopeIdEntityNameAndEntityId(storeId, EntityReferenceDAO.ATTRIBUTE_ENTITY, attributeEntityId);
    }

    public getSalesOrderItemReferenceByEntityId(storeId: number, salesOrderItemEntityId: number) {
        return this.getReferenceByScopeIdEntityNameAndEntityId(storeId, EntityReferenceDAO.SALES_ORDER_ITEM_ENTITY, salesOrderItemEntityId);
    }

    public getAttributeGroupReferenceByEntityId(storeId: number, attributeGroupEntityId: number) {
        return this.getReferenceByScopeIdEntityNameAndEntityId(storeId, EntityReferenceDAO.ATTRIBUTE_GROUP_ENTITY, attributeGroupEntityId);
    }

    public getAttributeGroupDescriptionReferenceByEntityId(storeId: number, attributeGroupTranslationEntityId: number) {
        return this.getReferenceByScopeIdEntityNameAndEntityId(storeId, EntityReferenceDAO.ATTRIBUTE_GROUP_TRANSLATION_ENTITY, attributeGroupTranslationEntityId);
    }

    public getLanguageReferenceByEntityId(storeId: number, languageEntityId: number) {
        return this.getReferenceByScopeIdEntityNameAndEntityId(storeId, EntityReferenceDAO.LANGUAGE_ENTITY, languageEntityId);
    }

    public getRequiredCurrencyReferenceByEntityId(storeId: number, currencyEntityId: number) {
        return this.getRequiredReferenceByEntityId(storeId, EntityReferenceDAO.CURRENCY_ENTITY, currencyEntityId);
    }

    public getRequiredOrderStatusReferenceByEntityId(storeId: number, orderStatusEntityId: number) {
        return this.getRequiredReferenceByEntityIdUsingCache(storeId, EntityReferenceDAO.ORDER_STATUS_ENTITY, orderStatusEntityId);
    }

    public getRequiredCountryReferenceByEntityId(storeId: number, countryEntityId: number) {
        return this.getRequiredReferenceByEntityIdUsingCache(storeId, EntityReferenceDAO.COUNTRY_ENTITY, countryEntityId);
    }

    public getRequiredCustomerReferenceByEntityId(storeId: number, customerEntityId: number) {
        return this.getRequiredReferenceByEntityId(storeId, EntityReferenceDAO.CUSTOMER_ENTITY, customerEntityId);
    }

    public getRequiredZoneReferenceByEntityId(storeId: number, zoneEntityId: number) {
        return this.getRequiredReferenceByEntityId(storeId, EntityReferenceDAO.ZONE_ENTITY, zoneEntityId);
    }
    public getRequiredStockStatusReferenceReferenceByEntityId(storeId: number, stockStatusEntityId: number) {
        return this.getRequiredReferenceByEntityId(storeId, EntityReferenceDAO.STOCK_STATUS_ENTITY, stockStatusEntityId);
    }

    public getRequiredAttributeGroupReferenceByEntityId(storeId: number, attributeGroupEntityId: number) {
        return this.getRequiredReferenceByEntityId(storeId, EntityReferenceDAO.ATTRIBUTE_GROUP_ENTITY, attributeGroupEntityId);
    }

    public getRequiredSalesOrderReferenceReferenceByEntityId(storeId: number, salesOrderEntityId: number) {
        return this.getRequiredReferenceByEntityId(storeId, EntityReferenceDAO.SALES_ORDER_ENTITY, salesOrderEntityId);
    }

    public getRequiredProductReferenceReferenceByEntityId(storeId: number, productEntityId: number) {
        return this.getRequiredReferenceByEntityId(storeId, EntityReferenceDAO.PRODUCT_ENTITY, productEntityId);
    }

    public getRequiredAttributeReferenceReferenceByEntityId(storeId: number, attributeEntityId: number) {
        return this.getRequiredReferenceByEntityId(storeId, EntityReferenceDAO.ATTRIBUTE_ENTITY, attributeEntityId);
    }

    public getRequiredManufacturerReferenceReferenceByEntityId(storeId: number, manufacturerEntityId: number) {
        return this.getRequiredReferenceByEntityId(storeId, EntityReferenceDAO.MANUFACTURER_ENTITY, manufacturerEntityId);
    }

    public getRequiredCategoryReferenceReferenceByEntityId(storeId: number, categoryEntityId: number) {
        return this.getRequiredReferenceByEntityId(storeId, EntityReferenceDAO.CATEGORY_ENTITY, categoryEntityId);
    }

    public getRequiredLanguageReferenceByEntityId(storeId: number, languageEntityId: number) {
        return this.getRequiredReferenceByEntityIdUsingCache(storeId, EntityReferenceDAO.LANGUAGE_ENTITY, languageEntityId);
    }

    private getRequiredReferenceByEntityIdUsingCache(scopeIntegerId: number, entityName: string, entityIntegerId: number) {
        const cacheKey = entityName + "###EntityId:" + entityIntegerId;
        if (caches.contains(cacheKey)) {
            return caches.get(cacheKey);
        }
        const ref = this.getRequiredReferenceByEntityId(scopeIntegerId, entityName, entityIntegerId);
        caches.set(cacheKey, ref);
        return ref;
    }

    private getRequiredReferenceByEntityId(scopeId: number, entityName: string, entityId: number) {
        const ref = this.getReferenceByScopeIdEntityNameAndEntityId(scopeId, entityName, entityId);
        if (!ref) {
            this.throwError(`Missing reference for entity [${entityName}] with entity id [${entityId}] in scope [${scopeId}]`);
        }
        return ref!;
    }

    private getReferenceByScopeIdEntityNameAndEntityId(scopeIntegerId: number, entityName: string, entityIntegerId: number) {
        const references = this.getByScopeIntegerIdEntityNameAndEntityIntegerId(scopeIntegerId, entityName, entityIntegerId);
        if (references.length == 0) {
            return null;
        }

        if (references.length > 1) {
            this.throwError(`Found more than one references for scope integer id ${scopeIntegerId}, entity name ${entityName} and entity integer id ${entityIntegerId}`);
        }
        return references[0];
    }

    private getByScopeIntegerIdEntityNameAndEntityIntegerId(scopeIntegerId: number, entityName: string, entityIntegerId: number) {
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

    public getCustomerReferenceByReferenceId(storeId: number, customerReferenceId: number) {
        return this.getReferenceByScopeIdEntityNameAndReferenceId(storeId, EntityReferenceDAO.CUSTOMER_ENTITY, customerReferenceId);
    }

    public getOrderReferenceByReferenceId(storeId: number, orderReferenceId: number) {
        return this.getReferenceByScopeIdEntityNameAndReferenceId(storeId, EntityReferenceDAO.SALES_ORDER_ENTITY, orderReferenceId);
    }

    public getRequiredLanguageReferenceByReferenceId(storeId: number, languageReferenceId: number) {
        return this.getRequireReferenceByReferenceId(storeId, EntityReferenceDAO.LANGUAGE_ENTITY, languageReferenceId);
    }

    public getRequiredCurrencyReferenceByReferenceId(storeId: number, currencyReferenceId: number) {
        return this.getRequireReferenceByReferenceId(storeId, EntityReferenceDAO.CURRENCY_ENTITY, currencyReferenceId);
    }

    public getRequiredCustomerReferenceByReferenceId(storeId: number, customerReferenceId: number) {
        return this.getRequireReferenceByReferenceId(storeId, EntityReferenceDAO.CUSTOMER_ENTITY, customerReferenceId);
    }

    public getRequiredZoneReferenceByReferenceId(storeId: number, zoneReferenceId: number) {
        return this.getRequireReferenceByReferenceId(storeId, EntityReferenceDAO.ZONE_ENTITY, zoneReferenceId);
    }

    public getRequiredCountryReferenceByReferenceId(storeId: number, countryReferenceId: number) {
        return this.getRequireReferenceByReferenceId(storeId, EntityReferenceDAO.COUNTRY_ENTITY, countryReferenceId);
    }

    public getRequiredOrderStatusReferenceByReferenceId(storeId: number, orderStatusReferenceId: number) {
        return this.getRequireReferenceByReferenceId(storeId, EntityReferenceDAO.ORDER_STATUS_ENTITY, orderStatusReferenceId);
    }

    public getRequiredProductReferenceReferenceByReferenceId(storeId: number, productReferenceId: number) {
        return this.getRequireReferenceByReferenceId(storeId, EntityReferenceDAO.PRODUCT_ENTITY, productReferenceId);
    }

    private getRequireReferenceByReferenceId(scopeId: number, entityName: string, referenceId: number) {
        const ref = this.getReferenceByScopeIdEntityNameAndReferenceId(scopeId, entityName, referenceId);
        if (!ref) {
            this.throwError(`Missing reference for entity [${entityName}] with reference id [${referenceId}] in scope [${scopeId}]`);
        }
        return ref!;
    }

    private getReferenceByScopeIdEntityNameAndReferenceId(scopeIntegerId: number, entityName: string, referenceId: number) {
        const references = this.getByScopeIntegerIdEntityNameAndReferenceIntegerId(scopeIntegerId, entityName, referenceId);
        if (references.length == 0) {
            return null;
        }

        if (references.length > 1) {
            this.throwError(`Found more than one references for scope integer id ${scopeIntegerId}, entity name ${entityName} and reference integer id ${referenceId}`);
        }
        return references[0];
    }

    private getByScopeIntegerIdEntityNameAndReferenceIntegerId(scopeIntegerId: number, entityName: string, referenceIntegerId: number) {
        const querySettings: EntityReferenceEntityOptions = {
            $filter: {
                equals: {
                    ScopeIntegerId: scopeIntegerId,
                    EntityName: entityName,
                    ReferenceIntegerId: referenceIntegerId
                }
            }
        };
        return this.generatedDAO.findAll(querySettings);
    }

    private throwError(errorMessage: string) {
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
    }

}
