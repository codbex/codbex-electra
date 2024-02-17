import { oc_manufacturerRepository as OpenCartManufacturerDAO, oc_manufacturerCreateEntity as OpenCartManufacturerCreateEntity, oc_manufacturerUpdateEntity as OpenCartManufacturerUpdateEntity } from "../../../../dao/oc_manufacturerRepository";
import { EntityReferenceDAO } from "../../../../../codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "../../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";
import { ManufacturerRepository as ManufacturerDAO, ManufacturerEntity } from "../../../../../codbex-electra/gen/dao/Products/ManufacturerRepository";
import { ManufacturerEntry } from "./get-all-relevant-manufacturers";
import { BaseHandler } from "../../../base-handler";

export function onMessage(message: any) {
    const manufacturerEntry: ManufacturerEntry = message.getBody();

    const handler = new MergeManufacturerToOpenCartHandler(manufacturerEntry);
    handler.handle();

    return message;
}

class MergeManufacturerToOpenCartHandler extends BaseHandler {
    private readonly manufacturerEntry;
    private readonly manufacturerDAO;
    private readonly entityReferenceDAO;
    private readonly ocManufacturerDAO;

    constructor(manufacturerEntry: ManufacturerEntry) {
        super(import.meta.url);
        this.manufacturerEntry = manufacturerEntry;

        this.manufacturerDAO = new ManufacturerDAO();
        const dataSourceName: string = this.manufacturerEntry.store.dataSourceName;
        this.entityReferenceDAO = new EntityReferenceDAO();
        this.ocManufacturerDAO = new OpenCartManufacturerDAO(dataSourceName);

    }

    handle() {
        const manufacturerId = this.manufacturerEntry.manufacturerId;
        const storeId = this.manufacturerEntry.store.id;

        const manufacturer = this.getManufacturer();
        const manufacturerReference = this.entityReferenceDAO.getManufacturerReferenceByEntityId(storeId, manufacturerId);

        const ocManufacturer = this.createOpenCartManufacturer(manufacturer, manufacturerReference);
        const ocManufacturerId = this.ocManufacturerDAO.upsert(ocManufacturer);

        if (!manufacturerReference) {
            this.entityReferenceDAO.createManufacturerReference(storeId, manufacturerId, ocManufacturerId);
        }
    }


    private getManufacturer(): ManufacturerEntity {
        const manufacturerId = this.manufacturerEntry.manufacturerId;
        const manufacturer = this.manufacturerDAO.findById(manufacturerId);
        if (!manufacturer) {
            this.throwError(`Missing manufacture with id [${manufacturerId}]`);
        }
        return manufacturer!;
    }

    private createOpenCartManufacturer(manufacturer: ManufacturerEntity, manufacturerReference: EntityReferenceEntity | null): OpenCartManufacturerCreateEntity | OpenCartManufacturerUpdateEntity {
        if (manufacturerReference) {
            return {
                manufacturer_id: manufacturerReference.ReferenceIntegerId,
                name: manufacturer.Name,
                image: manufacturer.Image,
                sort_order: 1
            };
        } else {
            return {
                name: manufacturer.Name,
                image: manufacturer.Image,
                sort_order: 1
            };
        }
    }

}
