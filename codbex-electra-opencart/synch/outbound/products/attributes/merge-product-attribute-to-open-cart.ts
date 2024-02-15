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
    private readonly productAttributeDAO;
    private readonly ocProductAttributeDAO;

    constructor(productEntry: ProductEntry) {
        super(import.meta.url);
        this.productEntry = productEntry;

        this.entityReferenceDAO = new EntityReferenceDAO();
        this.productAttributeDAO = new ProductAttributeDAO();
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
        const querySettings = {
            $filter: {
                equals: {
                    Product: this.productEntry.productId
                }
            }
        };
        return this.productAttributeDAO.findAll(querySettings);
    }

    private createOpenCartProductAttribute(productAttribute: ProductAttributeEntity, productReference: EntityReferenceEntity | null): OpenCartProductAttributeCreateEntity | OpenCartProductAttributeUpdateEntity {
        if (!productReference || !productReference.ReferenceIntegerId) {
            this.throwError(`Missing product reference id: ${productReference ? JSON.stringify(productReference) : null}`);
        }
        const id = productReference!.ReferenceIntegerId;

        const languageId = this.getOpenCartLanguageId(productAttribute.Language);
        const attributeId = this.getOpenCartAttributeId(productAttribute.Attribute);

        return {
            product_id: id,
            attribute_id: attributeId,
            language_id: languageId,
            text: productAttribute.Text
        };
    }

    private getOpenCartLanguageId(languageId: number): number {
        const languageReference = this.entityReferenceDAO.getRequiredStoreLanguageReference(this.productEntry.store.id, languageId);
        return languageReference.ReferenceIntegerId!;
    }

    private getOpenCartAttributeId(attributeId: number) {
        const attributeReference = this.entityReferenceDAO.getStoreAttribute(this.productEntry.store.id, attributeId);
        if (!attributeReference) {
            this.throwError(`Missing reference for attribute with id ${attributeId}`);
        }
        return attributeReference!.ReferenceIntegerId!;
    }
}
