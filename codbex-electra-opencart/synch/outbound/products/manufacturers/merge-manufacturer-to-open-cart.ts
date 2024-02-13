import { getLogger } from "../../../../../codbex-electra/util/LoggerUtil";
import { oc_manufacturerRepository as OpenCartManufacturerDAO, oc_manufacturerCreateEntity as OpenCartManufacturerCreateEntity, oc_manufacturerUpdateEntity as OpenCartManufacturerUpdateEntity } from "../../../../dao/oc_manufacturerRepository";
import { EntityReferenceDAO } from "../../../../../codbex-electra/dao/EntityReferenceDAO";
import { EntityReferenceEntity } from "../../../../../codbex-electra/gen/dao/Settings/EntityReferenceRepository";
import { ManufacturerRepository as ManufacturerDAO, ManufacturerEntity } from "../../../../../codbex-electra/gen/dao/Products/ManufacturerRepository";

const logger = getLogger(import.meta.url);

export function onMessage(message: any) {
    const manufacturerEntry = message.getBody();
    const manufacturerId: number = manufacturerEntry.manufacturerId;
    const store = manufacturerEntry.store;
    const storeId: number = store.id;
    const dataSourceName: string = store.dataSourceName;

    const entityReferenceDAO = new EntityReferenceDAO();
    const ocManufacturerDAO = new OpenCartManufacturerDAO(dataSourceName);

    const manufacturer = getManufacturer(manufacturerId);
    const manufacturerReference = entityReferenceDAO.getStoreManufacturer(storeId, manufacturerId);

    const ocManufacturer = createOpenCartManufacturer(manufacturer, manufacturerReference);
    const ocManufacturerId = ocManufacturerDAO.upsert(ocManufacturer);

    if (!manufacturerReference) {
        entityReferenceDAO.createManufacturerReference(storeId, manufacturerId, ocManufacturerId);
    }

    return message;
}

function getManufacturer(manufacturerId: number): ManufacturerEntity {
    const manufacturerDAO = new ManufacturerDAO();
    const manufacturer = manufacturerDAO.findById(manufacturerId);
    if (!manufacturer) {
        throwError(`Missing manufacture with id [${manufacturerId}]`);
    }
    return manufacturer!;
}

function createOpenCartManufacturer(manufacturer: ManufacturerEntity, manufacturerReference: EntityReferenceEntity | null): OpenCartManufacturerCreateEntity | OpenCartManufacturerUpdateEntity {
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

function throwError(errorMessage: string) {
    logger.error(errorMessage);
    throw new Error(errorMessage);
}
