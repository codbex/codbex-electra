import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface AttributeGroupEntity {
    readonly Id: number;
    Name: string;
}

export interface AttributeGroupCreateEntity {
    readonly Name: string;
}

export interface AttributeGroupUpdateEntity extends AttributeGroupCreateEntity {
    readonly Id: number;
}

export interface AttributeGroupEntityOptions {
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
    $select?: (keyof AttributeGroupEntity)[],
    $sort?: string | (keyof AttributeGroupEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface AttributeGroupEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<AttributeGroupEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class AttributeGroupRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_ATTRIBUTEGROUP",
        properties: [
            {
                name: "Id",
                column: "ATTRIBUTEGROUP_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "ATTRIBUTEGROUP_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(AttributeGroupRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: AttributeGroupEntityOptions): AttributeGroupEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): AttributeGroupEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: AttributeGroupCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_ATTRIBUTEGROUP",
            entity: entity,
            key: {
                name: "Id",
                column: "ATTRIBUTEGROUP_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: AttributeGroupUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_ATTRIBUTEGROUP",
            entity: entity,
            key: {
                name: "Id",
                column: "ATTRIBUTEGROUP_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: AttributeGroupCreateEntity | AttributeGroupUpdateEntity): number {
        const id = (entity as AttributeGroupUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as AttributeGroupUpdateEntity);
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
            table: "CODBEX_ATTRIBUTEGROUP",
            entity: entity,
            key: {
                name: "Id",
                column: "ATTRIBUTEGROUP_ID",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ATTRIBUTEGROUP"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: AttributeGroupEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Products/AttributeGroup", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/Products/AttributeGroup").send(JSON.stringify(data));
    }
}