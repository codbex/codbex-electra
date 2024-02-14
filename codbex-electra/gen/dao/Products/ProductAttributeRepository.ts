import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ProductAttributeEntity {
    readonly Id: number;
    Product: number;
    Attribute: number;
    Language: number;
    Text: string;
}

export interface ProductAttributeCreateEntity {
    readonly Product: number;
    readonly Attribute: number;
    readonly Language: number;
    readonly Text: string;
}

export interface ProductAttributeUpdateEntity extends ProductAttributeCreateEntity {
    readonly Id: number;
}

export interface ProductAttributeEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Product?: number | number[];
            Attribute?: number | number[];
            Language?: number | number[];
            Text?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Product?: number | number[];
            Attribute?: number | number[];
            Language?: number | number[];
            Text?: string | string[];
        };
        contains?: {
            Id?: number;
            Product?: number;
            Attribute?: number;
            Language?: number;
            Text?: string;
        };
        greaterThan?: {
            Id?: number;
            Product?: number;
            Attribute?: number;
            Language?: number;
            Text?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Product?: number;
            Attribute?: number;
            Language?: number;
            Text?: string;
        };
        lessThan?: {
            Id?: number;
            Product?: number;
            Attribute?: number;
            Language?: number;
            Text?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Product?: number;
            Attribute?: number;
            Language?: number;
            Text?: string;
        };
    },
    $select?: (keyof ProductAttributeEntity)[],
    $sort?: string | (keyof ProductAttributeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ProductAttributeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductAttributeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class ProductAttributeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCTATTRIBUTE",
        properties: [
            {
                name: "Id",
                column: "PRODUCTATTRIBUTE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
                required: true
            },
            {
                name: "Product",
                column: "PRODUCTATTRIBUTE_PRODUCT",
                type: "INTEGER",
                required: true
            },
            {
                name: "Attribute",
                column: "PRODUCTATTRIBUTE_ATTRIBUTE",
                type: "INTEGER",
                required: true
            },
            {
                name: "Language",
                column: "PRODUCTATTRIBUTE_LANGUAGE",
                type: "INTEGER",
                required: true
            },
            {
                name: "Text",
                column: "PRODUCTATTRIBUTE_TEXT",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(ProductAttributeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ProductAttributeEntityOptions): ProductAttributeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ProductAttributeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ProductAttributeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCTATTRIBUTE",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTATTRIBUTE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProductAttributeUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PRODUCTATTRIBUTE",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTATTRIBUTE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProductAttributeCreateEntity | ProductAttributeUpdateEntity): number {
        const id = (entity as ProductAttributeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProductAttributeUpdateEntity);
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
            table: "CODBEX_PRODUCTATTRIBUTE",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTATTRIBUTE_ID",
                value: id
            }
        });
    }

    public count(options?: ProductAttributeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: ProductAttributeEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTATTRIBUTE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProductAttributeEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/Products/ProductAttribute", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/Products/ProductAttribute").send(JSON.stringify(data));
    }
}