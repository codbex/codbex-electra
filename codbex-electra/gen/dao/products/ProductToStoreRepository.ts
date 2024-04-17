import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ProductToStoreEntity {
    readonly Id: number;
    Product: number;
    Store: number;
}

export interface ProductToStoreCreateEntity {
    readonly Product: number;
    readonly Store: number;
}

export interface ProductToStoreUpdateEntity extends ProductToStoreCreateEntity {
    readonly Id: number;
}

export interface ProductToStoreEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Product?: number | number[];
            Store?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Product?: number | number[];
            Store?: number | number[];
        };
        contains?: {
            Id?: number;
            Product?: number;
            Store?: number;
        };
        greaterThan?: {
            Id?: number;
            Product?: number;
            Store?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Product?: number;
            Store?: number;
        };
        lessThan?: {
            Id?: number;
            Product?: number;
            Store?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Product?: number;
            Store?: number;
        };
    },
    $select?: (keyof ProductToStoreEntity)[],
    $sort?: string | (keyof ProductToStoreEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ProductToStoreEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductToStoreEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class ProductToStoreRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCTTOSTORE",
        properties: [
            {
                name: "Id",
                column: "PRODUCTTOSTORE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
                required: true
            },
            {
                name: "Product",
                column: "PRODUCTTOSTORE_PRODUCT",
                type: "INTEGER",
                required: true
            },
            {
                name: "Store",
                column: "PRODUCTTOSTORE_STORE",
                type: "INTEGER",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ProductToStoreRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ProductToStoreEntityOptions): ProductToStoreEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ProductToStoreEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ProductToStoreCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCTTOSTORE",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTTOSTORE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProductToStoreUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PRODUCTTOSTORE",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTTOSTORE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProductToStoreCreateEntity | ProductToStoreUpdateEntity): number {
        const id = (entity as ProductToStoreUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProductToStoreUpdateEntity);
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
            table: "CODBEX_PRODUCTTOSTORE",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTTOSTORE_ID",
                value: id
            }
        });
    }

    public count(options?: ProductToStoreEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTTOSTORE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProductToStoreEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-products-ProductToStore", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-products-ProductToStore").send(JSON.stringify(data));
    }
}
