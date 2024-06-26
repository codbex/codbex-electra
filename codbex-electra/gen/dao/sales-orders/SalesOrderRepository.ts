import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
// custom imports
import { NumberGeneratorService } from "/codbex-number-generator/service/generator";

export interface SalesOrderEntity {
    readonly Id: number;
    Number: string;
    Store: number;
    Status: number;
    Total: number;
    SubTotal: number;
    Tax: number;
    Shipping: number;
    Currency: number;
    Customer: number;
    DateAdded?: Date;
    DateModified: Date;
    UpdatedBy: string;
    Tracking?: string;
    Comment?: string;
    InvoiceNumber?: number;
    InvoicePrefix?: string;
    Language: number;
}

export interface SalesOrderCreateEntity {
    readonly Store: number;
    readonly Status: number;
    readonly Total: number;
    readonly SubTotal: number;
    readonly Tax: number;
    readonly Shipping: number;
    readonly Currency: number;
    readonly Customer: number;
    readonly Tracking?: string;
    readonly Comment?: string;
    readonly InvoiceNumber?: number;
    readonly InvoicePrefix?: string;
    readonly Language: number;
}

export interface SalesOrderUpdateEntity extends SalesOrderCreateEntity {
    readonly Id: number;
}

export interface SalesOrderEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Number?: string | string[];
            Store?: number | number[];
            Status?: number | number[];
            Total?: number | number[];
            SubTotal?: number | number[];
            Tax?: number | number[];
            Shipping?: number | number[];
            Currency?: number | number[];
            Customer?: number | number[];
            DateAdded?: Date | Date[];
            DateModified?: Date | Date[];
            UpdatedBy?: string | string[];
            Tracking?: string | string[];
            Comment?: string | string[];
            InvoiceNumber?: number | number[];
            InvoicePrefix?: string | string[];
            Language?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Number?: string | string[];
            Store?: number | number[];
            Status?: number | number[];
            Total?: number | number[];
            SubTotal?: number | number[];
            Tax?: number | number[];
            Shipping?: number | number[];
            Currency?: number | number[];
            Customer?: number | number[];
            DateAdded?: Date | Date[];
            DateModified?: Date | Date[];
            UpdatedBy?: string | string[];
            Tracking?: string | string[];
            Comment?: string | string[];
            InvoiceNumber?: number | number[];
            InvoicePrefix?: string | string[];
            Language?: number | number[];
        };
        contains?: {
            Id?: number;
            Number?: string;
            Store?: number;
            Status?: number;
            Total?: number;
            SubTotal?: number;
            Tax?: number;
            Shipping?: number;
            Currency?: number;
            Customer?: number;
            DateAdded?: Date;
            DateModified?: Date;
            UpdatedBy?: string;
            Tracking?: string;
            Comment?: string;
            InvoiceNumber?: number;
            InvoicePrefix?: string;
            Language?: number;
        };
        greaterThan?: {
            Id?: number;
            Number?: string;
            Store?: number;
            Status?: number;
            Total?: number;
            SubTotal?: number;
            Tax?: number;
            Shipping?: number;
            Currency?: number;
            Customer?: number;
            DateAdded?: Date;
            DateModified?: Date;
            UpdatedBy?: string;
            Tracking?: string;
            Comment?: string;
            InvoiceNumber?: number;
            InvoicePrefix?: string;
            Language?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Number?: string;
            Store?: number;
            Status?: number;
            Total?: number;
            SubTotal?: number;
            Tax?: number;
            Shipping?: number;
            Currency?: number;
            Customer?: number;
            DateAdded?: Date;
            DateModified?: Date;
            UpdatedBy?: string;
            Tracking?: string;
            Comment?: string;
            InvoiceNumber?: number;
            InvoicePrefix?: string;
            Language?: number;
        };
        lessThan?: {
            Id?: number;
            Number?: string;
            Store?: number;
            Status?: number;
            Total?: number;
            SubTotal?: number;
            Tax?: number;
            Shipping?: number;
            Currency?: number;
            Customer?: number;
            DateAdded?: Date;
            DateModified?: Date;
            UpdatedBy?: string;
            Tracking?: string;
            Comment?: string;
            InvoiceNumber?: number;
            InvoicePrefix?: string;
            Language?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Number?: string;
            Store?: number;
            Status?: number;
            Total?: number;
            SubTotal?: number;
            Tax?: number;
            Shipping?: number;
            Currency?: number;
            Customer?: number;
            DateAdded?: Date;
            DateModified?: Date;
            UpdatedBy?: string;
            Tracking?: string;
            Comment?: string;
            InvoiceNumber?: number;
            InvoicePrefix?: string;
            Language?: number;
        };
    },
    $select?: (keyof SalesOrderEntity)[],
    $sort?: string | (keyof SalesOrderEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SalesOrderEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SalesOrderEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface SalesOrderUpdateEntityEvent extends SalesOrderEntityEvent {
    readonly previousEntity: SalesOrderEntity;
}

export class SalesOrderRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SALESORDER",
        properties: [
            {
                name: "Id",
                column: "SALESORDER_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Number",
                column: "SALESORDER_NUMBER",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Store",
                column: "SALESORDER_STORE",
                type: "INTEGER",
                required: true
            },
            {
                name: "Status",
                column: "SALESORDER_STATUS",
                type: "INTEGER",
                required: true
            },
            {
                name: "Total",
                column: "SALESORDER_TOTAL",
                type: "DECIMAL",
                required: true
            },
            {
                name: "SubTotal",
                column: "SALESORDER_SUBTOTAL",
                type: "DECIMAL",
                required: true
            },
            {
                name: "Tax",
                column: "SALESORDER_TAX",
                type: "DECIMAL",
                required: true
            },
            {
                name: "Shipping",
                column: "SALESORDER_SHIPPING",
                type: "DECIMAL",
                required: true
            },
            {
                name: "Currency",
                column: "SALESORDER_CURRENCY",
                type: "INTEGER",
                required: true
            },
            {
                name: "Customer",
                column: "SALESORDER_CUSTOMER",
                type: "INTEGER",
                required: true
            },
            {
                name: "DateAdded",
                column: "SALESORDER_DATEADDED",
                type: "TIMESTAMP",
            },
            {
                name: "DateModified",
                column: "SALESORDER_DATEMODIFIED",
                type: "TIMESTAMP",
                required: true
            },
            {
                name: "UpdatedBy",
                column: "SALESORDER_UPDATEDBY",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Tracking",
                column: "SALESORDER_TRACKING",
                type: "VARCHAR",
            },
            {
                name: "Comment",
                column: "SALESORDER_COMMENT",
                type: "VARCHAR",
            },
            {
                name: "InvoiceNumber",
                column: "SALESORDER_INVOICENUMBER",
                type: "INTEGER",
            },
            {
                name: "InvoicePrefix",
                column: "SALESORDER_INVOICEPREFIX",
                type: "VARCHAR",
            },
            {
                name: "Language",
                column: "SALESORDER_LANGUAGE",
                type: "INTEGER",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(SalesOrderRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SalesOrderEntityOptions): SalesOrderEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): SalesOrderEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: SalesOrderCreateEntity): number {
        // @ts-ignore
        (entity as SalesOrderEntity).Number = new NumberGeneratorService().generate(4);
        // @ts-ignore
        (entity as SalesOrderEntity).DateAdded = Date.now();
        // @ts-ignore
        (entity as SalesOrderEntity).DateModified = Date.now();
        // @ts-ignore
        (entity as SalesOrderEntity).UpdatedBy = require("security/user").getName();
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SALESORDER",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESORDER_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: SalesOrderUpdateEntity): void {
        // @ts-ignore
        (entity as SalesOrderEntity).DateModified = Date.now();
        // @ts-ignore
        (entity as SalesOrderEntity).UpdatedBy = require("security/user").getName();
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SALESORDER",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "SALESORDER_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: SalesOrderCreateEntity | SalesOrderUpdateEntity): number {
        const id = (entity as SalesOrderUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SalesOrderUpdateEntity);
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
            table: "CODBEX_SALESORDER",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESORDER_ID",
                value: id
            }
        });
    }

    public count(options?: SalesOrderEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDER"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: SalesOrderEntityEvent | SalesOrderUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-sales-orders-SalesOrder", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-sales-orders-SalesOrder").send(JSON.stringify(data));
    }
}
