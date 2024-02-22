import { query } from "sdk/db";
import { dao as daoApi } from "sdk/db";

export interface oc_order_productEntity {
    readonly order_product_id: number;
    order_id: number;
    product_id: number;
    name: string;
    model: string;
    quantity: number;
    price: number;
    total: number;
    tax: number;
    reward: number;
}

export interface oc_order_productCreateEntity {
    readonly order_id: number;
    readonly product_id: number;
    readonly name: string;
    readonly model: string;
    readonly quantity: number;
    readonly price: number;
    readonly total: number;
    readonly tax: number;
    readonly reward: number;
}

export interface oc_order_productUpdateEntity extends oc_order_productCreateEntity {
    readonly order_product_id: number;
}

export interface oc_order_productEntityOptions {
    $filter?: {
        equals?: {
            order_product_id?: number | number[];
            order_id?: number | number[];
            product_id?: number | number[];
            name?: string | string[];
            model?: string | string[];
            quantity?: number | number[];
            price?: number | number[];
            total?: number | number[];
            tax?: number | number[];
            reward?: number | number[];
        };
        notEquals?: {
            order_product_id?: number | number[];
            order_id?: number | number[];
            product_id?: number | number[];
            name?: string | string[];
            model?: string | string[];
            quantity?: number | number[];
            price?: number | number[];
            total?: number | number[];
            tax?: number | number[];
            reward?: number | number[];
        };
        contains?: {
            order_product_id?: number;
            order_id?: number;
            product_id?: number;
            name?: string;
            model?: string;
            quantity?: number;
            price?: number;
            total?: number;
            tax?: number;
            reward?: number;
        };
        greaterThan?: {
            order_product_id?: number;
            order_id?: number;
            product_id?: number;
            name?: string;
            model?: string;
            quantity?: number;
            price?: number;
            total?: number;
            tax?: number;
            reward?: number;
        };
        greaterThanOrEqual?: {
            order_product_id?: number;
            order_id?: number;
            product_id?: number;
            name?: string;
            model?: string;
            quantity?: number;
            price?: number;
            total?: number;
            tax?: number;
            reward?: number;
        };
        lessThan?: {
            order_product_id?: number;
            order_id?: number;
            product_id?: number;
            name?: string;
            model?: string;
            quantity?: number;
            price?: number;
            total?: number;
            tax?: number;
            reward?: number;
        };
        lessThanOrEqual?: {
            order_product_id?: number;
            order_id?: number;
            product_id?: number;
            name?: string;
            model?: string;
            quantity?: number;
            price?: number;
            total?: number;
            tax?: number;
            reward?: number;
        };
    },
    $select?: (keyof oc_order_productEntity)[],
    $sort?: string | (keyof oc_order_productEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface oc_order_productEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<oc_order_productEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class oc_order_productRepository {

    private static readonly DEFINITION = {
        table: "oc_order_product",
        properties: [
            {
                name: "order_product_id",
                column: "order_product_id",
                type: "INT",
                id: true,
                autoIncrement: true,
                required: false
            },
            {
                name: "order_id",
                column: "order_id",
                type: "INT",
                required: true
            },
            {
                name: "product_id",
                column: "product_id",
                type: "INT",
                required: true
            },
            {
                name: "name",
                column: "name",
                type: "VARCHAR",
                required: true
            },
            {
                name: "model",
                column: "model",
                type: "VARCHAR",
                required: true
            },
            {
                name: "quantity",
                column: "quantity",
                type: "INT",
                required: true
            },
            {
                name: "price",
                column: "price",
                type: "DECIMAL",
                required: true
            },
            {
                name: "total",
                column: "total",
                type: "DECIMAL",
                required: true
            },
            {
                name: "tax",
                column: "tax",
                type: "DECIMAL",
                required: true
            },
            {
                name: "reward",
                column: "reward",
                type: "INT",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(oc_order_productRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: oc_order_productEntityOptions): oc_order_productEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): oc_order_productEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: oc_order_productCreateEntity): number {
        return this.dao.insert(entity);
    }

    public update(entity: oc_order_productUpdateEntity): void {
        this.dao.update(entity);
    }

    public upsert(entity: oc_order_productCreateEntity | oc_order_productUpdateEntity): number {
        const id = (entity as oc_order_productUpdateEntity).order_product_id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as oc_order_productUpdateEntity);
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
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "oc_order_product"');
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