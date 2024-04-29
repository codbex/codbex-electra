import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface AttributeEntity {
    readonly Id: number;
    Group: number;
    Name: string;
}

export interface AttributeCreateEntity {
    readonly Group: number;
    readonly Name: string;
}

export interface AttributeUpdateEntity extends AttributeCreateEntity {
    readonly Id: number;
}

export interface AttributeEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Group?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Group?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            Group?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            Group?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Group?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            Group?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Group?: number;
            Name?: string;
        };
    },
    $select?: (keyof AttributeEntity)[],
    $sort?: string | (keyof AttributeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface AttributeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<AttributeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class AttributeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_ATTRIBUTE",
        properties: [
            {
                name: "Id",
                column: "ATTRIBUTE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
                required: true
            },
            {
                name: "Group",
                column: "ATTRIBUTE_GROUP",
                type: "INTEGER",
                required: true
            },
            {
                name: "Name",
                column: "ATTRIBUTE_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(AttributeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: AttributeEntityOptions): AttributeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): AttributeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: AttributeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_ATTRIBUTE",
            entity: entity,
            key: {
                name: "Id",
                column: "ATTRIBUTE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: AttributeUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_ATTRIBUTE",
            entity: entity,
            key: {
                name: "Id",
                column: "ATTRIBUTE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: AttributeCreateEntity | AttributeUpdateEntity): number {
        const id = (entity as AttributeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as AttributeUpdateEntity);
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
            table: "CODBEX_ATTRIBUTE",
            entity: entity,
            key: {
                name: "Id",
                column: "ATTRIBUTE_ID",
                value: id
            }
        });
    }

    public count(options?: AttributeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ATTRIBUTE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: AttributeEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-product-attributes-Attribute", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-product-attributes-Attribute").send(JSON.stringify(data));
    }
}
