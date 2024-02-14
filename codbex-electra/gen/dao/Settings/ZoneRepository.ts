import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ZoneEntity {
    readonly Id: number;
    Country?: number;
    Name?: string;
    Status?: number;
    Code?: string;
}

export interface ZoneCreateEntity {
    readonly Country?: number;
    readonly Name?: string;
    readonly Status?: number;
    readonly Code?: string;
}

export interface ZoneUpdateEntity extends ZoneCreateEntity {
    readonly Id: number;
}

export interface ZoneEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Country?: number | number[];
            Name?: string | string[];
            Status?: number | number[];
            Code?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Country?: number | number[];
            Name?: string | string[];
            Status?: number | number[];
            Code?: string | string[];
        };
        contains?: {
            Id?: number;
            Country?: number;
            Name?: string;
            Status?: number;
            Code?: string;
        };
        greaterThan?: {
            Id?: number;
            Country?: number;
            Name?: string;
            Status?: number;
            Code?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Country?: number;
            Name?: string;
            Status?: number;
            Code?: string;
        };
        lessThan?: {
            Id?: number;
            Country?: number;
            Name?: string;
            Status?: number;
            Code?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Country?: number;
            Name?: string;
            Status?: number;
            Code?: string;
        };
    },
    $select?: (keyof ZoneEntity)[],
    $sort?: string | (keyof ZoneEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ZoneEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ZoneEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class ZoneRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_ZONE",
        properties: [
            {
                name: "Id",
                column: "ZONE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Country",
                column: "ZONE_COUNTRY",
                type: "INTEGER",
            },
            {
                name: "Name",
                column: "ZONE_NAME",
                type: "VARCHAR",
            },
            {
                name: "Status",
                column: "ZONE_STATUS",
                type: "INTEGER",
            },
            {
                name: "Code",
                column: "ZONE_CODE",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(ZoneRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ZoneEntityOptions): ZoneEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ZoneEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ZoneCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_ZONE",
            entity: entity,
            key: {
                name: "Id",
                column: "ZONE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ZoneUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_ZONE",
            entity: entity,
            key: {
                name: "Id",
                column: "ZONE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ZoneCreateEntity | ZoneUpdateEntity): number {
        const id = (entity as ZoneUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ZoneUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "CODBEX_ZONE",
            entity: entity,
            key: {
                name: "Id",
                column: "ZONE_ID",
                value: id
            }
        });
    }

    public count(options?: ZoneEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: ZoneEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ZONE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ZoneEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Settings/Zone", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/Settings/Zone").send(JSON.stringify(data));
    }
}