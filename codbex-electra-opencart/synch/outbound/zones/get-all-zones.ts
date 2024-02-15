import { ZoneRepository as ZoneDAO, ZoneEntityOptions } from "../../../../codbex-electra/gen/dao/Settings/ZoneRepository";
import { StoreEntry } from "../get-all-relevant-stores";
import { BaseHandler } from "../base-handler";

export function onMessage(message: any) {
    const store: StoreEntry = message.getBody();

    const handler = new GetStoreZonesHandler(store);
    const zoneEntries = handler.handle();

    message.setBody(zoneEntries);
    return message;
}

export interface ZoneEntry {
    readonly zoneId: number;
    readonly store: StoreEntry;
}

class GetStoreZonesHandler extends BaseHandler {
    private readonly store;
    private readonly zoneDAO;

    constructor(store: StoreEntry) {
        super(import.meta.url);
        this.store = store;
        this.zoneDAO = new ZoneDAO();
    }

    handle() {
        const querySettings: ZoneEntityOptions = {
            $select: ["Id"]
        };
        const zones = this.zoneDAO.findAll(querySettings);
        this.logger.info("Found [{}] zones which must be replicated to store [{}]", zones.length, this.store.name);

        const entries: ZoneEntry[] = [];
        zones.forEach((zone) => {
            const entry = {
                zoneId: zone.Id,
                store: this.store
            }
            entries.push(entry);
        });
        return entries;
    }
}