import { EntityReferenceDAO } from "../../../../codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";
import { oc_zoneRepository as OpenCartZoneDAO, oc_zoneCreateEntity, oc_zoneUpdateEntity } from "../../../dao/oc_zoneRepository";
import { ZoneRepository as ZoneDAO } from "../../../../codbex-electra/gen/dao/Settings/ZoneRepository";
import { BaseHandler } from "../base-handler";
import { ZoneEntry } from "./get-all-zones";

export function onMessage(message: any) {
    const ZoneEntry: ZoneEntry = message.getBody();

    const handler = new MergeZoneToOpenCart(ZoneEntry);
    handler.handle();

    return message;
}

class MergeZoneToOpenCart extends BaseHandler {
    private readonly zoneEntry;
    private readonly entityReferenceDAO;
    private readonly zoneDAO;
    private readonly ocZoneDAO;

    constructor(zoneEntry: ZoneEntry) {
        super(import.meta.url);
        this.zoneEntry = zoneEntry;
        this.entityReferenceDAO = new EntityReferenceDAO();
        this.zoneDAO = new ZoneDAO();
        this.ocZoneDAO = new OpenCartZoneDAO(zoneEntry.store.dataSourceName);
    }

    handle() {
        const zoneId = this.zoneEntry.zoneId;
        const storeId = this.zoneEntry.store.id;

        const zoneReference = this.entityReferenceDAO.getStoreZone(storeId, zoneId);

        const ocZone = this.createOpenCartZone(zoneReference);
        const oczoneId = this.ocZoneDAO.upsert(ocZone);

        if (!zoneReference) {
            this.entityReferenceDAO.createZoneReference(storeId, zoneId, oczoneId);
        }
    }

    private createOpenCartZone(zoneReference: EntityReferenceEntity | null): oc_zoneCreateEntity | oc_zoneUpdateEntity {
        const zoneId = this.zoneEntry.zoneId;
        const zone = this.zoneDAO.findById(zoneId);

        const countryId = this.entityReferenceDAO.getRequiredStoreCountryReference(this.zoneEntry.store.id, zone.Country).ReferenceIntegerId!;
        const status = zone!.Status === 1;

        if (zoneReference) {
            return {
                zone_id: zoneReference!.ReferenceIntegerId!,
                country_id: countryId,
                name: zone!.Name,
                code: zone!.Code,
                status: status
            };
        } else {
            return {
                country_id: countryId,
                name: zone!.Name,
                code: zone!.Code,
                status: status
            };
        }
    }
}
