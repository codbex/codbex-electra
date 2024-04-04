import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface StoreTypeEntity {
    readonly Id: number;
    Name: string;
}

export interface StoreTypeCreateEntity {
    readonly Name: string;
}

export interface StoreTypeUpdateEntity extends StoreTypeCreateEntity {
    readonly Id: number;
}

export interface StoreTypeEntityOptions {
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
    $select?: (keyof StoreTypeEntity)[],
    $sort?: string | (keyof StoreTypeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface StoreTypeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<StoreTypeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class StoreTypeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_STORETYPE",
        properties: [
            {
                name: "Id",
                column: "STORETYPE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
                required: true
            },
            {
                name: "Name",
                column: "STORETYPE_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(StoreTypeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: StoreTypeEntityOptions): StoreTypeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): StoreTypeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: StoreTypeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_STORETYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "STORETYPE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: StoreTypeUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_STORETYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "STORETYPE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: StoreTypeCreateEntity | StoreTypeUpdateEntity): number {
        const id = (entity as StoreTypeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as StoreTypeUpdateEntity);
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
            table: "CODBEX_STORETYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "STORETYPE_ID",
                value: id
            }
        });
    }

    public count(options?: StoreTypeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_STORETYPE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: StoreTypeEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-Stores-StoreType", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-Stores-StoreType").send(JSON.stringify(data));
    }
}
