import { oc_product_attributeRepository as OpenCartProductAttributeDAO, oc_product_attributeCreateEntity as OpenCartProductAttributeCreateEntity, oc_product_attributeUpdateEntity as OpenCartProductAttributeUpdateEntity } from "../../../../dao/oc_product_attributeRepository";
import { ProductAttributeRepository as ProductAttributeDAO, ProductAttributeEntity } from "../../../../../codbex-electra/gen/dao/Products/ProductAttributeRepository";
import { EntityReferenceDAO } from "../../../../../codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "../../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";
import { BaseHandler } from "../../base-handler";
import { ProductEntry } from "../get-store-products";

export function onMessage(message: any) {
    const productEntry: ProductEntry = message.getBody();

    const handler = new MergeProductAttributeToOpenCartHandler(productEntry);
    handler.handle();

    return message;
}
class MergeProductAttributeToOpenCartHandler extends BaseHandler {
    private readonly productEntry;
    private readonly entityReferenceDAO;
    private readonly ocProductAttributeDAO;

    constructor(productEntry: ProductEntry) {
        super(import.meta.url);
        this.productEntry = productEntry;

        this.entityReferenceDAO = new EntityReferenceDAO();
        this.ocProductAttributeDAO = new OpenCartProductAttributeDAO(productEntry.store.dataSourceName);
    }

    handle() {
        const productAttributes = this.getProductAttributes();
        const productReference = this.entityReferenceDAO.getStoreProduct(this.productEntry.store.id, this.productEntry.productId);

        productAttributes.forEach((productAttribute) => {
            const ocProductAttribute = this.createOpenCartProductAttribute(productAttribute, productReference);
            this.ocProductAttributeDAO.upsert(ocProductAttribute);
        });
    }

    private getProductAttributes() {
        const productAttributeDAO = new ProductAttributeDAO();
        const querySettings = {
            $filter: {
                equals: {
                    Product: this.productEntry.productId
                }
            }
        };
        return productAttributeDAO.findAll(querySettings);
    }

    private createOpenCartProductAttribute(productAttribute: ProductAttributeEntity, productReference: EntityReferenceEntity | null): OpenCartProductAttributeCreateEntity | OpenCartProductAttributeUpdateEntity {
        if (!productReference || !productReference.ReferenceIntegerId) {
            this.throwError(`Missing product reference id: ${productReference ? JSON.stringify(productReference) : null}`);
        }
        const id = productReference!.ReferenceIntegerId;

        const storeId = this.productEntry.store.id;
        const languageId = this.getLanguageReference(storeId, productAttribute.Language);
        const attributeId = this.getAttributeReference(storeId, productAttribute.Attribute);

        return {
            product_id: id,
            attribute_id: attributeId,
            language_id: languageId,
            text: productAttribute.Text
        };
    }

    private getLanguageReference(storeId: number, languageId: number) {
        const entityReferenceDAO = new EntityReferenceDAO();
        const languageReference = entityReferenceDAO.getStoreLanguageReference(storeId, languageId);
        if (!languageReference) {
            this.throwError(`Missing reference for language with id ${languageId}`);
        }
        return languageReference!.ReferenceIntegerId!;
    }

    private getAttributeReference(storeId: number, attributeId: number) {
        const entityReferenceDAO = new EntityReferenceDAO();
        const attributeReference = entityReferenceDAO.getStoreAttribute(storeId, attributeId);
        if (!attributeReference) {
            this.throwError(`Missing reference for attribute with id ${attributeId}`);
        }
        return attributeReference!.ReferenceIntegerId!;
    }
}
