import { oc_product_descriptionRepository as OpenCartProductDescriptionDAO, oc_product_descriptionCreateEntity as OpenCartProductDesceiptionCreateEntity, oc_product_descriptionUpdateEntity as OpenCartProductDescriptionUpdateEntity } from "../../../../dao/oc_product_descriptionRepository";
import { ProductDescriptionRepository as ProductDescriptionDAO, ProductDescriptionEntity } from "../../../../../codbex-electra/gen/dao/Products/ProductDescriptionRepository";
import { EntityReferenceDAO } from "../../../../../codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "../../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";
import { BaseHandler } from "../../base-handler";
import { ProductEntry } from "../get-store-products";

export function onMessage(message: any) {
    const productEntry: ProductEntry = message.getBody();

    const handler = new MergeProductDescriptionToOpenCartHandler(productEntry);
    handler.handle();

    return message;
}

class MergeProductDescriptionToOpenCartHandler extends BaseHandler {
    private readonly productEntry;
    private readonly entityReferenceDAO;
    private readonly productDescriptionDAO;
    private readonly ocProductDescriptionDAO;

    constructor(productEntry: ProductEntry) {
        super(import.meta.url);
        this.productEntry = productEntry;
        this.entityReferenceDAO = new EntityReferenceDAO();
        this.productDescriptionDAO = new ProductDescriptionDAO();
        this.ocProductDescriptionDAO = new OpenCartProductDescriptionDAO(productEntry.store.dataSourceName);

    }

    handle() {
        const productDescriptions = this.getProductDescriptions();
        const productReference = this.entityReferenceDAO.getStoreProduct(this.productEntry.store.id, this.productEntry.productId);

        productDescriptions.forEach((productDescription) => {
            const ocProductDescription = this.createOpenCartProductDescription(productDescription, productReference);

            this.ocProductDescriptionDAO.upsert(ocProductDescription);
        });
    }

    private getProductDescriptions() {
        const querySettings = {
            $filter: {
                equals: {
                    Product: this.productEntry.productId
                }
            }
        };
        return this.productDescriptionDAO.findAll(querySettings);
    }

    private createOpenCartProductDescription(productDescription: ProductDescriptionEntity, productReference: EntityReferenceEntity | null): OpenCartProductDesceiptionCreateEntity | OpenCartProductDescriptionUpdateEntity {
        if (!productReference || !productReference.ReferenceIntegerId) {
            this.throwError(`Missing product reference id: ${productReference ? JSON.stringify(productReference) : null}`);
        }
        const id = productReference!.ReferenceIntegerId;
        const languageId = this.getOpenCartLanguageId(productDescription.Language);


        return {
            product_id: id,
            language_id: languageId,
            name: productDescription.Name,
            description: productDescription.Description,
            tag: productDescription.Tag,
            meta_title: productDescription.MetaTitle,
            meta_description: productDescription.MetaDescription,
            meta_keyword: productDescription.MetaKeyword
        };
    }

    private getOpenCartLanguageId(languageId: number): number {
        const languageReference = this.entityReferenceDAO.getRequiredStoreLanguageReference(this.productEntry.store.id, languageId);
        return languageReference!.ReferenceIntegerId!;
    }

}
