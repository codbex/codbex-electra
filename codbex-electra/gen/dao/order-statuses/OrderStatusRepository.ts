import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface OrderStatusEntity {
    readonly Id: number;
    Language: number;
    Name: string;
    Default: boolean;
}

export interface OrderStatusCreateEntity {
    readonly Language: number;
    readonly Name: string;
    readonly Default: boolean;
}

export interface OrderStatusUpdateEntity extends OrderStatusCreateEntity {
    readonly Id: number;
}

export interface OrderStatusEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Language?: number | number[];
            Name?: string | string[];
            Default?: boolean | boolean[];
        };
        notEquals?: {
            Id?: number | number[];
            Language?: number | number[];
            Name?: string | string[];
            Default?: boolean | boolean[];
        };
        contains?: {
            Id?: number;
            Language?: number;
            Name?: string;
            Default?: boolean;
        };
        greaterThan?: {
            Id?: number;
            Language?: number;
            Name?: string;
            Default?: boolean;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Language?: number;
            Name?: string;
            Default?: boolean;
        };
        lessThan?: {
            Id?: number;
            Language?: number;
            Name?: string;
            Default?: boolean;
        };
        lessThanOrEqual?: {
            Id?: number;
            Language?: number;
            Name?: string;
            Default?: boolean;
        };
    },
    $select?: (keyof OrderStatusEntity)[],
    $sort?: string | (keyof OrderStatusEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface OrderStatusEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<OrderStatusEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class OrderStatusRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_ORDERSTATUS",
        properties: [
            {
                name: "Id",
                column: "ORDERSTATUS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Language",
                column: "ORDERSTATUS_LANGUAGE",
                type: "INTEGER",
                required: true
            },
            {
                name: "Name",
                column: "ORDERSTATUS_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "Default",
                column: "ORDERSTATUS_DEFAULT",
                type: "BOOLEAN",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(OrderStatusRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: OrderStatusEntityOptions): OrderStatusEntity[] {
        return this.dao.list(options).map((e: OrderStatusEntity) => {
            EntityUtils.setBoolean(e, "Default");
            return e;
        });
    }

    public findById(id: number): OrderStatusEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "Default");
        return entity ?? undefined;
    }

    public create(entity: OrderStatusCreateEntity): number {
        EntityUtils.setBoolean(entity, "Default");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_ORDERSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "ORDERSTATUS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: OrderStatusUpdateEntity): void {
        EntityUtils.setBoolean(entity, "Default");
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_ORDERSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "ORDERSTATUS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: OrderStatusCreateEntity | OrderStatusUpdateEntity): number {
        const id = (entity as OrderStatusUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as OrderStatusUpdateEntity);
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
            table: "CODBEX_ORDERSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "ORDERSTATUS_ID",
                value: id
            }
        });
    }

    public count(options?: OrderStatusEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_ORDERSTATUS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: OrderStatusEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-order-statuses-OrderStatus", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-order-statuses-OrderStatus").send(JSON.stringify(data));
    }
}
