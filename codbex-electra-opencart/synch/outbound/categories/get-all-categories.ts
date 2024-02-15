import { CategoryRepository as CategoryDAO, CategoryEntityOptions } from "../../../../codbex-electra/gen/dao/Products/CategoryRepository";
import { StoreEntry } from "../get-all-relevant-stores";
import { BaseHandler } from "../base-handler";

export function onMessage(message: any) {
    const store: StoreEntry = message.getBody();

    const handler = new GetCategoriesHandler(store);
    const languageEntries = handler.handle();

    message.setBody(languageEntries);
    return message;
}

export interface CategoryEntry {
    readonly categoryId: number;
    readonly store: StoreEntry;
}

class GetCategoriesHandler extends BaseHandler {
    private readonly store;
    private readonly categoryDAO;

    constructor(store: StoreEntry) {
        super(import.meta.url);
        this.store = store;
        this.categoryDAO = new CategoryDAO();
    }

    handle() {
        const querySettings: CategoryEntityOptions = {
            $select: ["Id"]
        };
        const categories = this.categoryDAO.findAll(querySettings);
        this.logger.info("Found [{}] categories which must be replicated to store [{}]", categories.length, this.store.name);

        const entries: CategoryEntry[] = [];
        categories.forEach((category) => {
            const entry = {
                categoryId: category.Id,
                store: this.store
            }
            entries.push(entry);
        });
        return entries;
    }
}