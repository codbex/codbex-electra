import { getLogger } from "../../../../../codbex-electra/util/LoggerUtil";
import { oc_product_attributeRepository as OpenCartProductAttributeDAO, oc_product_attributeCreateEntity as OpenCartProductAttributeCreateEntity, oc_product_attributeUpdateEntity as OpenCartProductAttributeUpdateEntity } from "../../../../dao/oc_product_attributeRepository";
import { ProductAttributeRepository as ProductAttributeDAO, ProductAttributeEntity } from "../../../../../codbex-electra/gen/dao/Products/ProductAttributeRepository";
import { EntityReferenceDAO } from "../../../../../codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "../../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";

const logger = getLogger(import.meta.url);

export function onMessage(message: any) {
    const productEntry = message.getBody();

    const productId = productEntry.productId;
    const productAttributes = getProductAttributes(productId);

    const storeId = productEntry.store.id;
    productAttributes.forEach((productAttribute) => {
        const productReference = productEntry.reference;

        const ocProductAttribute = createOpenCartProductAttribute(storeId, productAttribute, productReference);

        const dataSourceName = productEntry.store.dataSourceName;
        const ocProductAttributeDAO = new OpenCartProductAttributeDAO(dataSourceName);
        ocProductAttributeDAO.upsert(ocProductAttribute);
    });
    return message;
}

function getProductAttributes(productId: number) {
    const productAttributeDAO = new ProductAttributeDAO();
    const querySettings = {
        $filter: {
            equals: {
                Product: productId
            }
        }
    };
    return productAttributeDAO.findAll(querySettings);
}

function createOpenCartProductAttribute(storeId: number, productAttribute: ProductAttributeEntity, productReference: EntityReferenceEntity): OpenCartProductAttributeCreateEntity | OpenCartProductAttributeUpdateEntity {
    if (!productReference || !productReference.ReferenceIntegerId) {
        throwError(`Missing product reference id: ${productReference ? JSON.stringify(productReference) : null}`);
    }
    const id = productReference.ReferenceIntegerId;
    const languageId = getLanguageReference(storeId, productAttribute.Language);
    const attributeId = getAttributeReference(storeId, productAttribute.Attribute);

    return {
        product_id: id,
        attribute_id: attributeId,
        language_id: languageId,
        text: productAttribute.Text
    };
}

function getLanguageReference(storeId: number, languageId: number) {
    const entityReferenceDAO = new EntityReferenceDAO();
    const languageReference = entityReferenceDAO.getStoreLanguageReference(storeId, languageId);
    if (!languageReference) {
        throwError(`Missing reference for language with id ${languageId}`);
    }
    return languageReference!.ReferenceIntegerId!;
}

function getAttributeReference(storeId: number, attributeId: number) {
    const entityReferenceDAO = new EntityReferenceDAO();
    const attributeReference = entityReferenceDAO.getStoreAttribute(storeId, attributeId);
    if (!attributeReference) {
        throwError(`Missing reference for attribute with id ${attributeId}`);
    }
    return attributeReference!.ReferenceIntegerId!;
}

function throwError(errorMessage: string) {
    logger.error(errorMessage);
    throw new Error(errorMessage);
}
