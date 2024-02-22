import { query } from "sdk/db";
import { dao as daoApi } from "sdk/db";

export interface oc_attribute_groupEntity {
    readonly attribute_group_id: number;
    sort_order: number;
}

export interface oc_attribute_groupCreateEntity {
    readonly sort_order: number;
}

export interface oc_attribute_groupUpdateEntity extends oc_attribute_groupCreateEntity {
    readonly attribute_group_id: number;
}

export interface oc_attribute_groupEntityOptions {
    $filter?: {
        equals?: {
            attribute_group_id?: number | number[];
            sort_order?: number | number[];
        };
        notEquals?: {
            attribute_group_id?: number | number[];
            sort_order?: number | number[];
        };
        contains?: {
            attribute_group_id?: number;
            sort_order?: number;
        };
        greaterThan?: {
            attribute_group_id?: number;
            sort_order?: number;
        };
        greaterThanOrEqual?: {
            attribute_group_id?: number;
            sort_order?: number;
        };
        lessThan?: {
            attribute_group_id?: number;
            sort_order?: number;
        };
        lessThanOrEqual?: {
            attribute_group_id?: number;
            sort_order?: number;
        };
    },
    $select?: (keyof oc_attribute_groupEntity)[],
    $sort?: string | (keyof oc_attribute_groupEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_attribute_groupEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_attribute_groupEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_attribute_groupRepository {

    private static readonly DEFINITION = {
        table: "oc_attribute_group",
        properties: [
            {
                name: "attribute_group_id",
                column: "attribute_group_id",
                type: "INT",
                id: true,
                autoIncrement: false,
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
        this.dao = daoApi.create(oc_attribute_groupRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_attribute_groupEntityOptions): oc_attribute_groupEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): oc_attribute_groupEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: oc_attribute_groupCreateEntity): number {
        return this.dao.insert(entity);
    }

    public update(entity: oc_attribute_groupUpdateEntity): void {
        this.dao.update(entity);
    }

    public upsert(entity: oc_attribute_groupCreateEntity | oc_attribute_groupUpdateEntity): number {
        const id = (entity as oc_attribute_groupUpdateEntity).attribute_group_id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as oc_attribute_groupUpdateEntity);
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
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_attribute_group"');
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