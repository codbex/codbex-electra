import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface SalesOrderItemEntity {
    readonly Id: number;
    Product?: number;
    SalesOrder: number;
    Name?: string;
    Model?: string;
    Quantity?: number;
    Price?: number;
    Total?: number;
    Tax?: number;
}

export interface SalesOrderItemCreateEntity {
    readonly Product?: number;
    readonly SalesOrder: number;
    readonly Name?: string;
    readonly Model?: string;
    readonly Quantity?: number;
    readonly Price?: number;
    readonly Total?: number;
    readonly Tax?: number;
}

export interface SalesOrderItemUpdateEntity extends SalesOrderItemCreateEntity {
    readonly Id: number;
}

export interface SalesOrderItemEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Product?: number | number[];
            SalesOrder?: number | number[];
            Name?: string | string[];
            Model?: string | string[];
            Quantity?: number | number[];
            Price?: number | number[];
            Total?: number | number[];
            Tax?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Product?: number | number[];
            SalesOrder?: number | number[];
            Name?: string | string[];
            Model?: string | string[];
            Quantity?: number | number[];
            Price?: number | number[];
            Total?: number | number[];
            Tax?: number | number[];
        };
        contains?: {
            Id?: number;
            Product?: number;
            SalesOrder?: number;
            Name?: string;
            Model?: string;
            Quantity?: number;
            Price?: number;
            Total?: number;
            Tax?: number;
        };
        greaterThan?: {
            Id?: number;
            Product?: number;
            SalesOrder?: number;
            Name?: string;
            Model?: string;
            Quantity?: number;
            Price?: number;
            Total?: number;
            Tax?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Product?: number;
            SalesOrder?: number;
            Name?: string;
            Model?: string;
            Quantity?: number;
            Price?: number;
            Total?: number;
            Tax?: number;
        };
        lessThan?: {
            Id?: number;
            Product?: number;
            SalesOrder?: number;
            Name?: string;
            Model?: string;
            Quantity?: number;
            Price?: number;
            Total?: number;
            Tax?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Product?: number;
            SalesOrder?: number;
            Name?: string;
            Model?: string;
            Quantity?: number;
            Price?: number;
            Total?: number;
            Tax?: number;
        };
    },
    $select?: (keyof SalesOrderItemEntity)[],
    $sort?: string | (keyof SalesOrderItemEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SalesOrderItemEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SalesOrderItemEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class SalesOrderItemRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SALESORDERITEM",
        properties: [
            {
                name: "Id",
                column: "ORDERITEM_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Product",
                column: "ORDERITEM_PRODUCT",
                type: "INTEGER",
            },
            {
                name: "SalesOrder",
                column: "ORDERITEM_SALESORDER",
                type: "INTEGER",
                required: true
            },
            {
                name: "Name",
                column: "ORDERITEM_NAME",
                type: "VARCHAR",
            },
            {
                name: "Model",
                column: "ORDERITEM_MODEL",
                type: "VARCHAR",
            },
            {
                name: "Quantity",
                column: "ORDERITEM_QUANTITY",
                type: "INTEGER",
            },
            {
                name: "Price",
                column: "ORDERITEM_PRICE",
                type: "DECIMAL",
            },
            {
                name: "Total",
                column: "ORDERITEM_TOTAL",
                type: "DECIMAL",
            },
            {
                name: "Tax",
                column: "ORDERITEM_TAX",
                type: "DECIMAL",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(SalesOrderItemRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SalesOrderItemEntityOptions): SalesOrderItemEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): SalesOrderItemEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: SalesOrderItemCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SALESORDERITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "ORDERITEM_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: SalesOrderItemUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SALESORDERITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "ORDERITEM_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: SalesOrderItemCreateEntity | SalesOrderItemUpdateEntity): number {
        const id = (entity as SalesOrderItemUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SalesOrderItemUpdateEntity);
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
            table: "CODBEX_SALESORDERITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "ORDERITEM_ID",
                value: id
            }
        });
    }

    public count(options?: SalesOrderItemEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: SalesOrderItemEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERITEM"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: SalesOrderItemEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/SalesOrders/SalesOrderItem", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/SalesOrders/SalesOrderItem").send(JSON.stringify(data));
    }
}