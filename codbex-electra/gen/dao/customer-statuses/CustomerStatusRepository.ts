import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface CustomerStatusEntity {
    readonly Id: number;
    Name?: string;
}

export interface CustomerStatusCreateEntity {
    readonly Name?: string;
}

export interface CustomerStatusUpdateEntity extends CustomerStatusCreateEntity {
    readonly Id: number;
}

export interface CustomerStatusEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
    },
    $select?: (keyof CustomerStatusEntity)[],
    $sort?: string | (keyof CustomerStatusEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CustomerStatusEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CustomerStatusEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class CustomerStatusRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_CUSTOMERSTATUS",
        properties: [
            {
                name: "Id",
                column: "CUSTOMERSTATUS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "CUSTOMERSTATUS_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(CustomerStatusRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CustomerStatusEntityOptions): CustomerStatusEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): CustomerStatusEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: CustomerStatusCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_CUSTOMERSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "CUSTOMERSTATUS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CustomerStatusUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_CUSTOMERSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "CUSTOMERSTATUS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CustomerStatusCreateEntity | CustomerStatusUpdateEntity): number {
        const id = (entity as CustomerStatusUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CustomerStatusUpdateEntity);
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
            table: "CODBEX_CUSTOMERSTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "CUSTOMERSTATUS_ID",
                value: id
            }
        });
    }

    public count(options?: CustomerStatusEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CUSTOMERSTATUS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CustomerStatusEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-electra-customer-statuses-CustomerStatus", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-electra-customer-statuses-CustomerStatus").send(JSON.stringify(data));
    }
}
