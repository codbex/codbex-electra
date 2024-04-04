import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface StoreConfigurationEntity {
    readonly Id: number;
    Store: number;
    Property: number;
    Value: string;
}

export interface StoreConfigurationCreateEntity {
    readonly Store: number;
    readonly Property: number;
    readonly Value: string;
}

export interface StoreConfigurationUpdateEntity extends StoreConfigurationCreateEntity {
    readonly Id: number;
}

export interface StoreConfigurationEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Store?: number | number[];
            Property?: number | number[];
            Value?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Store?: number | number[];
            Property?: number | number[];
            Value?: string | string[];
        };
        contains?: {
            Id?: number;
            Store?: number;
            Property?: number;
            Value?: string;
        };
        greaterThan?: {
            Id?: number;
            Store?: number;
            Property?: number;
            Value?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Store?: number;
            Property?: number;
            Value?: string;
        };
        lessThan?: {
            Id?: number;
            Store?: number;
            Property?: number;
            Value?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Store?: number;
            Property?: number;
            Value?: string;
        };
    },
    $select?: (keyof StoreConfigurationEntity)[],
    $sort?: string | (keyof StoreConfigurationEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface StoreConfigurationEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<StoreConfigurationEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class StoreConfigurationRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_STORECONFIGURATION",
        properties: [
            {
                name: "Id",
                column: "STORECONFIGURATION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
                required: true
            },
            {
                name: "Store",
                column: "STORECONFIGURATION_STORE",
                type: "INTEGER",
                required: true
            },
            {
                name: "Property",
                column: "STORECONFIGURATION_PROPERTY",
                type: "INTEGER",
                required: true
            },
            {
                name: "Value",
                column: "STORECONFIGURATION_VALUE",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(StoreConfigurationRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: StoreConfigurationEntityOptions): StoreConfigurationEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): StoreConfigurationEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: StoreConfigurationCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_STORECONFIGURATION",
            entity: entity,
            key: {
                name: "Id",
                column: "STORECONFIGURATION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: StoreConfigurationUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_STORECONFIGURATION",
            entity: entity,
            key: {
                name: "Id",
                column: "STORECONFIGURATION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: StoreConfigurationCreateEntity | StoreConfigurationUpdateEntity): number {
        const id = (entity as StoreConfigurationUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as StoreConfigurationUpdateEntity);
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
            table: "CODBEX_STORECONFIGURATION",
            entity: entity,
            key: {
                name: "Id",
                column: "STORECONFIGURATION_ID",
                value: id
            }
        });
    }

    public count(options?: StoreConfigurationEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_STORECONFIGURATION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: StoreConfigurationEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-Stores-StoreConfiguration", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-Stores-StoreConfiguration").send(JSON.stringify(data));
    }
}
