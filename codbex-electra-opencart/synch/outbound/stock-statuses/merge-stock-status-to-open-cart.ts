import { oc_stock_statusRepository as OpenCartStockStatusDAO, oc_stock_statusCreateEntity as OpenCartStockStatusCreateEntity, oc_stock_statusUpdateEntity as OpenCartStockStatusUpdateEntity } from "codbex-electra-opencart/dao/oc_stock_statusRepository";
import { StockStatusRepository as StockStatusDAO, StockStatusEntity } from "codbex-electra/gen/dao/Settings/StockStatusRepository";
import { EntityReferenceDAO } from "codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "codbex-electra/gen/dao/Settings/EntityReferenceRepository";
import { BaseHandler } from "codbex-electra-opencart/synch/base-handler";
import { StockStatusEntry } from "./get-all-stock-statuses";

export function onMessage(message: any) {
    const stockStatusEntry: StockStatusEntry = message.getBody();

    const handler = new MergeStockStatusToOpenCartHandler(stockStatusEntry);
    handler.handle();

    return message;
}

class MergeStockStatusToOpenCartHandler extends BaseHandler {
    private readonly stockStatusEntry;
    private readonly entityReferenceDAO;
    private readonly stockStatusDAO;
    private readonly ocStockStatusDAO;

    constructor(stockStatusEntry: StockStatusEntry) {
        super(import.meta.url);
        this.stockStatusEntry = stockStatusEntry;

        this.entityReferenceDAO = new EntityReferenceDAO();
        this.stockStatusDAO = new StockStatusDAO();
        const dataSourceName = stockStatusEntry.store.dataSourceName;
        this.ocStockStatusDAO = new OpenCartStockStatusDAO(dataSourceName);
    }

    handle() {
        const storeId = this.stockStatusEntry.store.id;
        const stockStatusId = this.stockStatusEntry.stockStatusId;
        const stockStatusReference = this.entityReferenceDAO.getStockStatusReferenceByEntityId(storeId, stockStatusId);

        const stockStatus = this.stockStatusDAO.findById(stockStatusId)!;
        const ocStockStatus = this.createOpenCartStockStatus(stockStatus, stockStatusReference);
        const ocStockStatusId = this.ocStockStatusDAO.upsert(ocStockStatus);

        if (!stockStatusReference) {
            this.entityReferenceDAO.createStockStatusReference(storeId, stockStatusId, ocStockStatusId);
        }
    }

    private createOpenCartStockStatus(stockStatus: StockStatusEntity, stockStatusReference: EntityReferenceEntity | null): OpenCartStockStatusCreateEntity | OpenCartStockStatusUpdateEntity {
        const languageId = this.getOpenCartLanguageId(stockStatus.Language);

        if (stockStatusReference) {
            return {
                stock_status_id: stockStatusReference.ReferenceIntegerId!,
                language_id: languageId,
                name: stockStatus.Name,
            };
        } else {
            return {
                stock_status_id: 0,
                language_id: languageId,
                name: stockStatus.Name,
            };
        }
    }

    private getOpenCartLanguageId(languageId: number): number {
        const languageReference = this.entityReferenceDAO.getRequiredLanguageReferenceByEntityId(this.stockStatusEntry.store.id, languageId);
        return languageReference.ReferenceIntegerId!;
    }

}
