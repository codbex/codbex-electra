import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface StockStatusEntity {
    readonly Id: number;
    Language: number;
    Name: string;
}

export interface StockStatusCreateEntity {
    readonly Language: number;
    readonly Name: string;
}

export interface StockStatusUpdateEntity extends StockStatusCreateEntity {
    readonly Id: number;
}

export interface StockStatusEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Language?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Language?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            Language?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            Language?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Language?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            Language?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Language?: number;
            Name?: string;
        };
    },
    $select?: (keyof StockStatusEntity)[],
    $sort?: string | (keyof StockStatusEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface StockStatusEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<StockStatusEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class StockStatusRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_STOCKSTATUS",
        properties: [
            {
                name: "Id",
                column: "STOCKSTATUS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Language",
                column: "STOCKSTATUS_LANGUAGE",
                type: "INTEGER",
                required: true
            },
            {
                name: "Name",
                column: "STOCKSTATUS_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(StockStatusRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: StockStatusEntityOptions): StockStatusEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): StockStatusEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: StockStatusCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_STOCKSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "STOCKSTATUS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: StockStatusUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_STOCKSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "STOCKSTATUS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: StockStatusCreateEntity | StockStatusUpdateEntity): number {
        const id = (entity as StockStatusUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as StockStatusUpdateEntity);
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
            table: "CODBEX_STOCKSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "STOCKSTATUS_ID",
                value: id
            }
        });
    }

    public count(options?: StockStatusEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: StockStatusEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_STOCKSTATUS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: StockStatusEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Settings/StockStatus", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/Settings/StockStatus").send(JSON.stringify(data));
    }
}