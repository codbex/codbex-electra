import { EntityReferenceDAO } from "../../../../codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";
import { oc_currencyRepository as OpenCartCurrencyDAO, oc_currencyCreateEntity, oc_currencyUpdateEntity } from "../../../dao/oc_currencyRepository";
import { CurrencyRepository as CurrencyDAO } from "../../../../codbex-electra/gen/dao/Settings/CurrencyRepository";
import { BaseHandler } from "../base-handler";
import { CurrencyEntry } from "./get-all-currencies";

export function onMessage(message: any) {
    const currencyEntry: CurrencyEntry = message.getBody();

    const handler = new MergeCurrencyToOpenCart(currencyEntry);
    handler.handle();

    return message;
}

class MergeCurrencyToOpenCart extends BaseHandler {
    private readonly currencyEntry;
    private readonly entityReferenceDAO;
    private readonly currencyDAO;
    private readonly ocCurrencyDAO;

    constructor(currencyEntry: CurrencyEntry) {
        super(import.meta.url);
        this.currencyEntry = currencyEntry;
        this.entityReferenceDAO = new EntityReferenceDAO();
        this.currencyDAO = new CurrencyDAO();
        this.ocCurrencyDAO = new OpenCartCurrencyDAO(currencyEntry.store.dataSourceName);
    }

    handle() {
        const currencyId = this.currencyEntry.currencyId;
        const storeId = this.currencyEntry.store.id;

        const currencyReference = this.entityReferenceDAO.getStoreCurrency(storeId, currencyId);

        const ocCurrency = this.createOpenCartCurrency(currencyReference);
        const ocCurrencyId = this.ocCurrencyDAO.upsert(ocCurrency);

        if (!currencyReference) {
            this.entityReferenceDAO.createCurrencyReference(storeId, currencyId, ocCurrencyId);
        }
    }

    private createOpenCartCurrency(currencyReference: EntityReferenceEntity | null): oc_currencyCreateEntity | oc_currencyUpdateEntity {
        const currencyId = this.currencyEntry.currencyId;
        const currency = this.currencyDAO.findById(currencyId);

        const status = currency!.Status === 1;
        if (currencyReference) {
            return {
                currency_id: currencyReference!.ReferenceIntegerId!,
                code: currency!.Code,
                date_modified: currency!.DateModified!,
                decimal_place: currency!.DecimalPlace,
                symbol_left: currency!.SymbolLeft,
                symbol_right: currency!.SymbolRight,
                title: currency!.Title,
                value: currency!.Value,
                status: status
            };
        } else {
            return {
                code: currency!.Code,
                date_modified: currency!.DateModified!,
                decimal_place: currency!.DecimalPlace,
                symbol_left: currency!.SymbolLeft,
                symbol_right: currency!.SymbolRight,
                title: currency!.Title,
                value: currency!.Value,
                status: status
            };
        }
    }
}
