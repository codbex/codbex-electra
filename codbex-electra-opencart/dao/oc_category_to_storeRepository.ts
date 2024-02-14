import { query } from "sdk/db";
import { dao as daoApi } from "sdk/db";

export interface oc_category_to_storeEntity {
    readonly category_id: number;
    readonly store_id: number;
}

export interface oc_category_to_storeCreateEntity {
}

export interface oc_category_to_storeUpdateEntity extends oc_category_to_storeCreateEntity {
    readonly category_id: number;
    readonly store_id: number;
}

export interface oc_category_to_storeEntityOptions {
    $filter?: {
        equals?: {
            category_id?: number | number[];
            store_id?: number | number[];
        };
        notEquals?: {
            category_id?: number | number[];
            store_id?: number | number[];
        };
        contains?: {
            category_id?: number;
            store_id?: number;
        };
        greaterThan?: {
            category_id?: number;
            store_id?: number;
        };
        greaterThanOrEqual?: {
            category_id?: number;
            store_id?: number;
        };
        lessThan?: {
            category_id?: number;
            store_id?: number;
        };
        lessThanOrEqual?: {
            category_id?: number;
            store_id?: number;
        };
    },
    $select?: (keyof oc_category_to_storeEntity)[],
    $sort?: string | (keyof oc_category_to_storeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_category_to_storeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_category_to_storeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_category_to_storeRepository {

    private static readonly DEFINITION = {
        table: "oc_category_to_store",
        properties: [
            {
                name: "category_id",
                column: "category_id",
                type: "INT",
                id: true,
                autoIncrement: false,
                required: true
            },
            {
                name: "store_id",
                column: "store_id",
                type: "INT",
                id: true,
                autoIncrement: false,
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(oc_category_to_storeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_category_to_storeEntityOptions): oc_category_to_storeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): oc_category_to_storeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: oc_category_to_storeCreateEntity): number {
        return this.dao.insert(entity);
    }

    public update(entity: oc_category_to_storeUpdateEntity): void {
        this.dao.update(entity);
    }

    public upsert(entity: oc_category_to_storeCreateEntity | oc_category_to_storeUpdateEntity): void {
        const querySettings = {
            $filter: {
                equals: {
                    category_id: entity.category_id,
                    store_id: entity.store_id
                }
            }
        };
        const entries = this.findAll(querySettings);
        if (entries.length === 0) {
            this.create(entity);
        }
        // update not needed in this case
    }

    public deleteById(id: number): void {
        this.dao.remove(id);
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_category_to_store"');
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