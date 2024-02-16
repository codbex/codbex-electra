import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface StoreEntity {
    readonly Id: number;
    Name: string;
    Url?: string;
    Type: number;
    Enabled?: boolean;
}

export interface StoreCreateEntity {
    readonly Name: string;
    readonly Url?: string;
    readonly Type: number;
    readonly Enabled?: boolean;
}

export interface StoreUpdateEntity extends StoreCreateEntity {
    readonly Id: number;
}

export interface StoreEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Url?: string | string[];
            Type?: number | number[];
            Enabled?: boolean | boolean[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Url?: string | string[];
            Type?: number | number[];
            Enabled?: boolean | boolean[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Url?: string;
            Type?: number;
            Enabled?: boolean;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Url?: string;
            Type?: number;
            Enabled?: boolean;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Url?: string;
            Type?: number;
            Enabled?: boolean;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Url?: string;
            Type?: number;
            Enabled?: boolean;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Url?: string;
            Type?: number;
            Enabled?: boolean;
        };
    },
    $select?: (keyof StoreEntity)[],
    $sort?: string | (keyof StoreEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface StoreEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<StoreEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class StoreRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_STORE",
        properties: [
            {
                name: "Id",
                column: "STORE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "STORE_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Url",
                column: "STORE_URL",
                type: "VARCHAR",
            },
            {
                name: "Type",
                column: "STORE_TYPE",
                type: "INTEGER",
                required: true
            },
            {
                name: "Enabled",
                column: "STORE_ENABLED",
                type: "BOOLEAN",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(StoreRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: StoreEntityOptions): StoreEntity[] {
        return this.dao.list(options).map((e: StoreEntity) => {
            EntityUtils.setBoolean(e, "Enabled");
            return e;
        });
    }

    public findById(id: number): StoreEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "Enabled");
        return entity ?? undefined;
    }

    public create(entity: StoreCreateEntity): number {
        EntityUtils.setBoolean(entity, "Enabled");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_STORE",
            entity: entity,
            key: {
                name: "Id",
                column: "STORE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: StoreUpdateEntity): void {
        EntityUtils.setBoolean(entity, "Enabled");
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_STORE",
            entity: entity,
            key: {
                name: "Id",
                column: "STORE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: StoreCreateEntity | StoreUpdateEntity): number {
        const id = (entity as StoreUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as StoreUpdateEntity);
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
            table: "CODBEX_STORE",
            entity: entity,
            key: {
                name: "Id",
                column: "STORE_ID",
                value: id
            }
        });
    }

    public count(options?: StoreEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: StoreEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_STORE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: StoreEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Stores/Store", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/Stores/Store").send(JSON.stringify(data));
    }
}