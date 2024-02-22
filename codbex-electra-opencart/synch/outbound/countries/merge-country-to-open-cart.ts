import { EntityReferenceDAO } from "../../../../codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";
import { oc_countryRepository as OpenCartCountryDAO, oc_countryCreateEntity, oc_countryUpdateEntity } from "../../../dao/oc_countryRepository";
import { CountryRepository as CountryDAO } from "../../../../codbex-electra/gen/dao/Settings/CountryRepository";
import { BaseHandler } from "../../base-handler";
import { CountryEntry } from "./get-all-countries";

export function onMessage(message: any) {
    const countryEntry: CountryEntry = message.getBody();

    const handler = new MergeLanguageToOpenCart(countryEntry);
    handler.handle();

    return message;
}

class MergeLanguageToOpenCart extends BaseHandler {
    private readonly countryEntry;
    private readonly entityReferenceDAO;
    private readonly countryDAO;
    private readonly ocCountryDAO;

    constructor(countryEntry: CountryEntry) {
        super(import.meta.url);
        this.countryEntry = countryEntry;
        this.entityReferenceDAO = new EntityReferenceDAO();
        this.countryDAO = new CountryDAO();
        this.ocCountryDAO = new OpenCartCountryDAO(countryEntry.store.dataSourceName);
    }

    handle() {
        const countryId = this.countryEntry.countryId;
        const storeId = this.countryEntry.store.id;

        const countryReference = this.entityReferenceDAO.getCountryReferenceByEntityId(storeId, countryId);

        const ocCountry = this.createOpenCartCountry(countryReference);
        const ocCountryId = this.ocCountryDAO.upsert(ocCountry);

        if (!countryReference) {
            this.entityReferenceDAO.createCountryReference(storeId, countryId, ocCountryId);
        }
    }

    private createOpenCartCountry(countryReference: EntityReferenceEntity | null): oc_countryCreateEntity | oc_countryUpdateEntity {
        const countryId = this.countryEntry.countryId;
        const country = this.countryDAO.findById(countryId)!;

        const addressFormat = "";
        const postcodeRequired = false;

        const status = country.Status === 1;
        if (countryReference) {
            return {
                country_id: countryReference.ReferenceIntegerId,
                address_format: addressFormat,
                postcode_required: postcodeRequired,
                name: country.Name,
                iso_code_2: country.IsoCode2,
                iso_code_3: country.IsoCode3,
                status: status
            };
        } else {
            return {
                address_format: addressFormat,
                postcode_required: postcodeRequired,
                name: country.Name,
                iso_code_2: country.IsoCode2,
                iso_code_3: country.IsoCode3,
                status: status
            };
        }
    }
}
