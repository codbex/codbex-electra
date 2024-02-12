import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface StoreConfigurationPropertyEntity {
    readonly Id: number;
    Name: string;
}

export interface StoreConfigurationPropertyCreateEntity {
    readonly Name: string;
}

export interface StoreConfigurationPropertyUpdateEntity extends StoreConfigurationPropertyCreateEntity {
    readonly Id: number;
}

export interface StoreConfigurationPropertyEntityOptions {
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
    $select?: (keyof StoreConfigurationPropertyEntity)[],
    $sort?: string | (keyof StoreConfigurationPropertyEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface StoreConfigurationPropertyEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<StoreConfigurationPropertyEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class StoreConfigurationPropertyRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_STORECONFIGURATIONPROPERTY",
        properties: [
            {
                name: "Id",
                column: "STORECONFIGURATIONPROPERTY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "STORECONFIGURATIONPROPERTY_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(StoreConfigurationPropertyRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: StoreConfigurationPropertyEntityOptions): StoreConfigurationPropertyEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): StoreConfigurationPropertyEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: StoreConfigurationPropertyCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_STORECONFIGURATIONPROPERTY",
            entity: entity,
            key: {
                name: "Id",
                column: "STORECONFIGURATIONPROPERTY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: StoreConfigurationPropertyUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_STORECONFIGURATIONPROPERTY",
            entity: entity,
            key: {
                name: "Id",
                column: "STORECONFIGURATIONPROPERTY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: StoreConfigurationPropertyCreateEntity | StoreConfigurationPropertyUpdateEntity): number {
        const id = (entity as StoreConfigurationPropertyUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as StoreConfigurationPropertyUpdateEntity);
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
            table: "CODBEX_STORECONFIGURATIONPROPERTY",
            entity: entity,
            key: {
                name: "Id",
                column: "STORECONFIGURATIONPROPERTY_ID",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_STORECONFIGURATIONPROPERTY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: StoreConfigurationPropertyEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Stores/StoreConfigurationProperty", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/Stores/StoreConfigurationProperty").send(JSON.stringify(data));
    }
}