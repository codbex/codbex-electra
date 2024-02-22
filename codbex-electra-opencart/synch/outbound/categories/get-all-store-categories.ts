import { OpenCartStoreConfig } from "../../../dao/StoreConfigDAO";
import { BaseHandler } from "../../base-handler";
import { query } from "sdk/db";

export function onMessage(message: any) {
    const store: OpenCartStoreConfig = message.getBody();

    const handler = new GetCategoriesHandler(store);
    const languageEntries = handler.handle();

    message.setBody(languageEntries);
    return message;
}

export interface CategoryEntry {
    readonly categoryId: number;
    readonly store: OpenCartStoreConfig;
}

export interface CategoryResult {
    readonly PRODUCTTOCATEGORY_CATEGORY: number;
}

class GetCategoriesHandler extends BaseHandler {
    private static readonly GET_STORE_CATEGORIES_QUERY = `
        SELECT DISTINCT pc.PRODUCTTOCATEGORY_CATEGORY FROM CODBEX_PRODUCTTOSTORE as ps
        INNER JOIN CODBEX_PRODUCTTOCATEGORY as pc
        ON ps.PRODUCTTOSTORE_PRODUCT = pc.PRODUCTTOCATEGORY_PRODUCT
        WHERE ps.PRODUCTTOSTORE_STORE = ?
    `;

    private readonly store;

    constructor(store: OpenCartStoreConfig) {
        super(import.meta.url);
        this.store = store;
    }

    handle() {
        const categoryResults: CategoryResult[] = query.execute(GetCategoriesHandler.GET_STORE_CATEGORIES_QUERY, [this.store.id]);

        this.logger.info("Found [{}] categories which must be replicated to store [{}]", categoryResults.length, this.store.name);

        const entries: CategoryEntry[] = [];
        categoryResults.forEach((categoryResult) => {
            const entry = {
                categoryId: categoryResult.PRODUCTTOCATEGORY_CATEGORY,
                store: this.store
            }
            entries.push(entry);
        });
        return entries;
    }
}
