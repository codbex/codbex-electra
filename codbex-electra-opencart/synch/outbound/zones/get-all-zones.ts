import { ZoneRepository as ZoneDAO, ZoneEntityOptions } from "codbex-electra/gen/dao/zones/ZoneRepository";
import { OpenCartStoreConfig } from "codbex-electra-opencart/dao/StoreConfigDAO";
import { BaseHandler } from "codbex-electra-opencart/synch/base-handler";

export function onMessage(message: any) {
    const store: OpenCartStoreConfig = message.getBody();

    const handler = new GetStoreZonesHandler(store);
    const zoneEntries = handler.handle();

    message.setBody(zoneEntries);
    return message;
}

export interface ZoneEntry {
    readonly zoneId: number;
    readonly store: OpenCartStoreConfig;
}

class GetStoreZonesHandler extends BaseHandler {
    private readonly store;
    private readonly zoneDAO;

    constructor(store: OpenCartStoreConfig) {
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