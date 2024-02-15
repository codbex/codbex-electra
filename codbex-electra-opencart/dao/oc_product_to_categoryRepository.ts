import { query } from "sdk/db";
import { dao as daoApi } from "sdk/db";

export interface oc_product_to_categoryEntity {
    readonly product_id: number;
    readonly category_id: number;
}

export interface oc_product_to_categoryCreateEntity {
}

export interface oc_product_to_categoryUpdateEntity extends oc_product_to_categoryCreateEntity {
    readonly product_id: number;
    readonly category_id: number;
}

export interface oc_product_to_categoryEntityOptions {
    $filter?: {
        equals?: {
            product_id?: number | number[];
            category_id?: number | number[];
        };
        notEquals?: {
            product_id?: number | number[];
            category_id?: number | number[];
        };
        contains?: {
            product_id?: number;
            category_id?: number;
        };
        greaterThan?: {
            product_id?: number;
            category_id?: number;
        };
        greaterThanOrEqual?: {
            product_id?: number;
            category_id?: number;
        };
        lessThan?: {
            product_id?: number;
            category_id?: number;
        };
        lessThanOrEqual?: {
            product_id?: number;
            category_id?: number;
        };
    },
    $select?: (keyof oc_product_to_categoryEntity)[],
    $sort?: string | (keyof oc_product_to_categoryEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_product_to_categoryEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_product_to_categoryEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_product_to_categoryRepository {

    private static readonly DEFINITION = {
        table: "oc_product_to_category",
        properties: [
            {
                name: "product_id",
                column: "product_id",
                type: "INT",
                id: true,
                autoIncrement: false,
                required: true
            },
            {
                name: "category_id",
                column: "category_id",
                type: "INT",
                id: true,
                autoIncrement: false,
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource: string) {
        this.dao = daoApi.create(oc_product_to_categoryRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_product_to_categoryEntityOptions): oc_product_to_categoryEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): oc_product_to_categoryEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: oc_product_to_categoryCreateEntity): number {
        return this.dao.insert(entity);
    }

    public update(entity: oc_product_to_categoryUpdateEntity): void {
        this.dao.update(entity);
    }

    public upsert(entity: oc_product_to_categoryCreateEntity | oc_product_to_categoryUpdateEntity): number {
        const querySettings = {
            $filter: {
                equals: {
                    product_id: entity.product_id,
                    category_id: entity.category_id
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
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_product_to_category"');
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