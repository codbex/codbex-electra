import { getLogger } from "../../../../../codbex-electra/util/LoggerUtil";
import { oc_product_descriptionRepository as OpenCartProductDescriptionDAO, oc_product_descriptionCreateEntity as OpenCartProductDesceiptionCreateEntity, oc_product_descriptionUpdateEntity as OpenCartProductDescriptionUpdateEntity } from "../../../../dao/oc_product_descriptionRepository";
import { ProductDescriptionRepository as ProductDescriptionDAO, ProductDescriptionEntity } from "../../../../../codbex-electra/gen/dao/Products/ProductDescriptionRepository";
import { EntityReferenceDAO } from "../../../../../codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "../../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";

const logger = getLogger(import.meta.url);

export function onMessage(message: any) {
    const productEntry = message.getBody();

    const productId = productEntry.productId;
    const productDescriptions = getProductDescriptions(productId);

    const storeId = productEntry.store.id;
    productDescriptions.forEach((productDescription) => {
        const productReference = productEntry.reference;

        const ocProductDescription = createOpenCartProductDescription(storeId, productDescription, productReference);

        const dataSourceName = productEntry.store.dataSourceName;
        const ocProductDescriptionDAO = new OpenCartProductDescriptionDAO(dataSourceName);
        ocProductDescriptionDAO.upsert(ocProductDescription);
    });
    return message;
}

function getProductDescriptions(productId: number) {
    const productDescriptionDAO = new ProductDescriptionDAO();
    const querySettings = {
        $filter: {
            equals: {
                Product: productId
            }
        }
    };
    return productDescriptionDAO.findAll(querySettings);
}

function createOpenCartProductDescription(storeId: number, productDescription: ProductDescriptionEntity, productReference: EntityReferenceEntity): OpenCartProductDesceiptionCreateEntity | OpenCartProductDescriptionUpdateEntity {
    if (!productReference || !productReference.ReferenceIntegerId) {
        throwError(`Missing product reference id: ${productReference ? JSON.stringify(productReference) : null}`);
    }
    const id = productReference.ReferenceIntegerId;
    const languageId = getLanguageReference(storeId, productDescription.Language);


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

function getLanguageReference(storeId: number, languageId: number): number {
    const entityReferenceDAO = new EntityReferenceDAO();
    const languageReference = entityReferenceDAO.getStoreLanguageReference(storeId, languageId);
    if (!languageReference) {
        throwError(`Missing reference for language with id ${languageId}`);
    }
    return languageReference!.ReferenceIntegerId!;
}

function throwError(errorMessage: string) {
    logger.error(errorMessage);
    throw new Error(errorMessage);
}
