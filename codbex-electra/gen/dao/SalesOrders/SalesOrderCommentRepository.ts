import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface SalesOrderCommentEntity {
    readonly Id: number;
    Text: string;
    CreatedBy: string;
    UpdatedBy: string;
    DateAdded: Date;
    DateModified: Date;
    SalesOrder: number;
}

export interface SalesOrderCommentCreateEntity {
    readonly Text: string;
    readonly SalesOrder: number;
}

export interface SalesOrderCommentUpdateEntity extends SalesOrderCommentCreateEntity {
    readonly Id: number;
}

export interface SalesOrderCommentEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Text?: string | string[];
            CreatedBy?: string | string[];
            UpdatedBy?: string | string[];
            DateAdded?: Date | Date[];
            DateModified?: Date | Date[];
            SalesOrder?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Text?: string | string[];
            CreatedBy?: string | string[];
            UpdatedBy?: string | string[];
            DateAdded?: Date | Date[];
            DateModified?: Date | Date[];
            SalesOrder?: number | number[];
        };
        contains?: {
            Id?: number;
            Text?: string;
            CreatedBy?: string;
            UpdatedBy?: string;
            DateAdded?: Date;
            DateModified?: Date;
            SalesOrder?: number;
        };
        greaterThan?: {
            Id?: number;
            Text?: string;
            CreatedBy?: string;
            UpdatedBy?: string;
            DateAdded?: Date;
            DateModified?: Date;
            SalesOrder?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Text?: string;
            CreatedBy?: string;
            UpdatedBy?: string;
            DateAdded?: Date;
            DateModified?: Date;
            SalesOrder?: number;
        };
        lessThan?: {
            Id?: number;
            Text?: string;
            CreatedBy?: string;
            UpdatedBy?: string;
            DateAdded?: Date;
            DateModified?: Date;
            SalesOrder?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Text?: string;
            CreatedBy?: string;
            UpdatedBy?: string;
            DateAdded?: Date;
            DateModified?: Date;
            SalesOrder?: number;
        };
    },
    $select?: (keyof SalesOrderCommentEntity)[],
    $sort?: string | (keyof SalesOrderCommentEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SalesOrderCommentEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SalesOrderCommentEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class SalesOrderCommentRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SALESORDERCOMMENT",
        properties: [
            {
                name: "Id",
                column: "SALESORDERCOMMENT_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Text",
                column: "SALESORDERCOMMENT_TEXT",
                type: "VARCHAR",
                required: true
            },
            {
                name: "CreatedBy",
                column: "SALESORDERCOMMENT_CREATEDBY",
                type: "VARCHAR",
                required: true
            },
            {
                name: "UpdatedBy",
                column: "SALESORDERCOMMENT_UPDATEDBY",
                type: "VARCHAR",
                required: true
            },
            {
                name: "DateAdded",
                column: "SALESORDERCOMMENT_DATEADDED",
                type: "TIMESTAMP",
                required: true
            },
            {
                name: "DateModified",
                column: "SALESORDERCOMMENT_DATEMODIFIED",
                type: "TIMESTAMP",
                required: true
            },
            {
                name: "SalesOrder",
                column: "SALESORDERCOMMENT_SALESORDER",
                type: "INTEGER",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(SalesOrderCommentRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SalesOrderCommentEntityOptions): SalesOrderCommentEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): SalesOrderCommentEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: SalesOrderCommentCreateEntity): number {
        // @ts-ignore
        (entity as SalesOrderCommentEntity).CreatedBy = require("security/user").getName();
        // @ts-ignore
        (entity as SalesOrderCommentEntity).UpdatedBy = require("security/user").getName();
        // @ts-ignore
        (entity as SalesOrderCommentEntity).DateAdded = Date.now();
        // @ts-ignore
        (entity as SalesOrderCommentEntity).DateModified = Date.now();
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SALESORDERCOMMENT",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESORDERCOMMENT_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: SalesOrderCommentUpdateEntity): void {
        // @ts-ignore
        (entity as SalesOrderCommentEntity).UpdatedBy = require("security/user").getName();
        // @ts-ignore
        (entity as SalesOrderCommentEntity).DateModified = Date.now();
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SALESORDERCOMMENT",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESORDERCOMMENT_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: SalesOrderCommentCreateEntity | SalesOrderCommentUpdateEntity): number {
        const id = (entity as SalesOrderCommentUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SalesOrderCommentUpdateEntity);
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
            table: "CODBEX_SALESORDERCOMMENT",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESORDERCOMMENT_ID",
                value: id
            }
        });
    }

    public count(options?: SalesOrderCommentEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: SalesOrderCommentEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERCOMMENT"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: SalesOrderCommentEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra/SalesOrders/SalesOrderComment", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-electra/SalesOrders/SalesOrderComment").send(JSON.stringify(data));
    }
}