import { query } from "sdk/db";
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
                autoIncrement: false,
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

    constructor(dataSource: string) {
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
        return this.dao.insert(entity);
    }

    public update(entity: oc_attributeUpdateEntity): void {
        this.dao.update(entity);
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
        this.dao.remove(id);
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

}