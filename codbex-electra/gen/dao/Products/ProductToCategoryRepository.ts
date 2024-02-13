import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ProductToCategoryEntity {
    readonly Id: number;
    Category: number;
    Product: number;
}

export interface ProductToCategoryCreateEntity {
    readonly Category: number;
    readonly Product: number;
}

export interface ProductToCategoryUpdateEntity extends ProductToCategoryCreateEntity {
    readonly Id: number;
}

export interface ProductToCategoryEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Category?: number | number[];
            Product?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Category?: number | number[];
            Product?: number | number[];
        };
        contains?: {
            Id?: number;
            Category?: number;
            Product?: number;
        };
        greaterThan?: {
            Id?: number;
            Category?: number;
            Product?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Category?: number;
            Product?: number;
        };
        lessThan?: {
            Id?: number;
            Category?: number;
            Product?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Category?: number;
            Product?: number;
        };
    },
    $select?: (keyof ProductToCategoryEntity)[],
    $sort?: string | (keyof ProductToCategoryEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ProductToCategoryEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductToCategoryEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class ProductToCategoryRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCTTOCATEGORY",
        properties: [
            {
                name: "Id",
                column: "PRODUCTTOCATEGORY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Category",
                column: "PRODUCTTOCATEGORY_CATEGORY",
                type: "INTEGER",
                required: true
            },
            {
                name: "Product",
                column: "PRODUCTTOCATEGORY_PRODUCT",
                type: "INTEGER",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(ProductToCategoryRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ProductToCategoryEntityOptions): ProductToCategoryEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ProductToCategoryEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ProductToCategoryCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCTTOCATEGORY",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTTOCATEGORY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProductToCategoryUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PRODUCTTOCATEGORY",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTTOCATEGORY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProductToCategoryCreateEntity | ProductToCategoryUpdateEntity): number {
        const id = (entity as ProductToCategoryUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProductToCategoryUpdateEntity);
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
            table: "CODBEX_PRODUCTTOCATEGORY",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTTOCATEGORY_ID",
                value: id
            }
        });
    }



    public count(Product: number): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTTOCATEGORY" WHERE "PRODUCTTOCATEGORY_PRODUCT" = ?', [Product]);
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTTOCATEGORY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProductToCategoryEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Products/ProductToCategory", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/Products/ProductToCategory").send(JSON.stringify(data));
    }
}