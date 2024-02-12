import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface oc_attributeEntity {
    readonly attribute_id: number;
    attribute_group_id: number;
    sort_order: number;
}

export interface oc_attributeCreateEntity {
    readonly attribute_group_id: number;
    readonly sort_order: number;
}

export interface oc_attributeUpdateEntity extends oc_attributeCreateEntity {
    readonly attribute_id: number;
}

export interface oc_attributeEntityOptions {
    $filter?: {
        equals?: {
            attribute_id?: number | number[];
            attribute_group_id?: number | number[];
            sort_order?: number | number[];
        };
        notEquals?: {
            attribute_id?: number | number[];
            attribute_group_id?: number | number[];
            sort_order?: number | number[];
        };
        contains?: {
            attribute_id?: number;
            attribute_group_id?: number;
            sort_order?: number;
        };
        greaterThan?: {
            attribute_id?: number;
            attribute_group_id?: number;
            sort_order?: number;
        };
        greaterThanOrEqual?: {
            attribute_id?: number;
            attribute_group_id?: number;
            sort_order?: number;
        };
        lessThan?: {
            attribute_id?: number;
            attribute_group_id?: number;
            sort_order?: number;
        };
        lessThanOrEqual?: {
            attribute_id?: number;
            attribute_group_id?: number;
            sort_order?: number;
        };
    },
    $select?: (keyof oc_attributeEntity)[],
    $sort?: string | (keyof oc_attributeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_attributeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_attributeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_attributeRepository {

    private static readonly DEFINITION = {
        table: "oc_attribute",
        properties: [
            {
                name: "attribute_id",
                column: "attribute_id",
                type: "INT",
                id: true,
                autoIncrement: true,
                required: true
            },
            {
                name: "attribute_group_id",
                column: "attribute_group_id",
                type: "INT",
                required: true
            },
            {
                name: "sort_order",
                column: "sort_order",
                type: "INT",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(oc_attributeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_attributeEntityOptions): oc_attributeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): oc_attributeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: oc_attributeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "oc_attribute",
            entity: entity,
            key: {
                name: "attribute_id",
                column: "attribute_id",
                value: id
            }
        });
        return id;
    }

    public update(entity: oc_attributeUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "oc_attribute",
            entity: entity,
            key: {
                name: "attribute_id",
                column: "attribute_id",
                value: entity.attribute_id
            }
        });
    }

    public upsert(entity: oc_attributeCreateEntity | oc_attributeUpdateEntity): number {
        const id = (entity as oc_attributeUpdateEntity).attribute_id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as oc_attributeUpdateEntity);
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
            table: "oc_attribute",
            entity: entity,
            key: {
                name: "attribute_id",
                column: "attribute_id",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_attribute"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: oc_attributeEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("DemoStoreOpenCartDB/oc_attribute/oc_attribute", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("DemoStoreOpenCartDB/oc_attribute/oc_attribute").send(JSON.stringify(data));
    }
}