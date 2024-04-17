import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ZoneStatusEntity {
    readonly Id: number;
    Name: string;
}

export interface ZoneStatusCreateEntity {
    readonly Name: string;
}

export interface ZoneStatusUpdateEntity extends ZoneStatusCreateEntity {
    readonly Id: number;
}

export interface ZoneStatusEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
    },
    $select?: (keyof ZoneStatusEntity)[],
    $sort?: string | (keyof ZoneStatusEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ZoneStatusEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ZoneStatusEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class ZoneStatusRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_ZONESTATUS",
        properties: [
            {
                name: "Id",
                column: "ZONESTATUS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "ZONESTATUS_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ZoneStatusRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ZoneStatusEntityOptions): ZoneStatusEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ZoneStatusEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ZoneStatusCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_ZONESTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "ZONESTATUS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ZoneStatusUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_ZONESTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "ZONESTATUS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ZoneStatusCreateEntity | ZoneStatusUpdateEntity): number {
        const id = (entity as ZoneStatusUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ZoneStatusUpdateEntity);
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
            table: "CODBEX_ZONESTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "ZONESTATUS_ID",
                value: id
            }
        });
    }

    public count(options?: ZoneStatusEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ZONESTATUS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ZoneStatusEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-zone-statuses-ZoneStatus", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-zone-statuses-ZoneStatus").send(JSON.stringify(data));
    }
}
